import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Save, 
  Loader2,
  Building2 
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

    businessOwnerService.getHours(selectedBusiness.id)
      .then((res) => {
        if (res?.success && res.data?.hours && Array.isArray(res.data.hours) && res.data.hours.length > 0) {
          const apiHours = res.data.hours;
          setHours(
            DAYS_OF_WEEK.map((day) => {
              const found = apiHours.find((h) => (h.day || '').toLowerCase() === day.toLowerCase());
              return found || {
                day,
                open_time: '08:00',
                close_time: '21:00',
                is_closed: false,
              };
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
    e.preventDefault();
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <div className="text-xs font-semibold text-[#003E83] dark:text-blue-400 uppercase tracking-wider mb-1">
          Operating Schedule ({selectedBusiness.name})
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Operating Hours & Weekly Availability
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Configure standard business opening hours, closed days, and holiday service availability.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading schedule..." />
      ) : (
        <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="space-y-4">
            {hours.map((item, idx) => (
              <div
                key={item.day}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  item.is_closed
                    ? 'bg-slate-50 dark:bg-zinc-800/40 border-slate-200/60 dark:border-zinc-800 opacity-60'
                    : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700/80 shadow-2xs'
                }`}
              >
                <div className="w-32 font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {item.day}
                </div>

                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">Open:</span>
                    <input
                      type="time"
                      disabled={item.is_closed}
                      value={item.open_time || '08:00'}
                      onChange={(e) => handleHourChange(idx, 'open_time', e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-800 dark:text-white disabled:opacity-40"
                    />
                  </div>

                  <span className="text-slate-400">—</span>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">Close:</span>
                    <input
                      type="time"
                      disabled={item.is_closed}
                      value={item.close_time || '21:00'}
                      onChange={(e) => handleHourChange(idx, 'close_time', e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-800 dark:text-white disabled:opacity-40"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer select-none">
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

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 rounded-xl bg-[#003E83] hover:bg-[#002e62] disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>Save Operating Schedule</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
