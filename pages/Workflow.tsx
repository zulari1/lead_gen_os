import React, { useEffect, useState, useMemo } from 'react';
import { getWorkflowLogs } from '../services/api';
import { WorkflowLog } from '../types';
import { Activity, Clock, AlertCircle, CheckCircle, RefreshCcw, Filter, Search } from 'lucide-react';

const Workflow: React.FC = () => {
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchLogs = () => {
      setLoading(true);
      getWorkflowLogs().then(data => {
          setLogs(data);
          setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => {
        getWorkflowLogs().then(setLogs);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const uniqueAgents = useMemo(() => Array.from(new Set(logs.map(l => l.workflowName))), [logs]);

  const filteredLogs = useMemo(() => {
      return logs.filter(log => {
          if (filterAgent !== 'all' && log.workflowName !== filterAgent) return false;
          if (filterStatus !== 'all' && (
              (filterStatus === 'Success' && log.status !== 'Success') ||
              (filterStatus === 'Failed' && log.status !== 'Failed')
          )) return false;
          return true;
      });
  }, [logs, filterAgent, filterStatus]);

  const stats = useMemo(() => {
      if (logs.length === 0) return { rate: 0, avgTime: 0, total: 0 };
      
      const successCount = logs.filter(l => l.status === 'Success').length;
      const rate = (successCount / logs.length) * 100;
      
      const avgTime = logs.reduce((sum, l) => sum + (l.duration || 0), 0) / logs.length / 1000;
      
      return {
          rate: Math.round(rate),
          avgTime: avgTime.toFixed(1),
          total: logs.length
      };
  }, [logs]);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Logs</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Live execution stream of autonomous agents.</p>
            </div>
            <button onClick={fetchLogs} className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors shadow-sm">
                <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            </button>
        </div>

        {/* Health Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-6">System Health</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard label="Success Rate" value={`${stats.rate}%`} />
                <MetricCard label="Avg Execution Time" value={`${stats.avgTime}s`} />
                <MetricCard label="Total Executions" value={stats.total} />
            </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
             <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                 <input type="text" placeholder="Search logs..." className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
             </div>
             <div className="flex gap-2">
                 <select 
                    value={filterAgent}
                    onChange={(e) => setFilterAgent(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                 >
                     <option value="all">All Agents</option>
                     {uniqueAgents.map(a => <option key={a} value={a}>{a}</option>)}
                 </select>
                 <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                 >
                     <option value="all">All Statuses</option>
                     <option value="Success">Success</option>
                     <option value="Failed">Failed</option>
                 </select>
             </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-750 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        <tr>
                            <th className="px-6 py-3">Timestamp</th>
                            <th className="px-6 py-3">Agent</th>
                            <th className="px-6 py-3">Action Details</th>
                            <th className="px-6 py-3">Duration</th>
                            <th className="px-6 py-3 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading && logs.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading system logs...</td></tr>
                        ) : filteredLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 font-mono text-sm transition-colors">
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">
                                    {log.workflowName}
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                    {log.message}
                                    {log.error && <span className="block text-red-500 text-xs mt-1">{log.error}</span>}
                                </td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                    {(log.duration / 1000).toFixed(2)}s
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                        log.status === 'Success' ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' :
                                        log.status === 'Failed' ? 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' :
                                        'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
                                    }`}>
                                        {log.status === 'Success' ? <CheckCircle size={12} /> : 
                                         log.status === 'Failed' ? <AlertCircle size={12} /> : 
                                         <Activity size={12} className="animate-spin" />}
                                        {log.status === 'Success' ? 'Done' : log.status === 'Failed' ? 'Failed' : 'Running'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredLogs.length === 0 && !loading && (
                 <div className="p-12 text-center text-gray-400">No logs found matching filters.</div>
            )}
        </div>
    </div>
  );
};

const MetricCard = ({ label, value }: { label: string; value: string | number }) => (
    <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-100 dark:border-gray-700 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
);

export default Workflow;