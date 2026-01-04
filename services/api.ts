
import { API_KEY, SHEET_IDS, RANGES } from '../constants';
import { UnifiedLead, Conversation, Meeting, WorkflowLog, AgentStatus, WebLead, TimelineEvent } from '../types';

// --- Helper Functions ---

const fetchSheet = async (sheetId: string, range: string) => {
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodedRange}?key=${API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
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

const parseSheetDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const cleanStr = dateStr.trim();
  if (!cleanStr) return '';

  // Handle DD/MM/YYYY HH:mm:ss
  const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/;
  const match = cleanStr.match(ddmmyyyyRegex);

  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // 0-indexed
    const year = parseInt(match[3], 10);
    const hour = match[4] ? parseInt(match[4], 10) : 0;
    const minute = match[5] ? parseInt(match[5], 10) : 0;
    const second = match[6] ? parseInt(match[6], 10) : 0;
    
    const d = new Date(year, month, day, hour, minute, second);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  // Fallback for standard ISO or other formats
  const timestamp = Date.parse(cleanStr);
  if (!isNaN(timestamp)) return new Date(timestamp).toISOString();

  return cleanStr;
};

// --- Core Data Sync Logic ---

// Helper to map a raw row to a UnifiedLead object
const mapLeadRow = (row: any[], idx: number, salesMap: Map<string, any[]>): UnifiedLead => {
    const email = row[7]?.toLowerCase() || '';
    const salesData = salesMap.get(email);
    const latestSalesRow = salesData ? salesData[salesData.length - 1] : null;
    
    // Metrics
    const sentCount = [row[26], row[31], row[36]].filter(v => v === 'Yes' || v === 'TRUE').length;
    const openCount = (parseInt(row[29] || '0') + parseInt(row[34] || '0') + parseInt(row[39] || '0'));
    const clickCount = (row[30] === 'TRUE' ? 1 : 0) + (row[35] === 'TRUE' ? 1 : 0) + (row[40] === 'TRUE' ? 1 : 0);
    
    return {
      id: row[0] || `lead-${idx}`,
      firstName: row[5] || 'Unknown',
      lastName: row[6] || '',
      email: row[7] || '',
      phone: row[8] || '',
      country: row[9] || '',
      location: row[10] || '',
      industry: row[11] || '',
      company: row[12] || '',
      jobTitle: row[13] || '',
      source: row[4] || 'Outbound',
      websiteUrl: row[15] || '',
      linkedinUrl: row[16] || '',
      
      // Campaign Info
      listName: row[1] || 'General List',
      campaignName: row[2] || 'Uncategorized',

      // Status
      status: row[45] || 'Active',
      score: parseInt(row[46] || '0'),
      analysed: row[17] === 'YES',
      researchReport: row[18] || '',
      tags: row[54] ? row[54].split(',').map((t: string) => t.trim()) : [],
      optedOut: row[44] === 'TRUE',
      
      // Basic Metrics
      emailsSentCount: sentCount,
      emailsOpenedCount: openCount,
      emailsClickedCount: clickCount,
      replied: row[41] === 'YES' || (!!latestSalesRow),
      bounced: row[55] === 'TRUE',
      
      // Granular Metrics for Timeline & Analysis
      emailMetrics: {
          email1: {
              sent: row[26] === 'Yes' || row[26] === 'TRUE',
              sentAt: parseSheetDate(row[27]),
              opened: parseInt(row[29] || '0') > 0,
              openCount: parseInt(row[29] || '0'),
              clicked: row[30] === 'TRUE'
          },
          email2: {
              sent: row[31] === 'Yes' || row[31] === 'TRUE',
              sentAt: parseSheetDate(row[32]),
              opened: parseInt(row[34] || '0') > 0,
              openCount: parseInt(row[34] || '0'),
              clicked: row[35] === 'TRUE'
          },
          email3: {
              sent: row[36] === 'Yes' || row[36] === 'TRUE',
              sentAt: parseSheetDate(row[37]),
              opened: parseInt(row[39] || '0') > 0,
              openCount: parseInt(row[39] || '0'),
              clicked: row[40] === 'TRUE'
          }
      },

      // Sequence & Workflow
      sequenceStartDate: parseSheetDate(row[48]),
      sequenceStatus: row[49],
      nextAction: row[50],
      nextActionDate: parseSheetDate(row[51]),
      lastActionDate: parseSheetDate(row[52]),
      assignedAgent: row[47],

      // Sales AI Sync
      conversationThreadId: latestSalesRow ? latestSalesRow[12] : undefined,
      aiReasoning: latestSalesRow ? latestSalesRow[9] : undefined,
      requiresHuman: latestSalesRow ? latestSalesRow[30] === 'TRUE' : false,
      meetingBooked: latestSalesRow ? latestSalesRow[23] === 'TRUE' : (row[23] === 'TRUE'),
      meetingBookedBy: latestSalesRow ? latestSalesRow[22] : '',
      meetingDate: latestSalesRow ? latestSalesRow[24] : undefined,
      meetingLink: latestSalesRow ? latestSalesRow[27] : undefined,
      meetingPlatform: latestSalesRow ? latestSalesRow[28] : undefined,
    };
};

export const getUnifiedData = async () => {
  const [leadRows, salesRows, appointmentRows] = await Promise.all([
    fetchSheet(SHEET_IDS.LEAD_GEN, RANGES.LEADS),
    fetchSheet(SHEET_IDS.SALES_AI, RANGES.SALES),
    fetchSheet(SHEET_IDS.APPOINTMENT, RANGES.APPOINTMENT_LOGS)
  ]);

  const salesMap = new Map<string, any[]>();
  salesRows.forEach(row => {
    const email = row[1]?.toLowerCase();
    if (!email) return;
    if (!salesMap.has(email)) salesMap.set(email, []);
    salesMap.get(email)?.push(row);
  });

  const unifiedLeads: UnifiedLead[] = leadRows.map((row, idx) => mapLeadRow(row, idx, salesMap))
    .filter(l => l.email && l.email.includes('@'));

  return { unifiedLeads, salesRows, appointmentRows, leadRows };
};

// --- Inbox Logic (The Heavy Lifter) ---

export const getConversations = async (): Promise<Conversation[]> => {
  const { leadRows, salesRows, appointmentRows } = await getUnifiedData();
  
  // 1. Index Leads by Email
  const leadMap = new Map<string, UnifiedLead>();
  const tempSalesMap = new Map<string, any[]>();
  salesRows.forEach(row => {
     const email = row[1]?.toLowerCase();
     if(email) {
         if(!tempSalesMap.has(email)) tempSalesMap.set(email, []);
         tempSalesMap.get(email)?.push(row);
     }
  });

  leadRows.forEach((row, idx) => {
      const lead = mapLeadRow(row, idx, tempSalesMap);
      if(lead.email) leadMap.set(lead.email.toLowerCase(), lead);
  });

  // 2. Index Appointment Logs by Email
  const aptMap = new Map<string, any[]>();
  appointmentRows.forEach(row => {
      const email = row[4]?.toLowerCase();
      if(email) {
          if(!aptMap.has(email)) aptMap.set(email, []);
          aptMap.get(email)?.push(row);
      }
  });

  // 3. Group Sales Conversations (This is the anchor for the Inbox)
  const threadMap = new Map<string, Conversation>();

  // Process Sales Rows (Primary Conversation Source)
  salesRows.forEach((row, idx) => {
      const email = row[1]?.toLowerCase(); // Email Address (Col B / Index 1)
      if (!email) return;

      if (!threadMap.has(email)) {
          const leadData = leadMap.get(email) || null;
          threadMap.set(email, {
              id: row[12] || `thread-${idx}`, // Context Thread ID (Col M / Index 12)
              leadEmail: email,
              leadName: row[2] || leadData?.firstName || 'Unknown', // Name (Col C / Index 2)
              lead: leadData,
              lastMessage: '',
              lastTimestamp: '',
              requiresHuman: false,
              timeline: []
          });
      }
      
      const conv = threadMap.get(email)!;
      
      // Extract Data from Columns
      const timestampStr = row[5]; // Timestamp (Col F)
      const timestamp = timestampStr ? new Date(timestampStr).getTime() : Date.now();
      const leadMessageBody = row[8]; // Message Body (Col I) - Usually Inbound
      const aiReasoning = row[9]; // AI Reasoning (Col J)
      const aiResponse = row[10]; // AI Response (Col K) - Outbound
      
      const requiresHuman = row[30] === 'TRUE'; // Requires Human (Col AE / Index 30)
      const meetingBooked = row[23] === 'TRUE'; // Meeting Booked (Col X / Index 23)
      const meetingDetails = meetingBooked ? {
          date: row[24], // Meeting Date (Col Y)
          link: row[27], // Event-link (Col AB)
          platform: row[28] // Meeting_Platform (Col AC)
      } : undefined;

      // --- LOGIC SPLIT: Turn Single Row into Interaction Events ---

      // Event 1: The Lead's Message (Inbound)
      if (leadMessageBody) {
          conv.timeline.push({
              id: `sales-${idx}-in`,
              type: 'SALES_CHAT',
              timestamp: new Date(timestamp).toISOString(), 
              direction: 'inbound',
              body: leadMessageBody,
              metadata: { 
                  sourceSheet: 'Sales AI'
              }
          });
      }

      // Event 2: The AI's Response (Outbound)
      if (aiResponse) {
           conv.timeline.push({
              id: `sales-${idx}-out`,
              type: 'SALES_CHAT',
              timestamp: new Date(timestamp + 1000).toISOString(), 
              direction: 'outbound',
              body: aiResponse,
              metadata: {
                  sourceSheet: 'Sales AI',
                  aiReasoning: aiReasoning, 
                  meetingDetails: meetingDetails 
              }
          });
      }

      // Update Thread State
      if (requiresHuman) conv.requiresHuman = true;
  });

  // 4. Inject Campaign Data from Lead Gen Sheet (If Lead exists)
  threadMap.forEach((conv, email) => {
      const leadRow = leadRows.find(r => r[7]?.toLowerCase() === email);
      if (leadRow) {
          // Email #1
          if (leadRow[27]) { // SentAt
              conv.timeline.push({
                  id: `camp-1-${email}`,
                  type: 'CAMPAIGN_EMAIL',
                  timestamp: parseSheetDate(leadRow[27]),
                  direction: 'outbound',
                  subject: leadRow[20],
                  body: leadRow[19] || 'Campaign Email #1',
                  metadata: {
                      sourceSheet: 'Lead Gen',
                      opened: leadRow[29] > 0,
                      clicked: leadRow[30] === 'TRUE'
                  }
              });
          }
           // Email #2
           if (leadRow[35]) { // SentAt
            conv.timeline.push({
                id: `camp-2-${email}`,
                type: 'CAMPAIGN_EMAIL',
                timestamp: parseSheetDate(leadRow[35]),
                direction: 'outbound',
                subject: 'Follow-up', 
                body: leadRow[21] || 'Campaign Email #2',
                metadata: {
                    sourceSheet: 'Lead Gen',
                    opened: leadRow[34] > 0,
                    clicked: leadRow[35] === 'TRUE'
                }
            });
        }
         // Email #3
         if (leadRow[43]) { // SentAt
            conv.timeline.push({
                id: `camp-3-${email}`,
                type: 'CAMPAIGN_EMAIL',
                timestamp: parseSheetDate(leadRow[43]),
                direction: 'outbound',
                subject: leadRow[23],
                body: leadRow[22] || 'Campaign Email #3',
                metadata: {
                    sourceSheet: 'Lead Gen'
                }
            });
        }
      }
  });

  // 5. Inject Appointment Settler Data (if separate from Sales AI)
  threadMap.forEach((conv, email) => {
      const aptRows = aptMap.get(email);
      if (aptRows) {
          aptRows.forEach((row, idx) => {
              conv.timeline.push({
                  id: `apt-${idx}`,
                  type: 'APPOINTMENT_CHAT',
                  timestamp: row[6], // Message_Timestamp
                  direction: (row[7] || 'outbound').toLowerCase() as any, // Message_Direction
                  body: row[9], // Message_Text
                  metadata: {
                      sourceSheet: 'Appointment AI',
                      aiReasoning: row[10] // AI_Response/Notes
                  }
              });
          });
      }
  });

  // 6. Sort Timelines & Finalize
  const conversations = Array.from(threadMap.values()).map(conv => {
      conv.timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      if (conv.timeline.length > 0) {
          const last = conv.timeline[conv.timeline.length - 1];
          conv.lastMessage = last.body;
          conv.lastTimestamp = last.timestamp;
      }

      return conv;
  });

  return conversations.sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime());
};

// --- Standard Getters ---

export const getLeads = async (): Promise<UnifiedLead[]> => {
  const { unifiedLeads } = await getUnifiedData();
  return unifiedLeads;
};

export const getMeetings = async (): Promise<Meeting[]> => {
  const { salesRows } = await getUnifiedData();
  return salesRows
    .filter(row => row[23] === 'TRUE')
    .map((row, idx) => ({
        id: row[12] || `mtg-${idx}`,
        leadName: row[2] || 'Unknown',
        email: row[1],
        bookedBy: row[22] || 'Manual',
        isAiBooked: (row[22] || '').toLowerCase().includes('appointment'),
        date: row[24],
        time: row[25] || 'TBD',
        status: 'Upcoming',
        link: row[27] || '',
        platform: row[28] || 'Virtual'
    }));
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
  return rows.slice(1).reverse().map((row, idx) => {
    // Correctly map status by checking for 'SUCCESS' (case-insensitive)
    const rawStatus = (row[13] || '').toUpperCase();
    let status: 'Success' | 'Failed' | 'Running' = 'Failed'; // Default
    
    if (rawStatus === 'SUCCESS') status = 'Success';
    else if (rawStatus === 'RUNNING') status = 'Running';
    
    return {
      id: row[0] || `log-${idx}`,
      workflowName: row[1],
      status: status,
      duration: parseInt(row[12]) || 0,
      timestamp: row[10],
      message: row[4],
      healthScore: parseInt(row[24]) || 100,
      error: row[15],
      nextRun: row[23]
    };
  });
};

export const getAgentsStatus = async (): Promise<AgentStatus[]> => {
  const logs = await getWorkflowLogs();
  const agentNames = ['Lead Scraper', 'Research Agent', 'Email Outreach Agent', 'Inbox AI', 'AI Appointment Setter', 'WebBot AI Agent'];
  return agentNames.map(name => {
    const agentLogs = logs.filter(l => l.workflowName === name);
    const lastLog = agentLogs[0];
    const successCount = agentLogs.filter(l => l.status === 'Success').length;
    return {
      name,
      status: lastLog?.status === 'Running' ? 'Running' : (lastLog?.status === 'Failed' ? 'Failed' : 'Idle'),
      lastAction: lastLog?.message || 'Waiting for trigger',
      lastRun: lastLog?.timestamp || new Date().toISOString(),
      successRate: Math.round((successCount / (agentLogs.length || 1)) * 100)
    };
  });
};
