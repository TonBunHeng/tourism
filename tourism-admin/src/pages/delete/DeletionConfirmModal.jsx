import { useEffect } from 'react';
import { X, AlertTriangle, Check } from 'lucide-react';

export default function DeletionConfirmModal({
  isOpen,
  request,
  confirmAction,
  confirmType,
  onClose,
  onConfirm
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

  const isApprove = confirmAction === 'approve';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-[#18181b] rounded-md shadow-2xl max-w-sm w-full mx-4 p-6 relative border border-gray-200 dark:border-zinc-800 animate-alert-popup overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-5 animate-alert-icon">
          {isApprove ? (
            <div className="w-14 h-14 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Check size={24} />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-md bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center">
              <X size={24} />
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2 tracking-tight">
          Confirm {confirmType}
        </h3>

        <p className="text-sm text-gray-500 dark:text-zinc-400 text-center mb-4 leading-relaxed whitespace-pre-line px-1">
          Are you sure you want to <strong className="text-gray-900 dark:text-white capitalize">{confirmAction}</strong> this {confirmType.toLowerCase()} request for <strong className="text-gray-900 dark:text-white">{request.user?.name || 'User'}</strong>?
        </p>

        {isApprove && (
          <div className="p-3 mb-5 bg-red-500/10 border border-red-500/20 rounded-md text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>This action will permanently execute the deletion. This cannot be undone.</span>
          </div>
        )}

        <div className="flex gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-md border border-gray-300 dark:border-zinc-800 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800/80 text-gray-700 dark:text-zinc-300 font-medium text-sm transition-colors text-center cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 rounded-md text-white font-medium text-sm transition-colors text-center flex items-center justify-center gap-2 cursor-pointer ${
              isApprove
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isApprove ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            Confirm {isApprove ? 'Approve' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}
