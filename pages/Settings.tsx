import React, { useState } from 'react';
import { User, Bell, CreditCard, Shield, Globe, Smartphone, Save } from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
      { id: 'account', label: 'Account', icon: User },
      { id: 'preferences', label: 'Preferences', icon: Bell },
      { id: 'billing', label: 'Billing', icon: CreditCard },
      { id: 'integrations', label: 'Integrations', icon: Globe },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <p className="text-gray-500 text-sm">Manage your profile, preferences, and subscription.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 p-2 md:p-4">
                <nav className="space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === tab.id 
                                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200' 
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 md:p-8">
                {activeTab === 'account' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Profile Information</h3>
                            <p className="text-sm text-gray-500">Update your account details.</p>
                        </div>
                        <div className="grid gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input type="text" defaultValue="John" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input type="text" defaultValue="Doe" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input type="email" defaultValue="john@example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <input type="text" defaultValue="Example Corp" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'billing' && (
                    <div className="space-y-6">
                         <div>
                            <h3 className="text-lg font-bold text-gray-900">Subscription & Billing</h3>
                            <p className="text-sm text-gray-500">Manage your plan and payment methods.</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-blue-900">Tier 2 Professional</p>
                                <p className="text-sm text-blue-700">$299/month • Renews on Feb 1, 2026</p>
                            </div>
                            <span className="bg-blue-200 text-blue-800 text-xs font-bold px-2 py-1 rounded">Active</span>
                        </div>
                        <div className="space-y-4 pt-4">
                            <h4 className="font-medium text-gray-900">Payment Method</h4>
                            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                                <CreditCard className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Visa ending in 4242</p>
                                    <p className="text-xs text-gray-500">Expires 12/28</p>
                                </div>
                                <button className="text-sm text-blue-600 font-medium hover:underline">Edit</button>
                            </div>
                        </div>
                        <button className="text-sm text-gray-500 hover:text-gray-900 font-medium">Download Invoices</button>
                    </div>
                )}

                {activeTab === 'integrations' && (
                    <div className="space-y-6">
                         <div>
                            <h3 className="text-lg font-bold text-gray-900">Integrations</h3>
                            <p className="text-sm text-gray-500">Connect external tools to your Revenue OS.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                        <div className="font-bold">GS</div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Google Sheets</p>
                                        <p className="text-xs text-gray-500">Connected to 5 sheets</p>
                                    </div>
                                </div>
                                <button className="text-sm px-3 py-1.5 border border-gray-200 rounded bg-gray-50 text-gray-500" disabled>Connected</button>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                                        <Smartphone size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">WhatsApp</p>
                                        <p className="text-xs text-gray-500">Tier 3 Feature</p>
                                    </div>
                                </div>
                                <button className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 font-medium rounded hover:bg-blue-100">Upgrade</button>
                            </div>
                        </div>
                    </div>
                )}

                 {activeTab === 'preferences' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Preferences</h3>
                            <p className="text-sm text-gray-500">Customize your dashboard experience.</p>
                        </div>
                        <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                 <div>
                                     <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                                     <p className="text-xs text-gray-500">Receive daily summaries</p>
                                 </div>
                                 <input type="checkbox" defaultChecked className="toggle" />
                             </div>
                             <div className="flex items-center justify-between">
                                 <div>
                                     <p className="text-sm font-medium text-gray-900">Real-time Alerts</p>
                                     <p className="text-xs text-gray-500">Notify on new leads instantly</p>
                                 </div>
                                 <input type="checkbox" defaultChecked className="toggle" />
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Settings;