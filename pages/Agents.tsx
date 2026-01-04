import React, { useEffect, useState } from 'react';
import { getAgentsStatus } from '../services/api';
import { AgentStatus } from '../types';
import { Bot, Activity, CheckCircle, AlertCircle, PlayCircle, Clock } from 'lucide-react';

const Agents: React.FC = () => {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAgentsStatus().then(data => {
        setAgents(data);
        setLoading(false);
    });
  }, []);

  const getStatusConfig = (status: string) => {
      switch(status) {
          case 'Running': return { color: 'text-green-600 bg-green-50 border-green-200', icon: Activity, animate: true };
          case 'Idle': return { color: 'text-gray-600 bg-gray-50 border-gray-200', icon: CheckCircle, animate: false };
          case 'Failed': return { color: 'text-red-600 bg-red-50 border-red-200', icon: AlertCircle, animate: false };
          default: return { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Bot, animate: false };
      }
  }

  if (loading) return <div className="p-12 text-center text-gray-400">Connecting to Neural Core...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Workforce</h2>
                <p className="text-gray-500 text-sm">Real-time status of your autonomous agents.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                System Operational
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {agents.map((agent) => {
                const config = getStatusConfig(agent.status);
                const Icon = config.icon;
                
                return (
                    <div key={agent.name} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        {agent.status === 'Running' && (
                             <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                                 <div className="h-full bg-green-500 animate-loading-bar"></div>
                             </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                <Bot size={24} className="text-gray-700 group-hover:text-blue-600" />
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${config.color}`}>
                                <Icon size={12} className={config.animate ? 'animate-pulse' : ''} />
                                {agent.status}
                            </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{agent.name}</h3>
                        <p className="text-sm text-gray-500 h-10 mb-6 line-clamp-2">{agent.lastAction}</p>
                        
                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Success Rate</span>
                                <span className={`font-medium ${agent.successRate > 90 ? 'text-green-600' : 'text-yellow-600'}`}>{agent.successRate}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Last Active</span>
                                <span className="text-gray-900">{new Date(agent.lastRun).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                    <PlayCircle size={12} /> Force Run
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default Agents;