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
  // Prevent background scrolling when modal is open
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

  // Simple and sleek icon presentation with soft tinted circle
  const renderIcon = () => {
    if (customIcon) return customIcon;

    switch (type) {
      case 'success':
        return (
          <div className="w-14 h-14 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        );
      case 'danger':
      case 'delete':
        return (
          <div className="w-14 h-14 rounded-md bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center">
            <Trash2 size={24} />
          </div>
        );
      case 'error':
        return (
          <div className="w-14 h-14 rounded-md bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
        );
      case 'warning':
        return (
          <div className="w-14 h-14 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-14 h-14 rounded-md bg-blue-500/10 text-[#003E83] dark:text-blue-400 flex items-center justify-center">
            <Info size={24} />
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
      return 'bg-red-500 hover:bg-red-600 text-white';
    }
    if (type === 'success') {
      return 'bg-emerald-500 hover:bg-emerald-600 text-white';
    }
    if (type === 'warning') {
      return 'bg-amber-500 hover:bg-amber-600 text-white';
    }
    return 'bg-[#003E83] hover:bg-[#002e62] text-white';
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
    >
      <div
        className="bg-white dark:bg-[#18181b] rounded-md shadow-2xl max-w-sm w-full mx-4 p-6 relative border border-gray-200 dark:border-zinc-800 animate-alert-popup overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-5 animate-alert-icon">
          {renderIcon()}
        </div>

        {/* Title */}
        {title && (
          <h3 id="alert-modal-title" className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2 tracking-tight">
            {title}
          </h3>
        )}

        {/* Message */}
        {message && (
          <p className="text-sm text-gray-500 dark:text-zinc-400 text-center mb-6 leading-relaxed whitespace-pre-line px-1">
            {message}
          </p>
        )}

        {/* Buttons */}
        {isConfirm ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-zinc-800 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800/80 text-gray-700 dark:text-zinc-300 font-medium rounded-md transition-colors cursor-pointer text-sm"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`flex-1 py-2.5 px-4 font-medium rounded-md transition-colors cursor-pointer text-sm ${getConfirmButtonClass()}`}
            >
              {finalConfirmText}
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleConfirm}
              className={`w-full py-2.5 px-4 font-medium rounded-md transition-colors cursor-pointer text-sm ${getConfirmButtonClass()}`}
            >
              {finalConfirmText}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
