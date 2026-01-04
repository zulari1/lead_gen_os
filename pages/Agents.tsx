
import React, { useEffect, useState, useMemo } from 'react';
import { getWorkflowLogs } from '../services/api';
import { WorkflowLog, AgentActivity } from '../types';
import { Search, BrainCircuit, PenTool, Mail, MessageSquare, Target, LifeBuoy, Calendar, Globe, Clock, ClipboardList, BarChart3, PlayCircle, RefreshCw, Zap, Sparkles } from 'lucide-react';

const AGENT_CONFIGS: Record<string, any> = {
  "Lead Scraper": {
    displayName: "Lead Scraper",
    icon: Search,
    thinkingTexts: [
      "Scanning LinkedIn for qualified prospects...",
      "Discovering decision makers in target industries...",
      "Finding contact information...",
      "Validating email addresses...",
      "Analyzing company fit scores..."
    ],
    type: "continuous"
  },
  "Research Agent": {
    displayName: "Research Agent",
    icon: BrainCircuit,
    thinkingTexts: [
      "Analyzing company data and insights...",
      "Researching pain points and opportunities...",
      "Gathering competitor intelligence...",
      "Building personalization data...",
      "Creating lead profiles..."
    ],
    type: "triggered"
  },
  "Email Designer Agent": {
    displayName: "Email Preparation Agent",
    icon: PenTool,
    thinkingTexts: [
      "Crafting personalized email copy...",
      "Optimizing subject lines...",
      "Adding relevant context...",
      "Testing email variants...",
      "Preparing send sequence..."
    ],
    type: "triggered"
  },
  "Email Outreach Agent": {
    displayName: "Email Outreach Agent",
    icon: Mail,
    thinkingTexts: [
      "Sending personalized campaigns...",
      "Scheduling follow-up sequences...",
      "Optimizing send times...",
      "Tracking delivery status...",
      "Managing email throttling..."
    ],
    type: "continuous"
  },
  "Inbox AI Agent": {
    displayName: "Inbox AI (Sales)",
    icon: MessageSquare,
    thinkingTexts: [
      "Monitoring for new replies...",
      "Analyzing message intent...",
      "Crafting intelligent responses...",
      "Detecting buying signals...",
      "Routing to appointment setter..."
    ],
    type: "realtime"
  },
  "Sales AI Agent": {
    displayName: "Sales AI Agent",
    icon: Target,
    thinkingTexts: [
      "Qualifying lead intent...",
      "Analyzing conversation sentiment...",
      "Identifying next best action...",
      "Scoring engagement level...",
      "Preparing handoff to booking..."
    ],
    type: "triggered"
  },
  "Customer services AI Agent": {
    displayName: "Customer Support AI",
    icon: LifeBuoy,
    thinkingTexts: [
      "Resolving customer inquiries...",
      "Analyzing support tickets...",
      "Providing instant answers...",
      "Escalating complex issues...",
      "Learning from interactions..."
    ],
    type: "realtime"
  },
  "AI Appointment settler Agent": {
    displayName: "AI Appointment Setter",
    icon: Calendar,
    thinkingTexts: [
      "Scheduling qualified meetings...",
      "Finding optimal time slots...",
      "Sending calendar invites...",
      "Confirming attendee availability...",
      "Preparing meeting briefs..."
    ],
    type: "triggered"
  },
  "WebBot AI Agent": {
    displayName: "Website AI Agent",
    icon: Globe,
    thinkingTexts: [
      "Engaging website visitors...",
      "Qualifying inbound leads...",
      "Answering product questions...",
      "Capturing contact information...",
      "Routing to sales team..."
    ],
    type: "realtime"
  },
  "Meeting Reminder AI Agent": {
    displayName: "Meeting Reminder AI",
    icon: Clock,
    thinkingTexts: [
      "Sending meeting reminders...",
      "Reducing no-show rates...",
      "Confirming attendance...",
      "Preparing participants...",
      "Tracking confirmations..."
    ],
    type: "scheduled"
  },
  "Meeting preparation AI Agent": {
    displayName: "Meeting Prep AI",
    icon: ClipboardList,
    thinkingTexts: [
      "Generating meeting briefs...",
      "Analyzing lead research...",
      "Preparing talking points...",
      "Identifying opportunities...",
      "Creating action items..."
    ],
    type: "triggered"
  },
  "Analyzer AI Agent": {
    displayName: "Analytics AI",
    icon: BarChart3,
    thinkingTexts: [
      "Analyzing campaign performance...",
      "Calculating conversion metrics...",
      "Generating insights...",
      "Optimizing workflows...",
      "Preparing reports..."
    ],
    type: "scheduled"
  }
};

const getRandomThinkingText = (config: any) => {
    return config.thinkingTexts[Math.floor(Math.random() * config.thinkingTexts.length)];
};

const processAgentActivities = (logs: WorkflowLog[]): AgentActivity[] => {
    const now = new Date();
    const agents: AgentActivity[] = [];
    const logsByAgent = new Map<string, WorkflowLog[]>();

    logs.forEach(log => {
        if (!logsByAgent.has(log.workflowName)) logsByAgent.set(log.workflowName, []);
        logsByAgent.get(log.workflowName)!.push(log);
    });

    Object.keys(AGENT_CONFIGS).forEach(agentName => {
        const config = AGENT_CONFIGS[agentName];
        const agentLogs = logsByAgent.get(agentName) || [];
        
        agentLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        const latestLog = agentLogs[0];
        const recentLogs = agentLogs.slice(0, 50); 
        
        const successCount = recentLogs.filter(l => l.status === 'Success').length;
        const successRate = recentLogs.length > 0 ? (successCount / recentLogs.length) * 100 : 100;
        
        const totalDuration = recentLogs.reduce((sum, l) => sum + l.duration, 0);
        const avgDuration = recentLogs.length > 0 ? totalDuration / recentLogs.length : 0;

        let status: AgentActivity['status'] = 'idle';
        let statusLabel = 'Idle';
        let statusColor = 'bg-gray-400 dark:bg-gray-500';
        let currentTask = "Awaiting activation...";
        let showProgressBar = false;
        let progressPercentage = 0;

        if (latestLog) {
            const lastActionTime = new Date(latestLog.timestamp);
            const minutesSince = (now.getTime() - lastActionTime.getTime()) / 60000;

            if (latestLog.status === 'Failed') {
                status = 'recovering';
                statusLabel = 'Optimizing';
                statusColor = 'bg-orange-500';
                currentTask = "Recalibrating parameters...";
            } else if (config.type === 'realtime') {
                status = 'standby';
                statusLabel = 'Monitoring';
                statusColor = 'bg-blue-500';
                currentTask = getRandomThinkingText(config);
            } else if (minutesSince < 5) {
                status = 'running';
                statusLabel = 'Running';
                statusColor = 'bg-green-500';
                currentTask = getRandomThinkingText(config);
                showProgressBar = true;
                progressPercentage = Math.min(95, (minutesSince / 5) * 100);
            } else if (minutesSince < 60) {
                status = 'standby';
                statusLabel = 'Standby';
                statusColor = 'bg-yellow-500';
                currentTask = "Waiting for trigger...";
            }
        }

        let nextRun = null;
        let nextRunLabel = "";

        if (latestLog?.nextRun) {
            nextRun = new Date(latestLog.nextRun);
        }
        
        if (config.type === 'triggered') nextRunLabel = 'On Trigger';
        else if (config.type === 'realtime') nextRunLabel = 'Continuous';
        else nextRunLabel = 'Scheduled';

        agents.push({
            agentName,
            displayName: config.displayName,
            icon: config.icon,
            type: config.type,
            status,
            statusLabel,
            statusColor,
            currentTask,
            thinkingText: getRandomThinkingText(config),
            lastAction: latestLog?.message || 'Initialized',
            lastActionTime: latestLog?.timestamp || new Date().toISOString(),
            successRate: Math.round(successRate * 10) / 10,
            totalRuns: agentLogs.length,
            avgDuration,
            nextRun: latestLog?.nextRun || null,
            nextRunLabel,
            progressPercentage,
            showProgressBar
        });
    });

    return agents.sort((a, b) => {
        const priority = { running: 0, standby: 1, recovering: 2, idle: 3 };
        return priority[a.status] - priority[b.status];
    });
};

const Agents: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<AgentActivity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        const logs = await getWorkflowLogs();
        const processed = processAgentActivities(logs);
        setAgents(processed);
        setLoading(false);
    };
    fetchData();
    const interval = setInterval(fetchData, 15000); 
    return () => clearInterval(interval);
  }, []);

  const systemStats = useMemo(() => {
      const active = agents.filter(a => a.status === 'running' || a.status === 'standby').length;
      const rate = agents.reduce((sum, a) => sum + a.successRate, 0) / (agents.length || 1);
      const total = agents.reduce((sum, a) => sum + a.totalRuns, 0);
      return { active, rate, total };
  }, [agents]);

  if (loading) return (
      <div className="h-screen flex items-center justify-center flex-col gap-4 text-gray-400 bg-[#F9FAFB] dark:bg-gray-900">
          <RefreshCw className="animate-spin text-blue-500" size={32} />
          <p>Connecting to Neural Core...</p>
      </div>
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12 px-4 md:px-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Workforce</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Real-time status of your autonomous agents.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-200 dark:border-green-800 shadow-sm animate-pulse-subtle w-fit">
                <Zap size={16} className="text-green-600 dark:text-green-500 fill-current" />
                <span className="font-semibold tracking-wide">SYSTEM ONLINE</span>
            </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white dark:bg-gray-800 opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-6 flex items-center gap-2">
                <Sparkles size={14} /> System Health
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative z-10">
                <div>
                    <p className="text-blue-600 dark:text-blue-300 text-sm mb-1 font-medium">Active Agents</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">{systemStats.active} <span className="text-lg text-gray-400 dark:text-gray-500 font-normal">/ {agents.length}</span></p>
                </div>
                <div className="border-l border-r border-blue-200/50 dark:border-blue-700/50 px-4">
                    <p className="text-blue-600 dark:text-blue-300 text-sm mb-1 font-medium">Success Rate</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">{Math.round(systemStats.rate)}%</p>
                </div>
                <div>
                    <p className="text-blue-600 dark:text-blue-300 text-sm mb-1 font-medium">Tasks Handled Today</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">{systemStats.total.toLocaleString()}</p>
                </div>
            </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map(agent => (
                <AgentCard key={agent.agentName} agent={agent} />
            ))}
        </div>
    </div>
  );
};

const AgentCard: React.FC<{ agent: AgentActivity }> = ({ agent }) => {
    const [currentText, setCurrentText] = useState(agent.currentTask);

    useEffect(() => {
        if (agent.status === 'running') {
            const interval = setInterval(() => {
                const config = AGENT_CONFIGS[agent.agentName];
                if (config) setCurrentText(getRandomThinkingText(config));
            }, 4000);
            return () => clearInterval(interval);
        } else {
            setCurrentText(agent.currentTask);
        }
    }, [agent.status, agent.currentTask, agent.agentName]);

    const isRunning = agent.status === 'running';

    return (
        <div className={`
            group relative flex flex-col justify-between
            rounded-2xl border transition-all duration-500 overflow-hidden
            ${isRunning 
                ? 'bg-white dark:bg-gray-800 border-green-400/50 dark:border-green-500/30 shadow-[0_4px_20px_-2px_rgba(34,197,94,0.15)] dark:shadow-[0_4px_20px_-4px_rgba(34,197,94,0.2)]' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700/50 hover:shadow-lg dark:hover:shadow-gray-900/50'}
        `}>
            {/* Active Progress Bar Overlay (Bottom) */}
            {agent.showProgressBar && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700 z-20">
                    <div 
                        className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] transition-all duration-1000 ease-linear"
                        style={{ width: `${agent.progressPercentage}%` }}
                    ></div>
                </div>
            )}

            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4 items-center">
                        <div className={`
                            relative p-3.5 rounded-2xl transition-all duration-300
                            ${isRunning 
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                                : 'bg-gray-50 dark:bg-gray-750 text-gray-500 dark:text-gray-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400'}
                        `}>
                            <agent.icon size={26} strokeWidth={isRunning ? 2.5 : 2} className={isRunning ? 'animate-pulse' : ''} />
                            {isRunning && (
                                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1.5">
                                {agent.displayName}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className={`flex h-2 w-2 rounded-full ${agent.statusColor} ${isRunning ? 'animate-pulse' : ''}`}></span>
                                <span className={`text-xs font-bold uppercase tracking-wider ${isRunning ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {agent.statusLabel}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content / Thinking */}
                <div className="min-h-[3rem] mb-6">
                    {isRunning ? (
                         <div className="flex items-center gap-3 text-sm text-green-800 dark:text-green-200 bg-green-50/50 dark:bg-green-900/10 px-4 py-3 rounded-lg border border-green-100 dark:border-green-800/30">
                            <div className="flex gap-1 pt-1 flex-shrink-0">
                                <span className="w-1 h-1 bg-green-500 rounded-full animate-[bounce_1s_infinite_-0.3s]"></span>
                                <span className="w-1 h-1 bg-green-500 rounded-full animate-[bounce_1s_infinite_-0.15s]"></span>
                                <span className="w-1 h-1 bg-green-500 rounded-full animate-[bounce_1s_infinite]"></span>
                            </div>
                            <span className="font-mono text-xs truncate">{currentText}</span>
                        </div>
                    ) : (
                        <div className="px-1 py-2">
                             <p className="text-sm text-gray-400 dark:text-gray-500 italic line-clamp-2">
                                "{agent.currentTask}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-3 gap-2 py-4 border-t border-gray-100 dark:border-gray-700/50">
                    <div className="text-center md:text-left">
                        <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-1">Last Run</p>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                             {new Date(agent.lastActionTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                    <div className="text-center md:text-left border-l border-gray-100 dark:border-gray-700/50 pl-2 md:pl-4">
                        <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-1">Success</p>
                        <p className={`text-xs font-bold ${agent.successRate > 90 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                            {agent.successRate}%
                        </p>
                    </div>
                    <div className="text-center md:text-right border-l border-gray-100 dark:border-gray-700/50 pl-2">
                         <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-1">Schedule</p>
                         <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{agent.nextRunLabel}</p>
                    </div>
                </div>
            </div>

            {/* Hover Actions */}
            <div className={`
                absolute top-4 right-4 flex gap-2 transition-all duration-300
                ${isRunning ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 translate-y-[-4px] group-hover:translate-y-0'}
            `}>
                 <button className="p-2 bg-white dark:bg-gray-700 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 hover:border-blue-200 transition-colors" title="View Logs">
                    <ClipboardList size={16} />
                 </button>
                 <button className="p-2 bg-white dark:bg-gray-700 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 hover:border-green-200 transition-colors" title="Force Run">
                    <PlayCircle size={16} />
                 </button>
            </div>
        </div>
    );
};

export default Agents;
