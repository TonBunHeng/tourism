import React from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';

export default function TrackingHeader({
  onExportPDF,
  onExportExcel,
}) {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
            Users Tracking
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
            Track CRUD history, updates, and item deletions across all platform roles
          </p>
        </div>

        {/* Action Controls: PDF and Excel Exports */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Export PDF Button */}
          <button
            type="button"
            onClick={onExportPDF}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-medium rounded-md bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white transition-all shadow-xs cursor-pointer"
            title="Export Activity to PDF"
          >
            <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>PDF</span>
          </button>

          {/* Export Excel Button */}
          <button
            type="button"
            onClick={onExportExcel}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-medium rounded-md bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white transition-all shadow-xs cursor-pointer"
            title="Export Activity to Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
}
