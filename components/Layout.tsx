import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Menu, X, Bell } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const location = useLocation();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const getPageTitle = () => {
      const path = location.pathname;
      if (path === '/') return 'Overview';
      return path.substring(1).charAt(0).toUpperCase() + path.slice(2);
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity md:hidden ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      <Sidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
      />
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 px-4 py-3 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-3">
             <button onClick={() => setMobileMenuOpen(true)} className="p-1 -ml-1 text-gray-600 dark:text-gray-300">
                 <Menu size={24} />
             </button>
             <span className="font-bold text-lg dark:text-white">Revenue OS</span>
         </div>
         <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 relative">
                 <Bell size={20} />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
            </button>
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 mt-14 md:mt-0 transition-all duration-300">
         <header className="hidden md:flex justify-between items-center mb-8">
             <div>
                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getPageTitle()}</h1>
                 <p className="text-gray-500 dark:text-gray-400 text-sm">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
             </div>
             <div className="flex items-center gap-4">
                 <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors relative">
                     <Bell size={20} />
                     <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900"></span>
                 </button>
             </div>
         </header>
         
         {children}
      </main>
    </div>
  );
};

export default Layout;