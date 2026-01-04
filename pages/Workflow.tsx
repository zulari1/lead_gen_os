import React, { useEffect, useState } from 'react';
import { getWorkflowLogs } from '../services/api';
import { WorkflowLog } from '../types';
import { Activity, Clock, AlertCircle, CheckCircle, RefreshCcw } from 'lucide-react';

const Workflow: React.FC = () => {
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
      setLoading(true);
      getWorkflowLogs().then(data => {
          setLogs(data);
          setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Success': return 'text-green-600 bg-green-50 border-green-200';
          case 'Failed': return 'text-red-600 bg-red-50 border-red-200';
          case 'Running': return 'text-blue-600 bg-blue-50 border-blue-200';
          default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
  };

  const getStatusIcon = (status: string) => {
      switch(status) {
          case 'Success': return <CheckCircle size={14} />;
          case 'Failed': return <AlertCircle size={14} />;
          case 'Running': return <Activity size={14} className="animate-spin" />;
          default: return <Clock size={14} />;
      }
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">System Logs</h2>
                <p className="text-gray-500 text-sm">Live execution stream of autonomous agents.</p>
            </div>
            <button onClick={fetchLogs} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                        <tr>
                            <th className="px-6 py-3">Timestamp</th>
                            <th className="px-6 py-3">Agent</th>
                            <th className="px-6 py-3">Action Details</th>
                            <th className="px-6 py-3">Duration</th>
                            <th className="px-6 py-3 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading system logs...</td></tr>
                        ) : logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 font-mono text-sm">
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {log.workflowName}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {log.message}
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {log.duration}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                                        {getStatusIcon(log.status)} {log.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default Workflow;