import { useEffect } from 'react';
import { X, Check, Users, Navigation, Star, Edit } from 'lucide-react';

export default function ProvinceDetailsModal({ province, onClose, onEditProvince }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (province) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [province, onClose]);

  if (!province) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark-modal)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] rounded-md max-w-lg w-full shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden animate-alert-popup flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">Province Details</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">ID: #{province.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-all active:scale-90 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Province Name</span>
            <p className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1">{province.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Type</span>
              <p className="text-sm font-medium text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] mt-1">{province.type}</p>
            </div>
            <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Status</span>
              <p className="text-sm font-medium text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] mt-1 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                {province.status}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Population</span>
              <p className="text-sm font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]" />
                {province.population}
              </p>
            </div>
            <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Area</span>
              <p className="text-sm font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]" />
                {province.area}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Districts & Communes</span>
              <p className="text-sm font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1">
                {province.districts} Districts, {province.communes} Communes
              </p>
            </div>
            <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Rating & Places</span>
              <p className="text-sm font-medium text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)] mt-1 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[var(--color-warning-text)] dark:fill-[var(--color-warning-dark-text)]" />
                {province.rating} ({province.places} places)
              </p>
            </div>
          </div>

          <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Description</span>
            <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">{province.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark-modal)]">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onEditProvince) onEditProvince(province);
            }}
            className="py-2 px-4 rounded-md bg-[#003E83] hover:bg-[#002e62] text-white font-medium text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            Edit Province
          </button>
        </div>
      </div>
    </div>
  );
}
