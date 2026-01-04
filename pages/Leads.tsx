import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, MoreHorizontal, X, ExternalLink, Linkedin, Globe, MapPin, Phone, Building2, Calendar, Clock, Tag, Mail, MousePointer, Eye, CheckCircle2, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { getLeads } from '../services/api';
import { UnifiedLead } from '../types';
import DOMPurify from 'dompurify';

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<UnifiedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<UnifiedLead | null>(null);
  const [filter, setFilter] = useState('All');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    getLeads().then(data => {
        setLeads(data);
        setLoading(false);

        const emailParam = searchParams.get('email');
        if (emailParam) {
             const target = data.find(l => l.email.toLowerCase() === emailParam.toLowerCase());
             if (target) setSelectedLead(target);
        }
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hot': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      case 'Warm': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'Meeting Booked': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'Replied': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'Bounced': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const ensureUrl = (url: string) => {
      if (!url) return '#';
      return url.startsWith('http') ? url : `https://${url}`;
  };

  const formatDateTime = (dateStr: string) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Leads Intelligence</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Manage and track lead progression.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm w-full md:w-auto">
            Import Leads
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-64">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search leads..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400"
                />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <select 
                    className="w-full sm:w-auto pl-3 pr-8 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
        <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-gray-50 dark:bg-gray-750 sticky top-0 z-10">
                    <tr>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name / Company</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quality</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div></td>
                                <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
                                <td className="px-6 py-4"><div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div></td>
                                <td className="px-6 py-4"></td>
                            </tr>
                        ))
                    ) : (
                        leads.map((lead) => (
                            <tr 
                                key={lead.id} 
                                onClick={() => setSelectedLead(lead)}
                                className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors group"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-bold border border-blue-200 dark:border-blue-800">
                                            {lead.firstName[0]}{lead.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{lead.firstName} {lead.lastName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{lead.jobTitle} at {lead.company}</p>
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
                                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
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
                                     <span className={`font-bold ${lead.score > 70 ? 'text-green-600 dark:text-green-400' : lead.score > 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'}`}>
                                        {lead.score}
                                     </span>
                                     <span className="text-xs text-gray-400">/100</span>
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-right text-gray-400">
                                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
            <span>Showing {leads.length} leads</span>
            <div className="flex gap-2">
                <button className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-600 dark:text-gray-300" disabled>Previous</button>
                <button className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300">Next</button>
            </div>
        </div>
      </div>

      {/* Modern Split View Lead Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={() => setSelectedLead(null)}></div>
            <div className="relative w-full max-w-5xl bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-slide-in-right">
                
                {/* 1. Header Section */}
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-start z-10 flex-shrink-0">
                    <div className="flex gap-5">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-2xl font-bold text-gray-700 dark:text-gray-200 shadow-sm">
                            {selectedLead.firstName[0]}{selectedLead.lastName[0]}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedLead.firstName} {selectedLead.lastName}</h3>
                                {selectedLead.linkedinUrl && (
                                    <a href={ensureUrl(selectedLead.linkedinUrl)} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                                        <Linkedin size={20} />
                                    </a>
                                )}
                                {selectedLead.websiteUrl && (
                                    <a href={ensureUrl(selectedLead.websiteUrl)} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                        <Globe size={20} />
                                    </a>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1.5"><Building2 size={14} /> {selectedLead.company}</span>
                                <span className="flex items-center gap-1.5"><MapPin size={14} /> {selectedLead.location || selectedLead.country}</span>
                                {selectedLead.phone && <span className="flex items-center gap-1.5"><Phone size={14} /> {selectedLead.phone}</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${getStatusColor(selectedLead.status)}`}>
                                    {selectedLead.status}
                                </span>
                                <span className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                                    <Tag size={12} /> {selectedLead.industry || 'Tech'}
                                </span>
                                {selectedLead.optedOut && (
                                    <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
                                        <AlertCircle size={12} /> Opted Out
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1">
                            <X size={24} />
                        </button>
                        <div className="hidden sm:flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600">
                             <div className="text-right">
                                 <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide">Lead Quality</p>
                                 <p className={`text-lg font-bold leading-none ${selectedLead.score > 70 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>{selectedLead.score}/100</p>
                             </div>
                             <div className="h-8 w-8">
                                 <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                     <path className="text-gray-200 dark:text-gray-600" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                     <path className={selectedLead.score > 70 ? 'text-green-500' : 'text-yellow-500'} strokeDasharray={`${selectedLead.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                 </svg>
                             </div>
                        </div>
                    </div>
                </div>

                {/* 2. Split Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-gray-50/50 dark:bg-gray-900/50">
                    
                    {/* LEFT: Context & Research (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 lg:border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                        
                        {/* Agent Status Block */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                                    <Zap size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase">Active Agent</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLead.assignedAgent || 'Lead Scraper'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Next Action</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1 justify-end">
                                    {selectedLead.nextAction || 'Wait for Reply'} <Clock size={12} />
                                </p>
                            </div>
                        </div>

                        {/* Research Report */}
                        <section>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Sparkles size={14} className="text-purple-500" />
                                AI Research Report
                            </h4>
                            <div className="prose prose-sm prose-blue dark:prose-invert bg-gray-50 dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 max-w-none shadow-sm">
                                {selectedLead.researchReport ? (
                                    <div dangerouslySetInnerHTML={{ __html: selectedLead.researchReport }} />
                                ) : (
                                    <p className="text-gray-400 italic">Analysis pending...</p>
                                )}
                            </div>
                        </section>

                        {/* Tags */}
                        {selectedLead.tags.length > 0 && (
                            <section>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedLead.tags.map((tag, i) => (
                                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded border border-gray-200 dark:border-gray-600">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* RIGHT: Activity & Timeline (Fixed/Scrollable) */}
                    <div className="w-full lg:w-96 bg-gray-50 dark:bg-gray-800 flex flex-col border-l border-gray-200 dark:border-gray-700 h-full">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm z-10">
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Outreach Timeline</h4>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            
                            {/* Sequence Start */}
                            {selectedLead.sequenceStartDate && (
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                        <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 my-1"></div>
                                    </div>
                                    <div className="pb-2">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Sequence Started</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{formatDateTime(selectedLead.sequenceStartDate)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Email Steps */}
                            {[1, 2, 3].map((step) => {
                                const metric = selectedLead.emailMetrics[`email${step}` as keyof typeof selectedLead.emailMetrics];
                                const isSent = metric.sent;
                                
                                return (
                                    <div key={step} className="flex gap-4 group">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-white dark:bg-gray-800 ${isSent ? 'border-blue-500 text-blue-500' : 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600'}`}>
                                                <Mail size={14} />
                                            </div>
                                            {step < 3 && <div className={`w-0.5 flex-1 my-1 ${isSent ? 'bg-blue-200 dark:bg-blue-900' : 'bg-gray-200 dark:bg-gray-700'}`}></div>}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className={`text-sm font-bold ${isSent ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>Email Step #{step}</p>
                                                {isSent && <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{formatDateTime(metric.sentAt)}</span>}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{isSent ? 'Sent successfully via Agent' : 'Scheduled'}</p>
                                            
                                            {/* Interaction Sub-events */}
                                            {isSent && (
                                                <div className="space-y-2 pl-2 border-l-2 border-gray-100 dark:border-gray-700">
                                                    {metric.opened && (
                                                        <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded w-fit">
                                                            <Eye size={12} /> Opened {metric.openCount > 1 ? `(${metric.openCount}x)` : ''}
                                                        </div>
                                                    )}
                                                    {metric.clicked && (
                                                        <div className="flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded w-fit">
                                                            <MousePointer size={12} /> Link Clicked
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Final State */}
                            {selectedLead.replied && (
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 text-blue-600 flex items-center justify-center z-10">
                                            <CheckCircle2 size={16} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Lead Replied</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Conversation moved to Inbox AI</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end gap-3 z-10">
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                        Pause Sequence
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