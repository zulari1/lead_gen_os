import React, { useEffect, useState } from 'react';
import { getWebLeads } from '../services/api';
import { WebLead } from '../types';
import { Globe, MessageCircle, Target, UserPlus, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const WebsiteAI: React.FC = () => {
  const [leads, setLeads] = useState<WebLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWebLeads().then(data => {
        setLeads(data);
        setLoading(false);
    });
  }, []);

  const chartData = [
    { name: 'Mon', visitors: 120, leads: 5 },
    { name: 'Tue', visitors: 132, leads: 8 },
    { name: 'Wed', visitors: 101, leads: 4 },
    { name: 'Thu', visitors: 154, leads: 12 },
    { name: 'Fri', visitors: 190, leads: 15 },
    { name: 'Sat', visitors: 80, leads: 3 },
    { name: 'Sun', visitors: 90, leads: 4 },
  ];

  if (loading) return <div className="p-12 text-center text-gray-400">Syncing Web Data...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Website Intelligence</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Inbound traffic analysis and chatbot conversions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <MetricBox label="Leads Captured" value={leads.length} icon={UserPlus} color="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30" />
             <MetricBox label="Qualified" value={leads.filter(l => l.status === 'Qualified').length} icon={Target} color="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30" />
             <MetricBox label="Conversations" value={142} icon={MessageCircle} color="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30" />
             <MetricBox label="Conv. Rate" value="4.2%" icon={Globe} color="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Live Inbound Feed</h3>
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium px-2 py-1 bg-green-50 dark:bg-green-900/30 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Live
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-750 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                            <tr>
                                <th className="px-6 py-3">Visitor</th>
                                <th className="px-6 py-3">Detected Intent</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Captured</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {leads.slice(0, 8).map(lead => (
                                <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{lead.email || 'Anonymous'}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{lead.source}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{lead.intent}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={lead.status} />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(lead.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Traffic Conversion</h3>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" hide />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#1F2937', borderRadius: '8px', border: 'none', color: '#F3F4F6'}}
                                itemStyle={{color: '#E5E7EB'}}
                            />
                            <Area type="monotone" dataKey="visitors" stroke="#94A3B8" fill="transparent" strokeDasharray="3 3" />
                            <Area type="monotone" dataKey="leads" stroke="#3B82F6" fill="url(#colorTraffic)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                     <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Insight</p>
                     <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">Pricing page visitors are converting 3x higher when "Pricing Helper" agent is active.</p>
                 </div>
            </div>
        </div>
    </div>
  );
};

const MetricBox = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-start">
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${color}`}><Icon size={20} /></div>
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    const styles = status === 'Qualified' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    return (
        <span className={`text-xs px-2 py-1 rounded-full border ${styles}`}>
            {status}
        </span>
    );
};

export default WebsiteAI;