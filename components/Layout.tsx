import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X, Bell } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
      const path = location.pathname;
      if (path === '/') return 'Overview';
      return path.substring(1).charAt(0).toUpperCase() + path.slice(2);
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex text-gray-900 font-sans">
      <Sidebar />
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-40 px-4 py-3 flex items-center justify-between">
         <div className="flex items-center gap-3">
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                 {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
             <span className="font-bold text-lg">Revenue OS</span>
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 mt-14 md:mt-0 transition-all duration-300">
         <header className="hidden md:flex justify-between items-center mb-8">
             <div>
                 <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
                 <p className="text-gray-500 text-sm">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
             </div>
             <div className="flex items-center gap-4">
                 <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                     <Bell size={20} />
                     <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                 </button>
             </div>
         </header>
         
         {children}
      </main>
    </div>
  );
};

export default Layout;