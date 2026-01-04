import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Mail, MousePointer, BookOpen, Send, TrendingUp, Filter } from 'lucide-react';
import { getLeads } from '../services/api';
import { UnifiedLead } from '../types';

const Outreach: React.FC = () => {
  const [metrics, setMetrics] = useState({
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    replied: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeads().then(leads => {
        // Aggregate real data from google sheets
        const stats = leads.reduce((acc, lead) => {
            acc.sent += lead.emailsSentCount;
            acc.opened += lead.emailsOpenedCount;
            acc.clicked += lead.emailsClickedCount;
            if (lead.replied) acc.replied++;
            if (!lead.bounced) acc.delivered += lead.emailsSentCount; // Simplified delivery logic
            return acc;
        }, { sent: 0, delivered: 0, opened: 0, clicked: 0, replied: 0 });

        setMetrics(stats);
        setLoading(false);
    });
  }, []);

  const funnelData = [
      { name: 'Sent', value: metrics.sent, color: '#6366F1' },
      { name: 'Delivered', value: metrics.delivered, color: '#818CF8' },
      { name: 'Opened', value: metrics.opened, color: '#34D399' },
      { name: 'Clicked', value: metrics.clicked, color: '#FBBF24' },
      { name: 'Replied', value: metrics.replied, color: '#F472B6' }
  ];

  if (loading) return (
      <div className="flex h-96 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-end">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Campaign Intelligence</h2>
                <p className="text-gray-500 text-sm">Real-time performance of email agents.</p>
            </div>
            <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Filter size={14} /> Filter Campaign
                </button>
            </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <MetricCard label="Emails Sent" value={metrics.sent} icon={Send} color="bg-indigo-50 text-indigo-600" />
             <MetricCard label="Open Rate" value={`${metrics.sent ? Math.round((metrics.opened/metrics.sent)*100) : 0}%`} icon={BookOpen} color="bg-green-50 text-green-600" />
             <MetricCard label="Click Rate" value={`${metrics.sent ? Math.round((metrics.clicked/metrics.sent)*100) : 0}%`} icon={MousePointer} color="bg-yellow-50 text-yellow-600" />
             <MetricCard label="Reply Rate" value={`${metrics.sent ? Math.round((metrics.replied/metrics.sent)*100) : 0}%`} icon={TrendingUp} color="bg-pink-50 text-pink-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funnel Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Outreach Conversion Funnel</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={funnelData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                {funnelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* AI Optimization Insight */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-4">AI Campaign Insights</h3>
                <div className="flex-1 space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                        <h4 className="font-semibold text-blue-900 text-sm mb-1">Subject Line Optimization</h4>
                        <p className="text-xs text-blue-700">Campaign B ("Quick question regarding...") has a 12% higher open rate than Campaign A. AI is shifting traffic to B.</p>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                        <h4 className="font-semibold text-green-900 text-sm mb-1">Best Send Times</h4>
                        <p className="text-xs text-green-700">Emails sent between 9:00 AM - 11:00 AM CET correspond to 65% of all replies.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-start">
           <div>
               <p className="text-sm text-gray-500">{label}</p>
               <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
           </div>
           <div className={`p-2 rounded-lg ${color}`}><Icon size={20} /></div>
        </div>
    </div>
);

export default Outreach;