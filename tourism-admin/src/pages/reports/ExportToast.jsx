// src/pages/reports/ExportToast.jsx
import { useEffect } from 'react';
import { CheckCircle2, FileSpreadsheet, FileText, X } from 'lucide-react';

export default function ExportToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isPDF = toast.format === 'pdf';

  return (
    <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-md max-w-sm w-full">
      <div className={`p-2.5 rounded-md shrink-0 ${
        isPDF
          ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
      }`}>
        {isPDF ? <FileText className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100 truncate">
            {isPDF ? 'PDF Exported Successfully' : 'Excel Exported Successfully'}
          </h4>
        </div>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 truncate font-mono">
          {toast.filename}
        </p>
      </div>

      <button
        onClick={onClose}
        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
