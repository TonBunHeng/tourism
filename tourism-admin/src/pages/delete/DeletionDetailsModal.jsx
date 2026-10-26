import { useEffect } from 'react';
import { User, X, Trash2, Check } from 'lucide-react';
import { getTypeLabel } from '../../utils/StatusUtils';

export default function DeletionDetailsModal({
  isOpen,
  request,
  adminNotes,
  onAdminNotesChange,
  onClose,
  onApprove,
  onReject
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen && request) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, request, onClose]);

  if (!isOpen || !request) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark-modal)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] rounded-md max-w-lg w-full shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden animate-alert-popup flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
              <User className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">Request Details</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">ID: #{request.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-all active:scale-90 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">User</span>
            <p className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1">{request.user?.name || request.user_name || 'User'}</p>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">{request.user?.email || 'N/A'}{request.user?.phone ? ` • ${request.user.phone}` : ''}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Request Type</span>
              <p className="text-sm font-medium text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] mt-1">{getTypeLabel(request.type)}</p>
            </div>
            <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Status & Urgency</span>
              <p className="text-sm font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 capitalize">{request.status} • <span className="uppercase text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]">{request.urgency}</span></p>
            </div>
          </div>

          <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Reason</span>
            <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1 leading-relaxed">{request.reason}</p>
          </div>

          {request.additionalInfo && (
            <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Additional Information</span>
              <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1 leading-relaxed">{request.additionalInfo}</p>
            </div>
          )}

          {request.itemsToDelete && request.itemsToDelete.length > 0 && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] block mb-2">Items to Delete</span>
              <div className="space-y-2">
                {request.itemsToDelete.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-3 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                    <div className="flex items-center gap-2 min-w-0">
                      <Trash2 className="w-4 h-4 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">{item.name}</p>
                        <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">{item.type} • {item.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5 block">Admin Notes</span>
            <textarea
              value={adminNotes}
              onChange={(e) => onAdminNotesChange(e.target.value)}
              placeholder="Add admin notes..."
              rows="3"
              className="w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md px-4 py-3 text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent resize-none transition-all"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark-modal)]">
          {request.status === 'pending' ? (
            <>
              <button
                type="button"
                onClick={() => onApprove(request)}
                className="py-2.5 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => onReject(request)}
                className="py-2.5 px-4 rounded-md bg-[var(--color-danger-text)] hover:opacity-90 text-[var(--color-white)] font-medium text-sm transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)] hover:bg-[var(--color-border-subtle-light)] dark:hover:bg-[var(--color-border-dark)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-white)] font-medium text-sm transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
