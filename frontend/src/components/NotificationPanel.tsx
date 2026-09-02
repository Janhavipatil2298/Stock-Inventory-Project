import React from 'react';
import { X, Bell, AlertTriangle, ShieldAlert, CheckCircle, Info, Trash2, CheckCheck } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onSelectNotification: (linkModule?: string) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  onSelectNotification
}) => {
  if (!isOpen) return null;

  const iconMap = {
    alert: <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    success: <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-cyan-400 shrink-0" />
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-base text-slate-100">Notifications</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300">
              {notifications.filter(n => !n.read).length} New
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions Bar */}
        <div className="px-4 py-2 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between text-xs font-medium">
          <button
            onClick={onMarkAllRead}
            className="text-slate-400 hover:text-cyan-400 flex items-center space-x-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
          <button
            onClick={onClearAll}
            className="text-slate-400 hover:text-rose-400 flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear all</span>
          </button>
        </div>

        {/* Notification Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              No new system notifications.
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => { onSelectNotification(n.linkModule); onClose(); }}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  !n.read 
                    ? 'bg-slate-800/90 border-cyan-500/40 shadow-sm' 
                    : 'bg-slate-800/30 border-slate-800 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {iconMap[n.type] || iconMap.info}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-200">{n.title}</p>
                      <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
