import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Plus, Search, MapPin, Check, BookmarkPlus, Sparkles } from 'lucide-react';

export default function FavoriteModal({
  isOpen,
  onClose,
  newPlace = {},
  setNewPlace,
  onNewPlaceChange,
  categories = ['Temple', 'Palace', 'Beach', 'Nature', 'Market', 'Farm'],
  onSubmit,
  availablePlaces = [],
  onAddExisting
}) {
  const [activeTab, setActiveTab] = useState('existing'); // 'existing' | 'custom'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  const [placeSearch, setPlaceSearch] = useState('');
  const [markVisitedOnAdd, setMarkVisitedOnAdd] = useState(false);

  if (!isOpen) return null;

  const updatePlace = onNewPlaceChange || setNewPlace || (() => {});

  const filteredCategories = categories.filter(c => c !== 'All');
  const availableFilteredPlaces = availablePlaces.filter(p =>
    p.name?.toLowerCase().includes(placeSearch.toLowerCase()) ||
    p.address?.toLowerCase().includes(placeSearch.toLowerCase()) ||
    p.province?.toLowerCase().includes(placeSearch.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark-modal)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] rounded-md max-w-lg w-full shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] animate-alert-popup"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:text-[var(--color-info-dark-text)]">
              <BookmarkPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
                Add Favorite Place
              </h3>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                Save a new destination to your personal collection
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:text-[var(--color-text-primary-light)] dark:hover:text-[var(--color-white)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] rounded-md transition-all active:scale-90 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        {availablePlaces.length > 0 && (
          <div className="flex border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] px-6 pt-3 bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/30">
            <button
              type="button"
              onClick={() => setActiveTab('existing')}
              className={`pb-2.5 px-3 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'existing'
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)] dark:text-[var(--color-info-dark-text)]'
                  : 'border-transparent text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:text-[var(--color-text-primary-light)]'
              }`}
            >
              Select from Places ({availablePlaces.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`pb-2.5 px-3 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'custom'
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)] dark:text-[var(--color-info-dark-text)]'
                  : 'border-transparent text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:text-[var(--color-text-primary-light)]'
              }`}
            >
              Create New Place
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'existing' && availablePlaces.length > 0 ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)]" />
                <input
                  type="text"
                  placeholder="Search existing places..."
                  value={placeSearch}
                  onChange={(e) => setPlaceSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs md:text-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={markVisitedOnAdd}
                    onChange={(e) => setMarkVisitedOnAdd(e.target.checked)}
                    className="rounded-md text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <span>Mark as visited immediately</span>
                </label>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {availableFilteredPlaces.length > 0 ? (
                  availableFilteredPlaces.map((place) => (
                    <div
                      key={place.id}
                      className="p-3 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-surface-hover-light)]/40 dark:bg-[var(--color-surface-hover-dark)]/20 hover:border-[var(--color-primary)]/50 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-200 dark:bg-zinc-700 shrink-0">
                          {place.image_url || place.image ? (
                            <img
                              src={place.image_url || place.image}
                              alt={place.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                              PL
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                            {place.name}
                          </p>
                          <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-[var(--color-rose-badge-text)] shrink-0" />
                            <span className="truncate">{place.address || place.province || 'Cambodia'}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onAddExisting && onAddExisting(place.id, markVisitedOnAdd)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all shrink-0 cursor-pointer shadow-sm"
                      >
                        + Add
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    No matching places found.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  Place Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Angkor Wat, Pub Street..."
                  value={newPlace.name || ''}
                  onChange={(e) => updatePlace({ ...newPlace, name: e.target.value })}
                  className="w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md px-3.5 py-2.5 text-xs md:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={newPlace.category || (filteredCategories[0] || 'Temple')}
                      onChange={(e) => updatePlace({ ...newPlace, category: e.target.value })}
                      className="appearance-none w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md px-3.5 py-2.5 text-xs md:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 cursor-pointer"
                    >
                      {filteredCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Location / Province *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Siem Reap, Cambodia"
                    value={newPlace.location || ''}
                    onChange={(e) => updatePlace({ ...newPlace, location: e.target.value })}
                    className="w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md px-3.5 py-2.5 text-xs md:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Best Time to Visit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Sunrise / 6:00 AM"
                    value={newPlace.bestTime || ''}
                    onChange={(e) => updatePlace({ ...newPlace, bestTime: e.target.value })}
                    className="w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md px-3.5 py-2.5 text-xs md:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Price / Entry Fee
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Free or $20"
                    value={newPlace.price || ''}
                    onChange={(e) => updatePlace({ ...newPlace, price: e.target.value })}
                    className="w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md px-3.5 py-2.5 text-xs md:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newPlace.image || newPlace.image_url || ''}
                  onChange={(e) => updatePlace({ ...newPlace, image: e.target.value, image_url: e.target.value })}
                  className="w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md px-3.5 py-2.5 text-xs md:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Tell us what makes this place special..."
                  value={newPlace.description || ''}
                  onChange={(e) => updatePlace({ ...newPlace, description: e.target.value })}
                  className="w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md px-3.5 py-2.5 text-xs md:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 resize-none"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-md border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 font-medium text-xs md:text-sm transition-colors text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-md bg-[#003E83] hover:bg-[#002e62] text-white font-medium text-xs md:text-sm transition-colors text-center cursor-pointer"
                >
                  Save & Favorite
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
