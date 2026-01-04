import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Mail, MessageSquare, Calendar, Bot, Globe, Database, Settings, Activity } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', to: '/' },
    { icon: Users, label: 'Leads', to: '/leads' },
    { icon: Mail, label: 'Outreach', to: '/outreach' },
    { icon: MessageSquare, label: 'Inbox AI', to: '/inbox' },
    { icon: Calendar, label: 'Meetings', to: '/meetings' },
    { icon: Bot, label: 'AI Agents', to: '/agents' },
    { icon: Globe, label: 'Website AI', to: '/web-ai' },
    { icon: Database, label: 'Knowledge', to: '/knowledge' },
    { icon: Activity, label: 'Workflow', to: '/workflow' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-30 hidden md:flex">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
          L
        </div>
        <div>
            <h1 className="font-bold text-gray-900 leading-tight">Revenue OS</h1>
            <p className="text-xs text-gray-500">Command Center</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <NavLink to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <Settings size={18} />
            Settings
        </NavLink>
        <div className="mt-4 flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                JD
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Tier 2 Active
                </p>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;