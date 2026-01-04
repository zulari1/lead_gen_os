export interface UnifiedLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string; // Primary Key
  company: string;
  jobTitle: string;
  country: string;
  source: string;
  
  // Status & Scoring
  status: string;
  score: number;
  analysed: boolean;
  researchReport: string; // HTML
  
  // Outreach Metrics (Lead Gen Sheet)
  emailsSentCount: number;
  emailsOpenedCount: number;
  emailsClickedCount: number;
  replied: boolean;
  bounced: boolean;
  
  // Sales AI Sync (Sales AI Sheet)
  conversationThreadId?: string;
  lastInteraction?: string;
  aiReasoning?: string;
  requiresHuman: boolean;
  
  // Meeting Info (Sales AI + Appointment Sheet)
  meetingBooked: boolean;
  meetingBookedBy?: string;
  meetingDate?: string;
  meetingLink?: string;
  meetingPlatform?: string;
  
  // Workflow
  assignedAgent?: string;
  nextAction?: string;
  lastActionDate?: string;
}

export interface Conversation {
  id: string;
  leadEmail: string;
  leadName: string;
  lastMessage: string;
  timestamp: string;
  direction: 'inbound' | 'outbound';
  aiReasoning?: string;
  requiresHuman: boolean;
  messages: Message[];
}

export interface Message {
  id: string;
  direction: 'inbound' | 'outbound';
  body: string;
  timestamp: string;
  type?: string;
}

export interface Meeting {
  id: string;
  leadName: string;
  email: string;
  date: string;
  time: string;
  platform: string;
  bookedBy: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled' | 'No-Show';
  link: string;
  isAiBooked: boolean;
}

export interface WebLead {
  id: string;
  email: string;
  intent: string;
  status: string;
  source: string;
  timestamp: string;
}

export interface WorkflowLog {
  id: string;
  workflowName: string;
  status: 'Success' | 'Failed' | 'Running';
  duration: string;
  timestamp: string;
  message: string;
  healthScore?: number;
}

export interface AgentStatus {
  name: string;
  status: 'Running' | 'Idle' | 'Standby' | 'Failed';
  lastAction: string;
  lastRun: string;
  successRate: number;
}