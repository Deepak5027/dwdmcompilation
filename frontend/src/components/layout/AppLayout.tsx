import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useSidebar } from '../../hooks/useSidebar';

export const AppLayout: React.FC = () => {
  const { collapsed, toggle } = useSidebar();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      <Sidebar collapsed={collapsed} toggleSidebar={toggle} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'pl-20' : 'pl-72'}`}>
        <TopBar />
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

