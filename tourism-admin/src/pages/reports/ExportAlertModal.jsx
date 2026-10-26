import { useEffect } from 'react';
import { FileText, FileSpreadsheet, X } from 'lucide-react';

export default function ExportAlertModal({ isOpen, format, activeTab, recordCount, onClose, onConfirm }) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isPDF = format === 'pdf';
  const tabName = activeTab ? (activeTab.charAt(0).toUpperCase() + activeTab.slice(1)) : 'Data';

  const handleExport = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-md shadow-2xl max-w-md w-full mx-4 p-6 sm:p-7 relative border border-gray-100 dark:border-zinc-800 animate-alert-popup overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-all active:scale-90 cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4 animate-alert-icon">
          {isPDF ? (
            <div className="w-16 h-16 rounded-md bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 ring-8 ring-red-50/70 dark:ring-red-950/30 flex items-center justify-center shadow-xs">
              <FileText size={30} />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-50/70 dark:ring-emerald-950/30 flex items-center justify-center shadow-xs">
              <FileSpreadsheet size={30} />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 id="export-modal-title" className="text-base sm:text-lg font-bold text-gray-900 dark:text-zinc-100 text-center mb-2 tracking-tight">
          {isPDF ? 'Export PDF Confirmation' : 'Export Excel Confirmation'}
        </h3>

        {/* Message */}
        <p className="text-gray-600 dark:text-zinc-300 text-center mb-6 text-xs sm:text-sm leading-relaxed whitespace-pre-line px-1">
          Are you sure you want to export the <strong className="text-gray-800 dark:text-zinc-100">{tabName}</strong> dataset ({recordCount} items) as a {isPDF ? 'PDF' : 'Excel'} file?
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 font-semibold rounded-md hover:bg-gray-50 dark:hover:bg-zinc-750 active:scale-95 transition-all shadow-xs cursor-pointer text-xs sm:text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            className={`flex-1 px-4 py-2.5 font-semibold rounded-md active:scale-95 transition-all shadow-md cursor-pointer text-xs sm:text-sm ${
              isPDF
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/25'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
            }`}
          >
            {isPDF ? 'Export PDF' : 'Export Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}
