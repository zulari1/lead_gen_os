import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MousePointer, BookOpen, Send, TrendingUp, Filter, ChevronDown, ChevronUp, Users, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { getLeads } from '../services/api';
import { UnifiedLead } from '../types';

interface CampaignAnalytics {
  campaignName: string;
  listName: string;
  totalLeads: number;
  researchedLeads: number;
  
  // Stats
  totalEmailsSent: number;
  overallOpenRate: number;
  overallClickRate: number;
  overallReplyRate: number;
  
  // Sequence Stats
  email1: SequenceStats;
  email2: SequenceStats;
  email3: SequenceStats;
  
  leads: UnifiedLead[];
}

interface SequenceStats {
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
  replyRate: number; // Global reply rate attributed to this step for simplicity in display
}

const Outreach: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignAnalytics[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');

  useEffect(() => {
    getLeads().then(leads => {
        // Group by Campaign Name
        const groups = new Map<string, UnifiedLead[]>();
        leads.forEach(lead => {
            const name = lead.campaignName || 'Uncategorized';
            if (!groups.has(name)) groups.set(name, []);
            groups.get(name)?.push(lead);
        });

        // Calculate Analytics for each Campaign
        const processedCampaigns: CampaignAnalytics[] = Array.from(groups.entries()).map(([name, groupLeads]) => {
            
            const calculateStepStats = (step: 'email1' | 'email2' | 'email3'): SequenceStats => {
                const sent = groupLeads.filter(l => l.emailMetrics[step].sent).length;
                const opened = groupLeads.filter(l => l.emailMetrics[step].opened).length;
                const clicked = groupLeads.filter(l => l.emailMetrics[step].clicked).length;
                return {
                    sent,
                    opened,
                    clicked,
                    openRate: sent > 0 ? (opened / sent) * 100 : 0,
                    clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
                    replyRate: 0 // Placeholder, replies are global
                };
            };

            const email1 = calculateStepStats('email1');
            const email2 = calculateStepStats('email2');
            const email3 = calculateStepStats('email3');
            
            const totalSent = email1.sent + email2.sent + email3.sent;
            const totalOpened = email1.opened + email2.opened + email3.opened;
            const totalClicked = email1.clicked + email2.clicked + email3.clicked;
            const totalReplied = groupLeads.filter(l => l.replied).length; // Global replies

            return {
                campaignName: name,
                listName: groupLeads[0]?.listName || 'Unknown List',
                totalLeads: groupLeads.length,
                researchedLeads: groupLeads.filter(l => l.analysed).length,
                totalEmailsSent: totalSent,
                overallOpenRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
                overallClickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
                overallReplyRate: groupLeads.length > 0 ? (totalReplied / groupLeads.length) * 100 : 0, // Reply rate based on leads, not emails sent
                email1,
                email2,
                email3,
                leads: groupLeads
            };
        });

        setCampaigns(processedCampaigns);
        setLoading(false);
    });
  }, []);

  // Overall Aggregated Stats
  const overallStats = useMemo(() => {
      const active = selectedCampaign === 'all' ? campaigns : campaigns.filter(c => c.campaignName === selectedCampaign);
      if (active.length === 0) return null;

      const totalEmails = active.reduce((sum, c) => sum + c.totalEmailsSent, 0);
      const totalLeads = active.reduce((sum, c) => sum + c.totalLeads, 0);
      const avgOpen = active.reduce((sum, c) => sum + (c.overallOpenRate * c.totalEmailsSent), 0) / (totalEmails || 1);
      const avgClick = active.reduce((sum, c) => sum + (c.overallClickRate * c.totalEmailsSent), 0) / (totalEmails || 1);
      const avgReply = active.reduce((sum, c) => sum + (c.overallReplyRate * c.totalLeads), 0) / (totalLeads || 1);

      return {
          totalEmails,
          avgOpen,
          avgClick,
          avgReply
      };
  }, [campaigns, selectedCampaign]);

  const displayedCampaigns = selectedCampaign === 'all' 
    ? campaigns 
    : campaigns.filter(c => c.campaignName === selectedCampaign);

  if (loading) return (
      <div className="h-screen flex items-center justify-center flex-col gap-4 text-gray-400">
          <RefreshCw className="animate-spin text-blue-500" size={32} />
          <p>Analyzing Campaign Data...</p>
      </div>
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Outreach Command</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Campaign performance and lead orchestration.</p>
            </div>
            <div className="relative w-full md:w-auto">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select 
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="w-full md:w-auto pl-9 pr-8 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none min-w-[240px]"
                >
                    <option value="all">All Campaigns</option>
                    {campaigns.map(c => (
                        <option key={c.campaignName} value={c.campaignName}>{c.campaignName}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
        </div>

        {/* Global KPI Cards */}
        {overallStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard 
                    label="Emails Sent" 
                    value={overallStats.totalEmails.toLocaleString()} 
                    icon={Send} 
                    color="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" 
                />
                <MetricCard 
                    label="Avg Open Rate" 
                    value={`${Math.round(overallStats.avgOpen)}%`} 
                    icon={BookOpen} 
                    color="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    trend="high"
                />
                <MetricCard 
                    label="Avg Click Rate" 
                    value={`${Math.round(overallStats.avgClick)}%`} 
                    icon={MousePointer} 
                    color="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                    trend="med"
                />
                <MetricCard 
                    label="Avg Reply Rate" 
                    value={`${Math.round(overallStats.avgReply)}%`} 
                    icon={TrendingUp} 
                    color="bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400"
                    trend="low"
                />
            </div>
        )}

        {/* Campaign Cards */}
        <div className="space-y-6">
            {displayedCampaigns.map(campaign => (
                <CampaignCard key={campaign.campaignName} campaign={campaign} />
            ))}
        </div>
    </div>
  );
};

const CampaignCard: React.FC<{ campaign: CampaignAnalytics }> = ({ campaign }) => {
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden transition-all duration-300">
            {/* Card Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50 dark:bg-gray-750">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm">
                        <Mail className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{campaign.campaignName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <span>List: {campaign.listName}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-500"></span>
                            <span>{campaign.totalLeads} Leads</span>
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                    {expanded ? 'Collapse' : 'View Details'}
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            <div className="p-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <MiniMetric label="Leads" value={campaign.totalLeads} sub={`${campaign.researchedLeads} Researched`} />
                    <MiniMetric label="Emails Sent" value={campaign.totalEmailsSent} />
                    <MiniMetric label="Open Rate" value={`${Math.round(campaign.overallOpenRate)}%`} color="text-green-600 dark:text-green-400" />
                    <MiniMetric label="Reply Rate" value={`${Math.round(campaign.overallReplyRate)}%`} color="text-pink-600 dark:text-pink-400" />
                </div>

                {/* Sequence Performance */}
                <div className="mb-8">
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Sequence Performance</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SequenceBar label="Email #1" stats={campaign.email1} color="bg-blue-500" />
                        <SequenceBar label="Email #2" stats={campaign.email2} color="bg-purple-500" />
                        <SequenceBar label="Email #3" stats={campaign.email3} color="bg-pink-500" />
                    </div>
                </div>

                {/* Lead Table (Expandable) */}
                {expanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Target Lead List</h4>
                            <span className="text-xs text-gray-400">Showing top 50 leads</span>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-left text-sm min-w-[600px]">
                                <thead className="bg-gray-50 dark:bg-gray-750 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Company</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Sent</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {campaign.leads.slice(0, 50).map(lead => (
                                        <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-200">{lead.firstName} {lead.lastName}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{lead.company}</td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={lead.status} />
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">
                                                {lead.emailsSentCount}/3
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button 
                                                    onClick={() => navigate(`/leads?email=${encodeURIComponent(lead.email)}`)}
                                                    className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SequenceBar: React.FC<{ label: string; stats: SequenceStats; color: string }> = ({ label, stats, color }) => (
    <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">{label}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stats.sent} Sent</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
                <p className="text-gray-400 mb-0.5">Open Rate</p>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-gray-100">{Math.round(stats.openRate)}%</span>
                    <div className="w-12 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div className={`h-full ${color}`} style={{ width: `${stats.openRate}%` }}></div>
                    </div>
                </div>
            </div>
            <div>
                <p className="text-gray-400 mb-0.5">Click Rate</p>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-gray-100">{Math.round(stats.clickRate)}%</span>
                    <div className="w-12 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div className={`h-full ${color}`} style={{ width: `${stats.clickRate}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const MiniMetric: React.FC<{ label: string; value: string | number; sub?: string; color?: string }> = ({ label, value, sub, color }) => (
    <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className={`text-xl font-bold ${color || 'text-gray-900 dark:text-white'}`}>{value}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
    </div>
);

const MetricCard: React.FC<{ label: string; value: string; icon: any; color: string; trend?: 'high' | 'med' | 'low' }> = ({ label, value, icon: Icon, color, trend }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={20} />
        </div>
    </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    let classes = 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    if (status === 'Replied') classes = 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    if (status === 'Meeting Booked') classes = 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
    if (status === 'Bounced') classes = 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
    
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${classes}`}>
            {status}
        </span>
    );
};

export default Outreach;