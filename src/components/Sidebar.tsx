import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  ShieldAlert,
  Terminal,
  Flame,
  SearchCode,
  Globe2,
  FileBarChart,
  Settings,
  User,
  LogOut,
  X,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed = false,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Alerts', path: '/alerts', icon: ShieldAlert, badge: '8' },
    { name: 'Security Logs', path: '/logs', icon: Terminal },
    { name: 'Incidents', path: '/incidents', icon: Flame, badge: '2' },
    { name: 'Investigations', path: '/investigation', icon: SearchCode },
    { name: 'Threat Intelligence', path: '/threats', icon: Globe2 },
    { name: 'Reports', path: '/reports', icon: FileBarChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-slate-800/80 bg-slate-950 transition-all duration-200 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div>
                <span className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase">
                  SentinelDesk
                </span>
                <p className="text-[10px] text-cyan-400 font-mono">SOC PLATFORM v2.4</p>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3">
            {!isCollapsed && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Operations
              </p>
            )}
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/30 shadow-sm shadow-cyan-950/50'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="flex-1 truncate tracking-wide">{item.name}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <span
                      className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                        item.name === 'Alerts'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-cyan-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom User Profile & Logout */}
        <div className="border-t border-slate-800/80 p-3 space-y-1 bg-slate-950/80">
          <NavLink
            to="/profile"
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`
            }
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
              <User className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {user?.name || 'Analyst'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {user?.role || 'SOC Tier 2'}
                </p>
              </div>
            )}
            {!isCollapsed && <ChevronRight className="h-3.5 w-3.5 text-slate-600" />}
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:bg-rose-950/20 hover:text-rose-400 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
