import React, { useEffect, useState } from 'react';
import { getConversations } from '../services/api';
import { Conversation, TimelineEvent } from '../types';
import { Search, User, Sparkles, MessageSquare, AlertTriangle, Mail, Calendar, Video, Paperclip, ChevronLeft, CheckCircle2, Clock, MousePointer, BrainCircuit } from 'lucide-react';
import DOMPurify from 'dompurify';

const Inbox: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConversations().then(data => {
        setConversations(data);
        // Only select first on large screens by default, or keep behavior consistent but handle view state in render
        if(window.innerWidth >= 768 && data.length > 0 && !selectedId) {
             setSelectedId(data[0].id);
        }
        setLoading(false);
    });
  }, []);

  const selectedConversation = conversations.find(c => c.id === selectedId);

  // --- Renderers ---

  const renderTimelineEvent = (event: TimelineEvent) => {
    const isAi = event.direction === 'outbound';
    
    // 1. Campaign Emails (Lead Gen OS)
    if (event.type === 'CAMPAIGN_EMAIL') {
        return (
            <div key={event.id} className="flex flex-col items-center my-8 animate-fade-in">
                <div className="w-full max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="bg-gray-50 dark:bg-gray-750 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-blue-100 dark:bg-blue-900/40 rounded text-blue-600 dark:text-blue-400"><Mail size={12} /></div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Outreach Campaign</span>
                            <span className="text-xs text-gray-400">• {new Date(event.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2 text-[10px] font-medium uppercase">
                            <span className={`px-1.5 py-0.5 rounded border ${event.metadata?.opened ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'}`}>
                                {event.metadata?.opened ? 'Opened' : 'Sent'}
                            </span>
                            {event.metadata?.clicked && (
                                <span className="px-1.5 py-0.5 rounded border bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 flex items-center gap-1">
                                    <MousePointer size={8} /> Clicked
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="p-5">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{event.subject}</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300 font-serif leading-relaxed space-y-2 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                            {event.body.split('<br>').map((line, i) => <p key={i}>{line}</p>)}
                        </div>
                    </div>
                </div>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 my-1"></div>
            </div>
        );
    }

    // 2. Chat Messages (Sales AI & Appointment)
    return (
        <div key={event.id} className={`flex w-full mb-8 ${isAi ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isAi ? 'items-end' : 'items-start'}`}>
                
                <div className={`flex gap-3 ${isAi ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border shadow-sm mt-1 ${isAi ? 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                        {isAi ? <Sparkles size={14} /> : <User size={14} />}
                    </div>

                    {/* Bubble */}
                    <div className="flex flex-col gap-1 min-w-0">
                        <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                            isAi 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-none'
                        }`}>
                            {event.body}
                        </div>

                        {/* Metadata & Timestamp */}
                        <div className={`flex items-center gap-2 text-[10px] text-gray-400 ${isAi ? 'justify-end' : 'justify-start'}`}>
                            <span>{new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span>•</span>
                            <span className="capitalize">{event.metadata?.sourceSheet?.replace('Sheet', '')}</span>
                        </div>
                    </div>
                </div>

                {/* AI Context Block (Only for AI Messages) */}
                {isAi && (event.metadata?.aiReasoning || event.metadata?.meetingDetails) && (
                    <div className="mt-3 mr-12 bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900 rounded-xl p-4 shadow-sm w-full max-w-md relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        
                        {/* Reasoning */}
                        {event.metadata?.aiReasoning && (
                            <div className="mb-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <BrainCircuit size={12} className="text-indigo-500" />
                                    <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wide">AI Reasoning</span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 italic leading-snug pl-5 border-l border-gray-100 dark:border-gray-700">
                                    "{event.metadata.aiReasoning}"
                                </p>
                            </div>
                        )}

                        {/* Meeting Card */}
                        {event.metadata?.meetingDetails && (
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-100 dark:border-green-800 flex items-start gap-3">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-md border border-green-100 dark:border-green-800 text-green-600 shadow-sm">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-green-800 dark:text-green-400 uppercase mb-0.5">Meeting Confirmed</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{event.metadata.meetingDetails.date}</p>
                                    <div className="flex gap-3 mt-1">
                                        {event.metadata.meetingDetails.link && (
                                            <a href={event.metadata.meetingDetails.link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                                <Video size={10} /> Join Link
                                            </a>
                                        )}
                                        <span className="text-xs text-gray-500">{event.metadata.meetingDetails.platform}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-gray-400">Loading Intelligence...</div>;

  return (
    <div className="h-[calc(100vh-6rem)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm flex overflow-hidden">
        
        {/* LEFT PANE: Thread List (Hidden on Mobile if Chat Open) */}
        <div className={`w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-800 flex-shrink-0 ${selectedId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search leads..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.map(conv => (
                    <div 
                        key={conv.id}
                        onClick={() => setSelectedId(conv.id)}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group ${selectedId === conv.id ? 'bg-white dark:bg-gray-700 border-l-4 border-l-blue-500 shadow-sm z-10' : 'border-l-4 border-l-transparent'}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`font-semibold text-sm truncate pr-2 ${selectedId === conv.id ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{conv.leadName}</span>
                            <span className="text-[10px] text-gray-400 flex-shrink-0">{conv.lastTimestamp ? new Date(conv.lastTimestamp).toLocaleDateString() : ''}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-1">
                            {conv.lead?.status === 'Meeting Booked' && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{conv.lead?.company || 'Unknown Company'}</p>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-1 italic">
                            "{conv.lastMessage || 'No interaction yet'}"
                        </p>
                        {conv.requiresHuman && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 w-fit px-2 py-0.5 rounded border border-red-100 dark:border-red-900">
                                <AlertTriangle size={10} /> ACTION REQUIRED
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* CENTER PANE: Unified Feed (Visible on Mobile if Selected) */}
        <div className={`flex-1 flex flex-col bg-[#F3F4F6] dark:bg-gray-900 relative min-w-0 ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
            {selectedConversation ? (
                <>
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center shadow-sm z-10 flex-shrink-0">
                        <div className="flex items-center gap-3">
                             <button onClick={() => setSelectedId(null)} className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded">
                                 <ChevronLeft size={20} />
                             </button>
                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm border border-blue-200 dark:border-blue-800">
                                {selectedConversation.leadName.substring(0,2).toUpperCase()}
                             </div>
                             <div>
                                 <h3 className="font-bold text-gray-900 dark:text-white">{selectedConversation.leadName}</h3>
                                 <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                     <Mail size={10} /> {selectedConversation.leadEmail}
                                 </p>
                             </div>
                        </div>
                        <div className="flex gap-2">
                            {selectedConversation.requiresHuman && (
                                <button className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-md shadow hover:bg-red-700 flex items-center gap-1">
                                    <AlertTriangle size={12} /> Take Over
                                </button>
                            )}
                            {selectedConversation.lead?.status === 'Meeting Booked' && (
                                <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-md border border-green-200 dark:border-green-800 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Booked
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline Feed */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div className="text-center mb-8">
                            <span className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-medium">Timeline Started</span>
                        </div>
                        
                        {selectedConversation.timeline.length === 0 && (
                            <div className="text-center text-gray-400 py-10 italic">
                                No interactions recorded across Lead Gen, Sales, or Appointment sheets.
                            </div>
                        )}

                        {selectedConversation.timeline.map(event => renderTimelineEvent(event))}
                        
                        {/* Anchor for auto-scroll */}
                        <div className="h-4"></div>
                    </div>

                    {/* Input Area (Visual Only) */}
                    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <div className="relative">
                            <input disabled type="text" placeholder="AI Agent is active. Pause to type manually..." className="w-full pl-4 pr-12 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none cursor-not-allowed opacity-60 text-gray-500 dark:text-gray-400" />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                <button disabled className="p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"><Paperclip size={18} /></button>
                                <button disabled className="p-2 text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"><MessageSquare size={18} /></button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <MessageSquare size={64} className="mb-4 opacity-10" />
                    <p className="font-medium">Select a conversation to load context</p>
                </div>
            )}
        </div>

        {/* RIGHT PANE: Intelligence Dossier (Hidden on Mobile/Tablet usually, or show on XL) */}
        {selectedConversation && selectedConversation.lead && (
            <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 overflow-y-auto hidden xl:block">
                <div className="p-6 space-y-8">
                    {/* Status Card */}
                    <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Lead Status</h4>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Score</span>
                            <span className={`text-lg font-bold ${selectedConversation.lead.score > 70 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>{selectedConversation.lead.score}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mb-4">
                            <div className={`h-1.5 rounded-full ${selectedConversation.lead.score > 70 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${selectedConversation.lead.score}%`}}></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
                                <p className="text-[10px] text-gray-400">Sent</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedConversation.lead.emailsSentCount}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
                                <p className="text-[10px] text-gray-400">Opened</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedConversation.lead.emailsOpenedCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Research Report */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <Sparkles size={12} className="text-purple-500" /> Research Report
                        </h4>
                        <div className="prose prose-sm prose-indigo dark:prose-invert bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800 text-xs text-gray-700 dark:text-gray-300 max-h-96 overflow-y-auto scrollbar-thin">
                             {/* Safely render HTML report */}
                             {selectedConversation.lead.researchReport ? (
                                 <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedConversation.lead.researchReport) }} />
                             ) : (
                                 <p className="italic text-gray-400">Research pending...</p>
                             )}
                        </div>
                    </div>

                    {/* Company Info */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Profile</h4>
                        <div className="space-y-3">
                            <div className="flex gap-3 items-start">
                                <div className="mt-0.5"><User size={14} className="text-gray-400" /></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">{selectedConversation.lead.jobTitle}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedConversation.lead.company}</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="mt-0.5"><Clock size={14} className="text-gray-400" /></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">Timezone</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedConversation.lead.country}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                        <button className="w-full py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">
                            View Full CRM Record
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Inbox;