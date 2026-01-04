import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, X, ExternalLink } from 'lucide-react';
import { getLeads } from '../services/api';
import { UnifiedLead } from '../types';
import DOMPurify from 'dompurify';

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<UnifiedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<UnifiedLead | null>(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    getLeads().then(data => {
        setLeads(data);
        setLoading(false);
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hot': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Warm': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Meeting Booked': return 'bg-green-100 text-green-700 border-green-200';
      case 'Replied': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Bounced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Leads Intelligence</h2>
            <p className="text-gray-500 text-sm">Manage and track lead progression.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            Import Leads
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-64">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search leads..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <select 
                    className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option value="Hot">Hot</option>
                    <option value="Meeting Booked">Meeting Booked</option>
                </select>
            </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name / Company</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quality</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div><div className="h-3 bg-gray-200 rounded w-1/2"></div></td>
                                <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-24"></div></td>
                                <td className="px-6 py-4"><div className="h-2 bg-gray-200 rounded w-full"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                                <td className="px-6 py-4"></td>
                            </tr>
                        ))
                    ) : (
                        leads.map((lead) => (
                            <tr 
                                key={lead.id} 
                                onClick={() => setSelectedLead(lead)}
                                className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-200">
                                            {lead.firstName[0]}{lead.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{lead.firstName} {lead.lastName}</p>
                                            <p className="text-xs text-gray-500">{lead.jobTitle} at {lead.company}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 w-48">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
                                                style={{ width: `${(lead.emailsSentCount / 3) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-400 font-mono">{lead.emailsSentCount}/3</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-1">
                                     <span className={`font-bold ${lead.score > 70 ? 'text-green-600' : lead.score > 40 ? 'text-yellow-600' : 'text-gray-400'}`}>
                                        {lead.score}
                                     </span>
                                     <span className="text-xs text-gray-400">/100</span>
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-right text-gray-400">
                                    <button className="p-1 hover:bg-gray-100 rounded text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
            <span>Showing {leads.length} leads</span>
            <div className="flex gap-2">
                <button className="px-2 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                <button className="px-2 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50">Next</button>
            </div>
        </div>
      </div>

      {/* Lead Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={() => setSelectedLead(null)}></div>
            <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                <div className="p-6 border-b border-gray-200 flex justify-between items-start bg-gray-50">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-700 shadow-sm">
                            {selectedLead.firstName[0]}{selectedLead.lastName[0]}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{selectedLead.firstName} {selectedLead.lastName}</h3>
                            <p className="text-sm text-gray-500">{selectedLead.jobTitle} @ {selectedLead.company}</p>
                            <div className="flex gap-2 mt-2">
                                <span className="text-xs px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-600 flex items-center gap-1">
                                    <ExternalLink size={10} /> {selectedLead.email}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-600">
                                    {selectedLead.country}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <section>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                            AI Research Report
                        </h4>
                        <div className="prose prose-sm prose-blue bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-600">
                            {/* In a real app, use strict DOMPurify settings */}
                            <div dangerouslySetInnerHTML={{ __html: selectedLead.researchReport }} />
                        </div>
                    </section>
                    
                    <section>
                         <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Outreach Timeline
                        </h4>
                        <div className="space-y-4 ml-2 border-l-2 border-gray-100 pl-4">
                            {[1, 2, 3].map((step) => {
                                const sent = selectedLead.emailsSentCount >= step;
                                return (
                                    <div key={step} className="relative">
                                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${sent ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}></div>
                                        <div className="mb-1 flex items-center justify-between">
                                            <span className={`text-sm font-medium ${sent ? 'text-gray-900' : 'text-gray-400'}`}>Email Step #{step}</span>
                                            {sent && <span className="text-xs text-gray-400">Sent</span>}
                                        </div>
                                        <p className="text-xs text-gray-500">{sent ? 'Delivered successfully' : 'Scheduled'}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                </div>

                <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Pause Campaign
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
                        Manual Override
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Leads;