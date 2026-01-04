
export interface UnifiedLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string; // Primary Key
  company: string;
  jobTitle: string;
  country: string;
  source: string;
  
  // New Contact Details
  phone: string;
  location: string;
  industry: string;
  websiteUrl: string;
  linkedinUrl: string;

  // Campaign Info
  campaignName: string;
  listName: string;

  // Status & Scoring
  status: string;
  score: number;
  analysed: boolean;
  researchReport: string; // HTML
  tags: string[];
  optedOut: boolean;
  
  // Outreach Metrics (Lead Gen Sheet)
  emailsSentCount: number;
  emailsOpenedCount: number;
  emailsClickedCount: number;
  replied: boolean;
  bounced: boolean;

  // Granular Email Metrics
  emailMetrics: {
    email1: { sent: boolean; sentAt: string; opened: boolean; openCount: number; clicked: boolean };
    email2: { sent: boolean; sentAt: string; opened: boolean; openCount: number; clicked: boolean };
    email3: { sent: boolean; sentAt: string; opened: boolean; openCount: number; clicked: boolean };
  };
  
  // Sequence Details
  sequenceStatus: string;
  sequenceStartDate: string;
  nextActionDate: string;
  
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

export type EventType = 'CAMPAIGN_EMAIL' | 'SALES_CHAT' | 'APPOINTMENT_CHAT' | 'NOTE';

export interface TimelineEvent {
  id: string;
  type: EventType;
  timestamp: string;
  direction: 'inbound' | 'outbound' | 'system';
  body: string;
  subject?: string; // For emails
  
  // Metadata
  metadata?: {
    opened?: boolean;
    clicked?: boolean;
    aiReasoning?: string;
    meetingDetails?: {
        date: string;
        link: string;
        platform: string;
    };
    sourceSheet: 'Lead Gen' | 'Sales AI' | 'Appointment AI';
  };
}

export interface Conversation {
  id: string;
  leadEmail: string;
  leadName: string;
  lead: UnifiedLead | null; // Full context
  lastMessage: string;
  lastTimestamp: string;
  requiresHuman: boolean;
  timeline: TimelineEvent[];
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
  duration: number; // Changed to number (ms)
  timestamp: string;
  message: string;
  healthScore?: number;
  nextRun?: string;
  error?: string;
}

export interface AgentActivity {
  agentName: string;
  displayName: string;
  icon: any;
  type: string;
  status: 'running' | 'standby' | 'idle' | 'recovering';
  statusLabel: string;
  statusColor: string;
  currentTask: string;
  thinkingText: string;
  lastAction: string;
  lastActionTime: string;
  successRate: number;
  totalRuns: number;
  avgDuration: number;
  nextRun: string | null;
  nextRunLabel: string;
  progressPercentage: number;
  showProgressBar: boolean;
}

export interface AgentStatus {
  name: string;
  status: 'Running' | 'Idle' | 'Standby' | 'Failed';
  lastAction: string;
  lastRun: string;
  successRate: number;
}
