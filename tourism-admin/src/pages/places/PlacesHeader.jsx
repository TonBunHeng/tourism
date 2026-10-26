import { Plus } from 'lucide-react';

export default function PlacesHeader({ onOpenAddModal, onAddPlace, onAddClick }) {
  const handleClick = onOpenAddModal || onAddPlace || onAddClick || (() => {});

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
            Places Management
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
            Manage and organize all heritage sites and attractions
          </p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-md bg-[#003E83] hover:bg-[#002e62] active:scale-[0.98] text-white transition-all shrink-0 w-full sm:w-auto cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Add New Place</span>
        </button>
      </div>
    </div>
  );
}
