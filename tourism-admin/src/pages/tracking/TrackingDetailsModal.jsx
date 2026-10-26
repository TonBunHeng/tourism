import React, { useEffect } from 'react';
import { X, Globe, Calendar, Terminal, Info, Clock, ShieldCheck, Activity } from 'lucide-react';

export default function TrackingDetailsModal({ isOpen, onClose, log }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen && log) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, log, onClose]);

  if (!isOpen || !log) return null;

  const hasOldValues = log.old_values && Object.keys(log.old_values).length > 0;
  const hasNewValues = log.new_values && Object.keys(log.new_values).length > 0;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark-modal)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] rounded-md max-w-2xl w-full shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden animate-alert-popup flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] text-[#003E83] dark:text-blue-400 flex items-center justify-center shrink-0 border border-[var(--color-info-border)]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-wide">
                Activity Record Details
              </h3>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                Record #{log.id} • User action history
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:text-[var(--color-text-primary-light)] dark:hover:text-[var(--color-white)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* User & Action Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-md bg-gray-50/60 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-700/60 text-xs">
            <div>
              <span className="font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                User / Initiator
              </span>
              <div className="mt-1 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-[#003E83] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {log.user_name ? log.user_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {log.user_name || log.user?.name || 'System / Guest'}
                  </p>
                  <p className="text-gray-500 dark:text-zinc-400">
                    Role: <span className="font-medium text-[#003E83] dark:text-blue-400">{log.user_role || log.user?.role || 'Guest'}</span>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <span className="font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                Operation & Item
              </span>
              <div className="mt-1">
                <p className="font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  {log.action}
                </p>
                <p className="text-gray-500 dark:text-zinc-400">
                  Target: <span className="font-medium text-gray-800 dark:text-zinc-200">{log.entity_type || 'Platform'} {log.entity_id ? `#${log.entity_id}` : ''}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
              Action Description
            </h4>
            <div className="p-3.5 rounded-md bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 text-xs text-gray-800 dark:text-zinc-200 leading-relaxed font-sans">
              {log.description || 'No detailed change description provided.'}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-md border border-gray-200 dark:border-zinc-800">
              <Globe className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-500 block">IP Address</span>
                <span className="font-mono text-gray-800 dark:text-zinc-200">{log.ip_address || '127.0.0.1'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-md border border-gray-200 dark:border-zinc-800">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-500 block">Timestamp</span>
                <span className="text-gray-800 dark:text-zinc-200">{log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* User Agent */}
          {log.user_agent && (
            <div>
              <span className="text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-500 block mb-1">Client User Agent</span>
              <div className="p-2 rounded bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 font-mono text-[11px] text-gray-600 dark:text-zinc-400 break-all">
                {log.user_agent}
              </div>
            </div>
          )}

          {/* Diff Section if Available */}
          {(hasOldValues || hasNewValues) && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>State Changes (Payload Diff)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {hasOldValues && (
                  <div>
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block mb-1">Previous Values</span>
                    <pre className="p-3 rounded-md bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-[11px] text-rose-800 dark:text-rose-300 overflow-x-auto max-h-48 font-mono">
                      {JSON.stringify(log.old_values, null, 2)}
                    </pre>
                  </div>
                )}
                {hasNewValues && (
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">Updated Values</span>
                    <pre className="p-3 rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-300 overflow-x-auto max-h-48 font-mono">
                      {JSON.stringify(log.new_values, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-gray-50/50 dark:bg-zinc-900/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs md:text-sm font-medium rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
