import { useState, useEffect } from 'react';
import {
  ChevronDown,
  Upload,
  Trash2,
  Calendar,
  AlertCircle,
  Sparkles,
  Layers,
  CheckCircle2,
  FileText,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Plus,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import uploadService from '../../services/uploadService';
import { validateImageFile } from '../../utils/fileValidation';

export const calculateAutoStatus = (startDate, endDate, manualStatus) => {
  if (manualStatus === 'Cancelled') return 'Cancelled';
  if (!startDate) return 'Upcoming';

  const todayStr = new Date().toISOString().split('T')[0];
  const start = String(startDate).slice(0, 10);
  const end = endDate ? String(endDate).slice(0, 10) : start;

  if (todayStr < start) {
    return 'Upcoming';
  } else if (todayStr > end) {
    return 'Completed';
  } else {
    return 'Ongoing';
  }
};

export default function EventModal({
  isOpen,
  editingEvent,
  formData = {},
  onFormDataChange,
  onFormChange,
  onClose,
  onSubmit,
  categories = ['Cultural', 'Festival', 'Sports', 'Food', 'Music', 'Exhibition']
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [autoStatusMode, setAutoStatusMode] = useState(true);
  const [fileValidationError, setFileValidationError] = useState('');

  const safeFormData = formData || {};
  const safeCategories = Array.isArray(categories) && categories.length > 0
    ? categories
    : ['Cultural', 'Festival', 'Sports', 'Food', 'Music', 'Exhibition'];

  const updateForm = (newData) => {
    if (onFormDataChange) {
      onFormDataChange(newData);
    } else if (onFormChange) {
      onFormChange(newData);
    }
  };

  const handleStartDateChange = (val) => {
    const nextData = { ...safeFormData, start_date: val, date: val };
    if (autoStatusMode) {
      nextData.status = calculateAutoStatus(val, safeFormData.end_date, safeFormData.status);
    }
    updateForm(nextData);
  };

  const handleEndDateChange = (val) => {
    const nextData = { ...safeFormData, end_date: val };
    if (autoStatusMode) {
      nextData.status = calculateAutoStatus(safeFormData.start_date, val, safeFormData.status);
    }
    updateForm(nextData);
  };

  const handleManualStatusChange = (val) => {
    if (val === 'Auto') {
      setAutoStatusMode(true);
      const computed = calculateAutoStatus(safeFormData.start_date, safeFormData.end_date);
      updateForm({ ...safeFormData, status: computed });
    } else {
      setAutoStatusMode(false);
      updateForm({ ...safeFormData, status: val });
    }
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileValidationError('');
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setFileValidationError(validation.error);
      if (e.target) e.target.value = '';
      return;
    }

    // Instant local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      updateForm({ ...safeFormData, imageUrl: reader.result, image_url: reader.result });
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const res = await uploadService.uploadFile(file, 'events');
      if (res.success && res.data?.url) {
        updateForm({ ...safeFormData, imageUrl: res.data.url, image_url: res.data.url });
      }
    } catch (err) {
      console.warn('Backend event image upload fallback to preview:', err);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose?.();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentComputedStatus = calculateAutoStatus(safeFormData.start_date, safeFormData.end_date, safeFormData.status);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] rounded-md max-w-lg w-full shadow-2xl border border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] overflow-hidden animate-alert-popup flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#003E83]/10 text-[#003E83] dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                {editingEvent ? 'Update festival schedules and venue information' : 'Create cultural festivals, exhibitions or seasonal activities'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {fileValidationError && (
              <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-700 dark:text-red-400 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fileValidationError}</span>
              </div>
            )}

            {/* Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  Category *
                </label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    value={safeFormData.category || safeCategories[0]}
                    onChange={(e) => updateForm({ ...safeFormData, category: e.target.value })}
                    className="appearance-none w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md pl-9 pr-9 py-2.5 text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] cursor-pointer"
                  >
                    {safeCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    Status *
                  </label>
                  {autoStatusMode && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3" /> Auto Active
                    </span>
                  )}
                </div>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    value={autoStatusMode ? 'Auto' : (safeFormData.status || 'Upcoming')}
                    onChange={(e) => handleManualStatusChange(e.target.value)}
                    className="appearance-none w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md pl-9 pr-9 py-2.5 text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] cursor-pointer"
                  >
                    <option value="Auto">✨ Auto ({currentComputedStatus})</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Event Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                Event Title *
              </label>
              <div className="relative">
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={safeFormData.title || ''}
                  onChange={(e) => updateForm({ ...safeFormData, title: e.target.value })}
                  placeholder="e.g. Bon Om Touk (Water Festival), Angkor Marathon"
                  className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                  required
                />
              </div>
            </div>

            {/* Event Picture Upload Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                Event Banner / Picture
              </label>

              {safeFormData.imageUrl || safeFormData.image_url ? (
                <div className="relative w-full h-36 rounded-md overflow-hidden border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] group mb-2 shadow-xs">
                  <img
                    src={safeFormData.imageUrl || safeFormData.image_url}
                    alt="Event Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="px-3 py-1.5 bg-[#003E83] hover:bg-[#002e62] text-white rounded-md text-xs font-medium transition-colors cursor-pointer">
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileChange}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => updateForm({ ...safeFormData, imageUrl: '', image_url: '' })}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50/70 dark:bg-zinc-800/40 rounded-md p-4 text-center hover:border-[#003E83] dark:hover:border-[#003E83] transition-colors cursor-pointer block mb-2">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
                  <p className="text-gray-800 dark:text-zinc-200 font-medium text-xs">
                    {isUploading ? 'Uploading banner to server...' : 'Click to upload event banner'}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">PNG, JPG, WEBP</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFileChange}
                  />
                </label>
              )}

              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={safeFormData.imageUrl || safeFormData.image_url || ''}
                  onChange={(e) => updateForm({ ...safeFormData, imageUrl: e.target.value, image_url: e.target.value })}
                  placeholder="Or paste banner image URL (https://...)"
                  className="w-full pl-9 pr-4 py-2 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-xs text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                Description
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                <textarea
                  value={safeFormData.description || ''}
                  onChange={(e) => updateForm({ ...safeFormData, description: e.target.value })}
                  placeholder="Describe festival activities, schedule, and cultural importance..."
                  rows={2}
                  className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] resize-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={safeFormData.location || ''}
                  onChange={(e) => updateForm({ ...safeFormData, location: e.target.value })}
                  placeholder="e.g. Tonle Sap Riverfront, Phnom Penh"
                  className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                  required
                />
              </div>
            </div>

            {/* Start Date & End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  Start Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={safeFormData.start_date || safeFormData.date || ''}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={safeFormData.end_date || ''}
                    min={safeFormData.start_date || ''}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Time & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  Event Time
                </label>
                {(() => {
                  const rawTime = safeFormData.start_time || safeFormData.time || '08:00 AM';
                  let time24 = '08:00';
                  const match = String(rawTime).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
                  if (match) {
                    let h = parseInt(match[1], 10);
                    const m = match[2];
                    const p = match[3] ? match[3].toUpperCase() : 'AM';
                    if (p === 'PM' && h < 12) h += 12;
                    if (p === 'AM' && h === 12) h = 0;
                    time24 = `${String(h).padStart(2, '0')}:${m}`;
                  } else if (/^\d{2}:\d{2}$/.test(rawTime)) {
                    time24 = rawTime;
                  }

                  const handleNativeTimeChange = (val24) => {
                    if (!val24) return;
                    const parts = val24.split(':');
                    let h = parseInt(parts[0], 10);
                    const m = parts[1];
                    const period = h >= 12 ? 'PM' : 'AM';
                    h = h % 12 || 12;
                    const time12 = `${String(h).padStart(2, '0')}:${m} ${period}`;
                    updateForm({ ...safeFormData, start_time: time12, time: time12 });
                  };

                  return (
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="time"
                        value={time24}
                        onChange={(e) => handleNativeTimeChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all cursor-pointer"
                      />
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  Price
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={safeFormData.price || ''}
                    onChange={(e) => updateForm({ ...safeFormData, price: e.target.value })}
                    placeholder="e.g. Free, $45 USD"
                    className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Organizer */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                Organizer
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={safeFormData.organizer || ''}
                  onChange={(e) => updateForm({ ...safeFormData, organizer: e.target.value })}
                  placeholder="e.g. Ministry of Tourism, National Olympic Committee"
                  className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-6 py-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-[var(--color-surface-hover-light)]/40 dark:bg-[var(--color-surface-hover-dark)]/20 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] font-medium text-sm transition-colors text-center cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !safeFormData.title?.trim() || !safeFormData.location?.trim()}
              className="flex-1 py-2.5 px-4 rounded-md bg-[#003E83] hover:bg-[#002e62] active:scale-[0.98] text-white font-medium text-sm transition-all text-center cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isUploading ? (
                'Uploading Image...'
              ) : editingEvent ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Update Event</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Event</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
