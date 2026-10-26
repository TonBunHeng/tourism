import { useRef } from 'react';
import { Download, FileSpreadsheet, BarChart2, Calendar, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ReportsHeader({
  selectedDay,
  setSelectedDay,
  onSubmitFilter,
  onResetFilter,
  onExportPDF,
  onExportExcel,
  isSubmitting,
  isResetting
}) {
  const dateInputRef = useRef(null);

  const handleOpenPicker = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        try {
          dateInputRef.current.showPicker();
        } catch {
          dateInputRef.current.focus();
        }
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  // Shared class so Submit / Reset / PDF / Excel are consistent in size
  const actionBtnClass =
    'flex items-center justify-center gap-1.5 md:gap-2 px-3.5 sm:px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-colors cursor-pointer disabled:opacity-50 shrink-0';

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
            Reports Management
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
            Export comprehensive tourism data, user engagement metrics
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          {/* Reports Analytics Button */}
          <Link
            to="/reports/analytics"
            className="flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-md bg-[#003E83] hover:bg-[#002e62] text-white transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            <BarChart2 className="w-4 h-4 shrink-0" />
            <span>Analytics</span>
          </Link>

          {/* Date Filter Controls */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            {/* Styled Date Picker Button */}
            <div
              onClick={handleOpenPicker}
              className="relative flex items-center justify-center gap-1.5 md:gap-2 px-3.5 py-2 text-xs md:text-sm font-medium rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDay || ''}
                onChange={(e) => {
                  setSelectedDay(e.target.value);
                  if (onSubmitFilter) onSubmitFilter(e.target.value);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                title={selectedDay ? `Selected Date: ${selectedDay}` : 'Select Date Filter'}
              />
              <Calendar className="w-4 h-4 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] shrink-0" />
              <span className="font-semibold text-xs md:text-sm tracking-tight text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                {selectedDay || 'Date Filter'}
              </span>
              {selectedDay && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDay('');
                    if (onResetFilter) onResetFilter();
                  }}
                  className="relative z-20 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-red-500 cursor-pointer ml-1"
                  title="Clear Date"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Export PDF & Excel Row */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Export PDF */}
            <button
              onClick={onExportPDF}
              className={`${actionBtnClass} border border-transparent bg-red-600 hover:bg-red-700 text-white shadow-sm flex-1 sm:flex-initial`}
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>PDF</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={onExportExcel}
              className={`${actionBtnClass} border border-transparent bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex-1 sm:flex-initial`}
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}