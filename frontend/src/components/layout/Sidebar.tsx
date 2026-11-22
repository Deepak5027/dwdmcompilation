import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Database,
  Search,
  Map,
  BarChart3,
  BookOpen,
  Settings,
  ChevronDown,
  ChevronRight,
  Compass,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react';
import { NAVIGATION_ITEMS, NavItem } from '../../utils/constants';
import { getHealth } from '../../services/api';

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Compass,
  Database,
  Search,
  Map,
  BarChart3,
  BookOpen,
  Settings,
};

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar }) => {
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    module1: true,
    module2: true,
    module3: true,
  });

  const toggleSubmenu = (id: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const { data: healthData, isLoading: isHealthLoading, isError: isHealthError } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      const res = await getHealth();
      return res.data.data;
    },
    refetchInterval: 15000,
  });

  const isConnected = !isHealthError && healthData?.database_status === 'connected';
  const dbMode = healthData?.database_mode || '';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[#101D35] text-white transition-all duration-300 border-r border-[#172B4D] ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-20 px-4 border-b border-[#172B4D]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg shadow-teal-500/20 shrink-0">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wider uppercase text-white font-heading">
                Tourism Intelligence
              </span>
              <span className="text-[10px] text-teal-400 font-medium tracking-tight uppercase">
                Destination Analytics
              </span>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.iconName] || Compass;
          const hasChildren = item.children && item.children.length > 0;
          const isChildActive = hasChildren && item.children?.some((c) => location.pathname === c.path);
          const isOpen = openSubmenus[item.id];

          if (hasChildren) {
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => toggleSubmenu(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isChildActive
                      ? 'bg-teal-500/10 text-teal-400'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-5 h-5 shrink-0 ${isChildActive ? 'text-teal-400' : 'text-slate-400'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <div className="text-slate-400">
                      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  )}
                </button>

                {/* Submenu Items */}
                {!collapsed && isOpen && (
                  <div className="pl-9 pr-2 space-y-1">
                    {item.children?.map((child) => (
                      <NavLink
                        key={child.id}
                        to={child.path}
                        className={({ isActive }) =>
                          `block px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-teal-500 text-white font-semibold shadow-sm shadow-teal-500/20'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-500 text-white font-semibold shadow-md shadow-teal-500/25 border-l-4 border-teal-300'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-[#172B4D] bg-[#0B1526]/50">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3 shrink-0">
            {isHealthLoading ? (
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400 animate-pulse"></span>
            ) : isConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            )}
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-200">
                {isHealthLoading
                  ? 'Checking System...'
                  : dbMode === 'supabase'
                  ? 'Supabase Cloud Live'
                  : dbMode === 'mysql'
                  ? 'MySQL 8.0 Live'
                  : dbMode === 'postgresql'
                  ? 'PostgreSQL Live'
                  : isConnected
                  ? 'SQLite Active'
                  : 'Backend Disconnected'}
              </span>
              <span className="text-[10px] text-slate-400">
                {isConnected ? 'Kimball Star Schema Live' : 'Service Connection Offline'}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

