export const API_KEY = 'AIzaSyA4XlhMDF3Ft4eLzIf1K1B_mNB9cxSbpB0';

export const SHEET_IDS = {
  LEAD_GEN: '1f17Nk09znGFR-3YYt4Wggq_gyIQsDm9GLygx2jhtypc',
  SALES_AI: '1ZlvyF1V3r18DcvK-Icpz7NbixaWFsKC4Xe5KfVrm9rk',
  APPOINTMENT: '1710a75WB5Tjbc2ZQ151t1EKReitAmzeacyhHY5yNgfw',
  WEB_AI: '1LPg0GNVL1WT9JzRj2-sx2PO3_c7p7y2wgxZlPWTPnos',
  WORKFLOW_LOGS: '1a3uYVm3HxxdvwDlCWsa2Aiuj8wNrbj0M1FWHWqgvkrM'
};

export const RANGES = {
  LEADS: 'LeadDataMaster!A2:BP',
  SALES: 'Full_context test!A2:BD',
  APPOINTMENT_LOGS: 'Sheet1!A2:U',
  WEB_LEADS: 'Lead Data!A2:Z',
  WEB_CONVO: 'ConversationLogs!A2:BD',
  WORKFLOW: 'Sheet1!A2:Z'
};

export const WEBHOOK_URL = 'https://lead-geen-os.app.n8n.cloud/webhook';

export const TIER_FEATURES = {
  T1: { advancedReasoning: false, workflowLogs: false },
  T2: { advancedReasoning: true, workflowLogs: true },
  T3: { advancedReasoning: true, workflowLogs: true, customDomain: true }
};