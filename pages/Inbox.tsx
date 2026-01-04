import React, { useEffect, useState } from 'react';
import { getConversations } from '../services/api';
import { Conversation } from '../types';
import { Search, ChevronRight, User, Sparkles, MessageSquare, AlertTriangle } from 'lucide-react';

const Inbox: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    getConversations().then(data => {
        setConversations(data);
        if(data.length > 0) setSelectedId(data[0].id);
    });
  }, []);

  const selectedConversation = conversations.find(c => c.id === selectedId);

  return (
    <div className="h-[calc(100vh-2rem)] bg-white border border-gray-200 rounded-xl shadow-sm flex overflow-hidden">
        {/* Thread List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
            <div className="p-4 border-b border-gray-200 bg-white">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search inbox..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.map(conv => (
                    <div 
                        key={conv.id}
                        onClick={() => setSelectedId(conv.id)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors ${selectedId === conv.id ? 'bg-white border-l-4 border-l-blue-500 shadow-sm' : 'border-l-4 border-l-transparent'}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`font-semibold text-sm ${selectedId === conv.id ? 'text-gray-900' : 'text-gray-700'}`}>{conv.leadName}</span>
                            <span className="text-xs text-gray-400">{new Date(conv.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">{conv.lastMessage}</p>
                        {conv.requiresHuman && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-red-600 bg-red-50 w-fit px-2 py-0.5 rounded">
                                <AlertTriangle size={10} /> Needs Attention
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Conversation View */}
        <div className="flex-1 flex flex-col bg-white relative">
            {selectedConversation ? (
                <>
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{selectedConversation.leadName}</h3>
                                <p className="text-xs text-gray-500">{selectedConversation.leadEmail}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             {selectedConversation.requiresHuman && (
                                 <button className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-md shadow-sm hover:bg-red-700 transition-colors">
                                     Take Over
                                 </button>
                             )}
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                        {selectedConversation.messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                                    msg.direction === 'outbound' 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                }`}>
                                    <p className="text-sm leading-relaxed">{msg.body}</p>
                                    <p className={`text-[10px] mt-2 text-right opacity-70`}>
                                        {msg.direction === 'outbound' ? 'AI Agent' : selectedConversation.leadName} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* AI Reasoning Panel (Tier 2+) */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100">
                         <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Sparkles size={16} className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-blue-800 mb-1">AI Reasoning Engine</p>
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    {selectedConversation.aiReasoning || "Analyzing conversation context... Lead appears interested in pricing tiers. Recommended action: Send pricing PDF."}
                                </p>
                            </div>
                         </div>
                    </div>

                    {/* Input (Disabled for demo) */}
                    <div className="p-4 border-t border-gray-200 bg-white">
                        <div className="relative">
                            <input disabled type="text" placeholder="AI is handling this conversation..." className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm cursor-not-allowed opacity-70" />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gray-200 rounded text-gray-500">
                                <MessageSquare size={16} />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <MessageSquare size={48} className="mb-4 opacity-20" />
                    <p>Select a conversation to view details</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default Inbox;