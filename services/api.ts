import { API_KEY, SHEET_IDS, RANGES } from '../constants';
import { UnifiedLead, Conversation, Meeting, WorkflowLog, AgentStatus, WebLead, Message } from '../types';

// --- Helper Functions ---

const fetchSheet = async (sheetId: string, range: string) => {
  // Encode the range to handle spaces (e.g., 'Full_context test')
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodedRange}?key=${API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
        // Graceful fallback for rate limits or empty sheets
        console.warn(`API Error ${res.status} for sheet ${sheetId}`);
        return [];
    }
    const data = await res.json();
    return data.values || [];
  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
};

// --- Core Data Sync Logic ---

export const getUnifiedData = async () => {
  // Fetch core datasets in parallel
  const [leadRows, salesRows, appointmentRows] = await Promise.all([
    fetchSheet(SHEET_IDS.LEAD_GEN, RANGES.LEADS),
    fetchSheet(SHEET_IDS.SALES_AI, RANGES.SALES),
    fetchSheet(SHEET_IDS.APPOINTMENT, RANGES.APPOINTMENT_LOGS)
  ]);

  // Index Sales Data by Email for O(1) Lookup
  const salesMap = new Map<string, any[]>();
  salesRows.forEach(row => {
    const email = row[1]?.toLowerCase();
    if (!email) return;
    if (!salesMap.has(email)) salesMap.set(email, []);
    salesMap.get(email)?.push(row);
  });

  // Map Leads
  const unifiedLeads: UnifiedLead[] = leadRows.map((row, idx) => {
    const email = row[7]?.toLowerCase() || '';
    
    // Find matching sales data
    const salesData = salesMap.get(email);
    const latestSalesRow = salesData ? salesData[salesData.length - 1] : null;

    // Determine Meeting Status (Priority: Sales Sheet > Lead Sheet)
    // Sales Sheet Col 23 (X) is "Meeting Booked"
    const isMeetingBooked = latestSalesRow ? latestSalesRow[23] === 'TRUE' : (row[23] === 'TRUE'); // Fallback to Lead sheet
    const meetingBy = latestSalesRow ? latestSalesRow[22] : ''; // Booked By

    // Metrics Calculation
    const sentCount = [row[26], row[31], row[36]].filter(v => v === 'Yes').length;
    const openCount = (parseInt(row[29] || '0') + parseInt(row[34] || '0') + parseInt(row[39] || '0'));
    const clickCount = (row[30] ? 1 : 0) + (row[35] ? 1 : 0) + (row[40] ? 1 : 0);

    return {
      id: row[0] || `lead-${idx}`,
      firstName: row[5] || 'Unknown',
      lastName: row[6] || '',
      email: row[7] || '',
      company: row[12] || '',
      jobTitle: row[13] || '',
      country: row[9] || '',
      source: row[4] || 'Outbound',
      
      status: row[45] || 'Active', // Lead Status
      score: parseInt(row[46] || '0'), // Lead Quality Score
      analysed: row[17] === 'YES',
      researchReport: row[18] || '',

      emailsSentCount: sentCount,
      emailsOpenedCount: openCount,
      emailsClickedCount: clickCount,
      replied: row[41] === 'YES' || (!!latestSalesRow), // If present in Sales AI, they likely replied/interacted
      bounced: row[55] === 'TRUE',

      conversationThreadId: latestSalesRow ? latestSalesRow[12] : undefined,
      aiReasoning: latestSalesRow ? latestSalesRow[9] : undefined,
      requiresHuman: latestSalesRow ? latestSalesRow[30] === 'TRUE' : false,

      meetingBooked: isMeetingBooked,
      meetingBookedBy: meetingBy,
      meetingDate: latestSalesRow ? latestSalesRow[24] : undefined,
      meetingLink: latestSalesRow ? latestSalesRow[27] : undefined,
      meetingPlatform: latestSalesRow ? latestSalesRow[28] : undefined,

      assignedAgent: row[47],
      nextAction: row[50],
      lastActionDate: row[52]
    };
  }).filter(l => l.email && l.email.includes('@')); // Basic validation

  return { unifiedLeads, salesRows, appointmentRows };
};

// --- Module Specific Getters ---

export const getLeads = async (): Promise<UnifiedLead[]> => {
  const { unifiedLeads } = await getUnifiedData();
  return unifiedLeads;
};

export const getConversations = async (): Promise<Conversation[]> => {
  const salesRows = await fetchSheet(SHEET_IDS.SALES_AI, RANGES.SALES);
  
  // Group by Email/ThreadID
  const threads = new Map<string, Conversation>();

  salesRows.forEach((row, idx) => {
    const email = row[1];
    if (!email) return;

    if (!threads.has(email)) {
      threads.set(email, {
        id: row[12] || `thread-${idx}`,
        leadEmail: email,
        leadName: row[2] || 'Unknown',
        lastMessage: '',
        timestamp: row[5],
        direction: (row[6] || 'inbound').toLowerCase() as any,
        aiReasoning: row[9],
        requiresHuman: row[30] === 'TRUE',
        messages: []
      });
    }

    const thread = threads.get(email)!;
    thread.messages.push({
      id: row[11] || `msg-${idx}`,
      direction: (row[6] || 'inbound').toLowerCase() as any,
      body: row[8],
      timestamp: row[5],
      type: row[7]
    });
    
    // Update latest state
    thread.lastMessage = row[8];
    thread.timestamp = row[5];
    thread.direction = (row[6] || 'inbound').toLowerCase() as any;
  });

  return Array.from(threads.values()).sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

export const getMeetings = async (): Promise<Meeting[]> => {
  const salesRows = await fetchSheet(SHEET_IDS.SALES_AI, RANGES.SALES);

  return salesRows
    .filter(row => row[23] === 'TRUE') // Filter where Meeting Booked is TRUE
    .map((row, idx) => {
      const isAi = row[22] && row[22].toLowerCase().includes('appointment');
      return {
        id: row[12] || `mtg-${idx}`,
        leadName: row[2] || 'Unknown',
        email: row[1],
        bookedBy: row[22] || 'Manual',
        isAiBooked: !!isAi,
        date: row[24],
        time: row[25] || 'TBD',
        status: 'Upcoming', // In real app, compare row[24] with Today
        link: row[27] || '',
        platform: row[28] || 'Virtual'
      };
    });
};

export const getWebLeads = async (): Promise<WebLead[]> => {
  const rows = await fetchSheet(SHEET_IDS.WEB_AI, RANGES.WEB_LEADS);
  return rows.map((row, idx) => ({
    id: row[0] || `web-${idx}`,
    email: row[4],
    intent: row[14] || 'General',
    status: row[15] || 'New',
    source: 'Website Chat',
    timestamp: row[11] || new Date().toISOString()
  }));
};

export const getWorkflowLogs = async (): Promise<WorkflowLog[]> => {
  const rows = await fetchSheet(SHEET_IDS.WORKFLOW_LOGS, RANGES.WORKFLOW);
  return rows.slice(1).reverse().map((row, idx) => ({ // Reverse for newest first
    id: row[0] || `log-${idx}`,
    workflowName: row[1],
    status: (row[13] === 'Success' ? 'Success' : row[13] === 'Running' ? 'Running' : 'Failed'),
    duration: `${row[12]}ms`,
    timestamp: row[10],
    message: row[4], // Step Name
    healthScore: parseInt(row[24]) || 100
  }));
};

export const getAgentsStatus = async (): Promise<AgentStatus[]> => {
  const logs = await getWorkflowLogs();
  const agentNames = ['Lead Scraper', 'Research Agent', 'Email Outreach Agent', 'Inbox AI', 'AI Appointment Setter', 'WebBot AI Agent'];
  
  return agentNames.map(name => {
    const agentLogs = logs.filter(l => l.workflowName === name);
    const lastLog = agentLogs[0]; // First is newest due to reverse() above
    
    // Calculate success rate
    const successCount = agentLogs.filter(l => l.status === 'Success').length;
    const totalCount = agentLogs.length || 1;
    
    return {
      name,
      status: lastLog?.status === 'Running' ? 'Running' : (lastLog?.status === 'Failed' ? 'Failed' : 'Idle'),
      lastAction: lastLog?.message || 'Waiting for trigger',
      lastRun: lastLog?.timestamp || new Date().toISOString(),
      successRate: Math.round((successCount / totalCount) * 100)
    };
  });
};