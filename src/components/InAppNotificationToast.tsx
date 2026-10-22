import React from 'react';
import { InAppNotification } from '../types/index.ts';
import { Bell, Check, X, Smartphone } from 'lucide-react';

interface InAppNotificationToastProps {
  notifications: InAppNotification[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

export const InAppNotificationToast: React.FC<InAppNotificationToastProps> = ({
  notifications,
  onDismiss,
  onClearAll,
}) => {
  const activeUnread = notifications.filter((n) => !n.read).slice(0, 2);

  // Auto-dismiss the oldest active unread toast after 6 seconds
  React.useEffect(() => {
    if (activeUnread.length > 0) {
      const timer = setTimeout(() => {
        onDismiss(activeUnread[0].id);
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [activeUnread, onDismiss]);

  if (activeUnread.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2.5rem)] pointer-events-none">
      {activeUnread.length > 1 && (
        <div className="flex justify-end pointer-events-auto">
          <button
            onClick={onClearAll}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-2xs border border-slate-200 transition-colors"
          >
            Minden értesítés bezárása
          </button>
        </div>
      )}
      {activeUnread.map((notif) => (
        <div
          key={notif.id}
          className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 flex items-start justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/80 flex items-center justify-center shrink-0 text-white mt-0.5 shadow-xs">
              <Bell className="w-4 h-4" />
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
                  Push Értesítés
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
              </div>
              <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{notif.message}</p>
            </div>
          </div>

          <button
            onClick={() => onDismiss(notif.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
            aria-label="Értesítés elrejtése"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
