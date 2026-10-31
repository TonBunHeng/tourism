import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Save,
  Loader2,
  Building2,
  Clock,
  CalendarCheck
} from 'lucide-react';
import businessOwnerService from '../../services/businessOwnerService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function Availability() {
  const { selectedBusiness } = useOutletContext();
  const { showSuccess, showError } = useAlert();

  const [hours, setHours] = useState(
    DAYS_OF_WEEK.map((day) => ({
      day,
      open_time: '08:00',
      close_time: '21:00',
      is_closed: false,
    }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!selectedBusiness?.id) return;
    setIsLoading(true);

    businessOwnerService
      .getHours(selectedBusiness.id)
      .then((res) => {
        if (res?.success && res.data?.hours && Array.isArray(res.data.hours) && res.data.hours.length > 0) {
          const apiHours = res.data.hours;
          setHours(
            DAYS_OF_WEEK.map((day) => {
              const found = apiHours.find((h) => (h.day || '').toLowerCase() === day.toLowerCase());
              return (
                found || {
                  day,
                  open_time: '08:00',
                  close_time: '21:00',
                  is_closed: false,
                }
              );
            })
          );
        }
      })
      .catch((err) => {
        console.warn('Failed to load hours:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedBusiness?.id]);

  const handleHourChange = (index, field, value) => {
    setHours((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!selectedBusiness?.id) return;

    setIsSaving(true);
    try {
      const res = await businessOwnerService.updateHours(selectedBusiness.id, hours);
      if (res?.success) {
        showSuccess('Weekly operating hours saved successfully.');
      }
    } catch (err) {
      showError(err.message || 'Failed to update operating hours.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedBusiness) {
    return (
      <EmptyState
        icon={Building2}
        title="No active business selected"
        description="Select an active business to manage operating hours."
      />
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header Section (matching tourism-admin) */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Operating Hours & Weekly Availability
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Configure standard opening hours, closed days, and visitor arrival schedules for {selectedBusiness.name}.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#003E83] hover:bg-[#002e62] disabled:opacity-50 text-white text-xs sm:text-sm font-medium shadow-xs transition-colors cursor-pointer"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>Save Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16">
          <LoadingSpinner text="Loading schedule..." />
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 shadow-xs p-4 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-zinc-800 text-xs font-semibold text-gray-500 dark:text-zinc-400">
            <Clock size={16} className="text-[#003E83] dark:text-blue-400" />
            <span>Weekly Operating Schedule</span>
          </div>

          <div className="space-y-2.5">
            {hours.map((item, idx) => (
              <div
                key={item.day}
                className={`p-3 rounded-md border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.is_closed
                    ? 'bg-gray-50 dark:bg-zinc-800/40 border-gray-200/60 dark:border-zinc-800 opacity-60'
                    : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700/80 shadow-2xs'
                }`}
              >
                <div className="w-28 font-semibold text-xs sm:text-sm text-gray-900 dark:text-white">
                  {item.day}
                </div>

                <div className="flex items-center gap-2.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-medium">Open:</span>
                    <input
                      type="time"
                      disabled={item.is_closed}
                      value={item.open_time || '08:00'}
                      onChange={(e) => handleHourChange(idx, 'open_time', e.target.value)}
                      className="px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-800 dark:text-white disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                    />
                  </div>

                  <span className="text-gray-400">—</span>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-medium">Close:</span>
                    <input
                      type="time"
                      disabled={item.is_closed}
                      value={item.close_time || '21:00'}
                      onChange={(e) => handleHourChange(idx, 'close_time', e.target.value)}
                      className="px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-800 dark:text-white disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(item.is_closed)}
                    onChange={(e) => handleHourChange(idx, 'is_closed', e.target.checked)}
                    className="w-4 h-4 rounded text-[#003E83] focus:ring-[#003E83]"
                  />
                  <span>Closed</span>
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-zinc-800">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-md bg-[#003E83] hover:bg-[#002e62] disabled:opacity-50 text-white text-xs sm:text-sm font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>Save Operating Schedule</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
