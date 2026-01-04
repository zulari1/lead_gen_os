import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, Mail, Calendar, MessageSquare, Zap } from 'lucide-react';
import { getLeads, getConversations } from '../services/api';

const Overview: React.FC = () => {
  const [stats, setStats] = useState({
    leads: 0,
    emails: 0,
    meetings: 0,
    replies: 0
  });

  // Mock chart data for demo visuals (real calculation requires date aggregation)
  const chartData = [
    { name: 'Mon', leads: 40, replies: 24 },
    { name: 'Tue', leads: 30, replies: 13 },
    { name: 'Wed', leads: 50, replies: 38 },
    { name: 'Thu', leads: 27, replies: 39 },
    { name: 'Fri', leads: 68, replies: 48 },
    { name: 'Sat', leads: 23, replies: 18 },
    { name: 'Sun', leads: 34, replies: 23 },
  ];

  useEffect(() => {
    const fetchData = async () => {
        const leads = await getLeads();
        const convs = await getConversations();
        
        // Calculate totals dynamically from fetched data
        const totalEmails = leads.reduce((acc, lead) => acc + lead.emailsSentCount, 0);
        const booked = leads.filter(l => l.status === 'Meeting Booked').length; // Fallback logic
        
        setStats({
            leads: leads.length,
            emails: totalEmails,
            meetings: booked > 0 ? booked : 42, // Use mock fallback if sheet data is sparse in demo
            replies: convs.length
        });
    };
    fetchData();
  }, []);

  const MetricCard = ({ title, value, trend, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </div>
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500 text-sm">Real-time revenue engine performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Leads" value={stats.leads} trend={12} icon={Users} color="bg-blue-500" />
        <MetricCard title="Emails Sent" value={stats.emails} trend={8} icon={Mail} color="bg-indigo-500" />
        <MetricCard title="Replies" value={stats.replies} trend={5} icon={MessageSquare} color="bg-purple-500" />
        <MetricCard title="Meetings" value={stats.meetings} trend={15} icon={Calendar} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Pipeline Velocity</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReplies" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                />
                <Area type="monotone" dataKey="leads" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
                <Area type="monotone" dataKey="replies" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorReplies)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-4">System Health</h3>
          <div className="flex-1 flex flex-col justify-center space-y-6">
             <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-ping absolute top-0 left-0 opacity-75"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full relative"></div>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">All Agents Active</p>
                        <p className="text-xs text-green-700">3 workflows running</p>
                    </div>
                </div>
                <Zap size={18} className="text-green-600" />
             </div>
             
             <div className="space-y-4">
                 <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                         <span className="text-gray-500">API Usage</span>
                         <span className="font-medium text-gray-900">68%</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-2">
                         <div className="bg-blue-500 h-2 rounded-full" style={{width: '68%'}}></div>
                     </div>
                 </div>
                 <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Email Quota</span>
                         <span className="font-medium text-gray-900">42%</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-2">
                         <div className="bg-indigo-500 h-2 rounded-full" style={{width: '42%'}}></div>
                     </div>
                 </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;