import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Trash2, 
  X 
} from 'lucide-react';

export default function AlertModal({
  isOpen,
  type = 'info', // 'success', 'danger', 'warning', 'info', 'error', 'delete'
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  isConfirm = false,
  onConfirm,
  onClose,
  customIcon = null
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose?.();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose?.();
  };

  const renderIcon = () => {
    if (customIcon) return customIcon;

    switch (type) {
      case 'success':
        return (
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={26} />
          </div>
        );
      case 'danger':
      case 'delete':
        return (
          <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center">
            <Trash2 size={26} />
          </div>
        );
      case 'error':
        return (
          <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center">
            <AlertCircle size={26} />
          </div>
        );
      case 'warning':
        return (
          <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle size={26} />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-14 h-14 rounded-full bg-blue-500/10 text-[#003E83] dark:text-blue-400 flex items-center justify-center">
            <Info size={26} />
          </div>
        );
    }
  };

  const defaultConfirmText = isConfirm 
    ? (type === 'danger' || type === 'delete' ? 'Delete' : 'Confirm')
    : 'OK';

  const finalConfirmText = confirmText || defaultConfirmText;

  const getConfirmButtonClass = () => {
    if (type === 'danger' || type === 'delete' || type === 'error') {
      return 'bg-red-600 hover:bg-red-700 text-white';
    }
    if (type === 'success') {
      return 'bg-emerald-600 hover:bg-emerald-700 text-white';
    }
    if (type === 'warning') {
      return 'bg-amber-600 hover:bg-amber-700 text-white';
    }
    return 'bg-[#003E83] hover:bg-[#002e62] text-white';
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-alert-backdrop">
      <div 
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-2xl animate-alert-popup flex flex-col items-center text-center relative"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
        >
          <X size={18} />
        </button>

        <div className="mb-4">{renderIcon()}</div>

        {title && (
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {title}
          </h3>
        )}

        <div className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          {message}
        </div>

        <div className="flex items-center gap-3 w-full">
          {isConfirm && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-700 text-sm font-medium transition cursor-pointer"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer shadow-sm ${getConfirmButtonClass()}`}
          >
            {finalConfirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
