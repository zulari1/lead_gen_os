import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Mail, MessageSquare, Calendar, Bot, Globe, Database, Settings, Activity, Moon, Sun, X } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isDark?: boolean;
  toggleTheme?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isDark, toggleTheme }) => {
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
    <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out shadow-xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
    `}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
            L
            </div>
            <div>
                <h1 className="font-bold text-gray-900 dark:text-white leading-tight">Revenue OS</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Command Center</p>
            </div>
        </div>
        <button onClick={onClose} className="md:hidden text-gray-500 dark:text-gray-400">
            <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            onClick={() => onClose && onClose()}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-gray-700/50 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
        <NavLink 
            to="/settings" 
            onClick={() => onClose && onClose()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
            <Settings size={18} />
            Settings
        </NavLink>
        
        <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>

        <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                JD
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">John Doe</p>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
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