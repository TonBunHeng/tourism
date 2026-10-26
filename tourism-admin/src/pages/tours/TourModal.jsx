import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, MapPin, Clock, DollarSign, Users, Image as ImageIcon } from 'lucide-react';

const DESTINATIONS = [
  'Siem Reap',
  'Phnom Penh',
  'Battambang',
  'Kampot & Kep',
  'Preah Sihanouk',
  'Koh Kong',
  'Mondulkiri',
  'Ratanakiri',
  'Preah Vihear',
  'Kratie'
];

const TOUR_CATEGORIES = [
  'Cultural & Heritage',
  'Eco Tourism & Nature',
  'Adventure & Trekking',
  'Culinary & Food Tour',
  'Beach & Island Excursion',
  'Historical & War History',
  'Religious & Spiritual'
];

export default function TourModal({
  isOpen,
  onClose,
  editingTour = null,
  onSubmit
}) {
  const [formData, setFormData] = useState({
    title: '',
    destination: 'Siem Reap',
    category: 'Cultural & Heritage',
    duration: '1 Full Day',
    price_per_person: '60',
    max_travelers: '12',
    cover_image: '',
    description: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTour) {
      setFormData({
        title: editingTour.title || '',
        destination: editingTour.destination || editingTour.province || 'Siem Reap',
        category: editingTour.category || 'Cultural & Heritage',
        duration: editingTour.duration || '1 Full Day',
        price_per_person: String(editingTour.price_per_person || editingTour.price || '60'),
        max_travelers: String(editingTour.max_travelers || '12'),
        cover_image: editingTour.cover_image || editingTour.image_url || editingTour.image || '',
        description: editingTour.description || '',
        status: editingTour.status || 'active'
      });
    } else {
      setFormData({
        title: '',
        destination: 'Siem Reap',
        category: 'Cultural & Heritage',
        duration: '1 Full Day',
        price_per_person: '60',
        max_travelers: '12',
        cover_image: '',
        description: '',
        status: 'active'
      });
    }
    setErrors({});
  }, [editingTour, isOpen]);

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

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Tour title is required';
    if (!formData.price_per_person || Number(formData.price_per_person) <= 0) {
      newErrors.price_per_person = 'Valid price per person is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        price_per_person: Number(formData.price_per_person),
        price: Number(formData.price_per_person),
        max_travelers: Number(formData.max_travelers) || 10,
        image_url: formData.cover_image
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-modal-overlay)] backdrop-blur-xs p-4 animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col relative border border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] animate-alert-popup overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/30 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                {editingTour ? 'Edit Tour Package' : 'Create New Tour Package'}
              </h2>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                Set package itinerary, pricing, duration, and group capacity
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* Tour Title */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                Package Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Angkor Sunrise & Floating Village Day Tour"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm ${
                  errors.title ? 'border-rose-400 ring-rose-200' : 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
                }`}
              />
              {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>}
            </div>

            {/* Destination & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  Primary Destination <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.destination}
                  onChange={(e) => handleChange('destination', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer"
                >
                  {DESTINATIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  Tour Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer"
                >
                  {TOUR_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration & Price Per Person */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  Duration (e.g. 1 Day, 3 Days) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  placeholder="1 Full Day or 3 Days / 2 Nights"
                  className="w-full px-3 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  Price / Person (USD) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.price_per_person}
                  onChange={(e) => handleChange('price_per_person', e.target.value)}
                  placeholder="60"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm ${
                    errors.price_per_person ? 'border-rose-400' : 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
                  }`}
                />
                {errors.price_per_person && <p className="text-[11px] text-rose-500 mt-1">{errors.price_per_person}</p>}
              </div>
            </div>

            {/* Max Group Size & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  Max Travelers (Group Size)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_travelers}
                  onChange={(e) => handleChange('max_travelers', e.target.value)}
                  placeholder="12"
                  className="w-full px-3 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  Publish Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer"
                >
                  <option value="active">Active & Published</option>
                  <option value="draft">Draft (Unlisted)</option>
                </select>
              </div>
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                Cover Image URL
              </label>
              <input
                type="url"
                value={formData.cover_image}
                onChange={(e) => handleChange('cover_image', e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                Description & Itinerary Highlights
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Detailed itinerary breakdown, inclusions (water, transport, guide), and departure highlights..."
                className="w-full px-3 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-[var(--color-surface-hover-light)]/40 dark:bg-[var(--color-surface-hover-dark)]/20 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#003E83] hover:bg-[#002e62] text-white rounded-md text-xs font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>{editingTour ? 'Save Changes' : 'Create Package'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
