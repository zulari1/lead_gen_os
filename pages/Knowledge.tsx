import React, { useState } from 'react';
import { Database, FileText, RefreshCw, Upload, Search, CheckCircle } from 'lucide-react';

const Knowledge: React.FC = () => {
  const [syncing, setSyncing] = useState(false);

  const documents = [
      { name: 'Company_Overview_2025.pdf', size: '2.4 MB', date: 'Jan 2, 2025', status: 'Synced' },
      { name: 'Product_Pricing_Guide_v3.docx', size: '1.1 MB', date: 'Jan 1, 2025', status: 'Synced' },
      { name: 'Technical_Specs_SaaS.pdf', size: '4.5 MB', date: 'Dec 28, 2024', status: 'Synced' },
      { name: 'Sales_Objection_Handling.txt', size: '45 KB', date: 'Dec 15, 2024', status: 'Synced' },
      { name: 'Case_Study_Logistics.pdf', size: '3.2 MB', date: 'Dec 10, 2024', status: 'Synced' },
  ];

  const handleSync = () => {
      setSyncing(true);
      setTimeout(() => setSyncing(false), 3000);
  };

  const DRIVE_FOLDER_URL = "https://drive.google.com/drive/u/3/folders/1vFJrmCrE0UdFC6VW6gQBqDc20bBg5tlJ";

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Manage the documents your AI uses for RAG context.</p>
            </div>
            <button 
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
                <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex flex-col items-center text-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full mb-4">
                        <Upload size={24} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Google Drive Integration</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4">
                        Upload files to your connected Drive folder to automatically sync them.
                    </p>
                    <a 
                        href={DRIVE_FOLDER_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline block"
                    >
                        Open Google Drive Folder
                    </a>
                </div>
                
                <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-500 dark:text-gray-400">Storage Used</span>
                         <span className="font-medium text-gray-900 dark:text-white">145 MB / 5 GB</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                         <div className="bg-green-500 h-2 rounded-full" style={{width: '3%'}}></div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-500 dark:text-gray-400">Documents</span>
                         <span className="font-medium text-gray-900 dark:text-white">47 files</span>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white">Synced Documents</h3>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search files..." className="pl-9 pr-4 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                </div>
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-750 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                            <tr>
                                <th className="px-6 py-3">File Name</th>
                                <th className="px-6 py-3">Size</th>
                                <th className="px-6 py-3">Last Updated</th>
                                <th className="px-6 py-3 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {documents.map((doc, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <FileText size={18} className="text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{doc.size}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{doc.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                            <CheckCircle size={10} /> {doc.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Knowledge;