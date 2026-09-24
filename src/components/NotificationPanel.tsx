import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { formatRelativeTime } from '../utils/formatters';
import { AlertCircle, CheckCheck, Info, ShieldAlert, Trash2, X } from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) {
      navigate(link);
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'CRITICAL':
        return <ShieldAlert className="h-4 w-4 text-rose-400" />;
      case 'HIGH':
        return <AlertCircle className="h-4 w-4 text-orange-400" />;
      case 'SUCCESS':
        return <CheckCheck className="h-4 w-4 text-emerald-400" />;
      default:
        return <Info className="h-4 w-4 text-cyan-400" />;
    }
  };

  return (
    <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-xl border border-slate-800 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            SOC Alert Feed
          </span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllAsRead}
                className="rounded p-1 text-slate-400 hover:text-slate-200 text-[11px] hover:bg-slate-800"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={clearAll}
                className="rounded p-1 text-slate-400 hover:text-rose-400 text-[11px] hover:bg-slate-800"
                title="Clear all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-slate-800/40">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No active dispatch alerts.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif.id, notif.link)}
              className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors cursor-pointer ${
                notif.read ? 'opacity-60 hover:opacity-90 hover:bg-slate-800/30' : 'bg-slate-800/40 hover:bg-slate-800/70'
              }`}
            >
              <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-200 truncate">{notif.title}</p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formatRelativeTime(notif.timestamp)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
