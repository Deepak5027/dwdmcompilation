import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Bell, ShieldCheck, AlertCircle, RotateCw, ExternalLink, X } from 'lucide-react';
import { globalSearch, getHealth } from '../../services/api';

export const TopBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ type: string; title: string; subtitle: string; route: string; id: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Generate dynamic breadcrumbs
  const pathnames = location.pathname.split('/').filter((x) => x);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await globalSearch(searchQuery);
        if (res.data.success && res.data.data) {
          setSearchResults(res.data.data);
          setShowDropdown(true);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (route: string) => {
    navigate(route);
    setShowDropdown(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-8 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
      {/* Breadcrumb Path */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400 font-medium hover:text-slate-600 cursor-pointer" onClick={() => navigate('/')}>
          Platform
        </span>
        {pathnames.map((segment, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayLabel = segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <React.Fragment key={routeTo}>
              <span className="text-slate-300">/</span>
              <span
                onClick={() => !isLast && navigate(routeTo)}
                className={`font-medium ${isLast ? 'text-slate-800 font-semibold' : 'text-slate-500 hover:text-slate-700 cursor-pointer'}`}
              >
                {displayLabel}
              </span>
            </React.Fragment>
          );
        })}
      </div>

      {/* Right Controls: Global Search, Indicators & Profile */}
      <div className="flex items-center gap-5">
        {/* Global Search Input */}
        <div className="relative w-80" ref={dropdownRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations, models, datasets..."
              className="w-full pl-10 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Instant Search Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
              <div className="p-2 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Search Results</span>
                {isSearching && <span className="text-[10px] text-teal-600 animate-pulse">Searching...</span>}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No matching destinations or datasets found.</div>
                ) : (
                  searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectResult(item.route)}
                      className="p-3 hover:bg-teal-50/50 cursor-pointer transition-colors flex items-center justify-between group"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-teal-700">{item.title}</span>
                        <span className="text-[11px] text-slate-500">{item.subtitle}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-teal-100 group-hover:text-teal-800">
                        {item.type}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Database Indicator */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${
            isHealthLoading
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {isHealthLoading ? (
            <RotateCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
          ) : isConnected ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          )}
          <span>
            {isHealthLoading
              ? 'Connecting...'
              : dbMode === 'supabase'
              ? 'Supabase Cloud Connected'
              : dbMode === 'mysql'
              ? 'MySQL 8.0 Connected'
              : dbMode === 'postgresql'
              ? 'PostgreSQL Connected'
              : isConnected
              ? 'SQLite Connected'
              : 'Database Disconnected'}
          </span>
        </div>

        {/* Demonstration Data Pill */}
        <div className="hidden lg:inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          Demonstration Data
        </div>

        {/* Notifications Icon */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#101D35] to-[#172B4D] text-white flex items-center justify-center font-bold text-xs shadow-md">
            TN
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-slate-800">DMO Admin</span>
            <span className="text-[10px] text-slate-500">Analytics Bureau</span>
          </div>
        </div>
      </div>
    </header>
  );
};

