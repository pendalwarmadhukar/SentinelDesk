import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';
import NotificationPanel from './NotificationPanel';
import { Bell, Shield, Menu, Radio, User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar?: () => void;
  globalSearch?: string;
  setGlobalSearch?: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  globalSearch = '',
  setGlobalSearch,
}) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleStatus = (e: any) => {
      if (e.detail) {
        setIsLiveBackend(e.detail.isLive);
      }
    };
    window.addEventListener('sentinel:backend-status', handleStatus);
    return () => window.removeEventListener('sentinel:backend-status', handleStatus);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && globalSearch.trim()) {
      navigate(`/alerts?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left branding & mobile menu */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-sm shadow-cyan-950/40">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase">
                SentinelDesk
              </span>
              <span
                className={`hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${
                  isLiveBackend
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                }`}
                title={
                  isLiveBackend
                    ? 'Connected directly to Node.js / Express backend'
                    : 'Backend offline: using interactive demo fallback adapter'
                }
              >
                <Radio className={`h-2.5 w-2.5 ${isLiveBackend ? 'animate-pulse text-emerald-400' : 'text-amber-400'}`} />
                {isLiveBackend ? 'API LIVE' : 'DEMO MODE'}
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-400 font-medium">
              SOC Monitoring &amp; Incident Response
            </p>
          </div>
        </div>
      </div>

      {/* Middle Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch && setGlobalSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search alerts, logs, IPs, incidents (Press Enter)..."
            className="w-full rounded-lg border border-slate-800/80 bg-slate-900/90 py-1.5 pl-3 pr-8 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-colors"
          />
          <kbd className="absolute right-2.5 top-2 hidden lg:inline-block rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 border border-slate-700">
            ↵
          </kbd>
        </div>
      </div>

      {/* Right User & Notifications */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg border border-slate-800/80 bg-slate-900/60 p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-slate-950 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationPanel
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>

        {/* Current Analyst */}
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 rounded-lg border border-slate-800/80 bg-slate-900/60 py-1.5 px-2.5 hover:border-slate-700 hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-slate-950" />
          </div>

          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[120px]">
              {user?.name || 'SOC Analyst'}
            </p>
            <p className="text-[10px] text-cyan-400 font-mono leading-none">
              {user?.role ? user.role.split(' ')[0] : 'Analyst'} • {user?.badge || 'SD-8492'}
            </p>
          </div>
          <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-500" />
        </div>
      </div>
    </header>
  );
};

export default Header;
