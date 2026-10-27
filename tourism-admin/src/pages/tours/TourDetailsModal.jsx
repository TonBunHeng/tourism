import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles, MapPin, Clock, DollarSign, Users, Star,
  CheckCircle2, AlertCircle, Edit, Trash2, X, Calendar
} from 'lucide-react';
import { useLanguage } from '../../i18n';
import { getStatusColor } from '../../utils/StatusUtils';

export default function TourDetailsModal({
  tour,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete
}) {
  const { t } = useLanguage();

  useEffect(() => {
    if (tour) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose?.();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [tour, onClose]);

  if (!tour) return null;

  const isActive = tour.status === 'active';
  const fallbackImage = 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80';
  const coverImage = tour.cover_image || tour.image_url || tour.image || fallbackImage;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-modal-overlay)] backdrop-blur-xs p-4 animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col relative border border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] animate-alert-popup overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Image & Header */}
        <div className="relative aspect-16/9 w-full bg-slate-900 overflow-hidden shrink-0">
          <img
            src={coverImage}
            alt={tour.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-colors cursor-pointer backdrop-blur-md"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badges on cover */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
            <div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#003E83] text-white shadow-xs">
                {tour.category || t('tours.defaultCategory', 'Cultural & Heritage')}
              </span>
              <h2 className="text-lg md:text-xl font-bold text-white mt-1.5 drop-shadow-sm">
                {tour.title}
              </h2>
            </div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor(isActive ? 'active' : 'inactive')}`}>
              {isActive ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <AlertCircle className="w-3.5 h-3.5 mr-1" />}
              {isActive ? t('tours.statusPublished', 'Published') : t('tours.statusDraft', 'Draft')}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#003E83] dark:text-blue-400" /> {t('tours.pricePersonLabel', 'Price / Person')}
              </span>
              <p className="text-base font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1">
                ${tour.price_per_person || tour.price || 0}
              </p>
            </div>

            <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {t('tours.durationLabel', 'Duration')}
              </span>
              <p className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 truncate">
                {tour.duration || t('tours.defaultDuration', '1 Full Day')}
              </p>
            </div>

            <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {t('tours.destinationLabel', 'Destination')}
              </span>
              <p className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 truncate">
                {tour.destination || t('tours.defaultDestination', 'Siem Reap')}
              </p>
            </div>

            <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> {t('tours.maxTravelersLabel', 'Max Travelers')}
              </span>
              <p className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1">
                {t('tours.upToPax', 'Up to {count}').replace('{count}', tour.max_travelers || 12)}
              </p>
            </div>
          </div>

          {/* Rating & Traveler Reviews */}
          <div className="p-4 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/30 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <div>
                <span className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                  {tour.rating || '5.0'} / 5.0
                </span>
                <span className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] ml-2">
                  ({tour.reviews_count || 0} {t('tours.verifiedReviews', 'verified reviews')})
                </span>
              </div>
            </div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {t('tours.satisfactionLabel', 'High Traveler Satisfaction')}
            </span>
          </div>

          {/* Description & Itinerary Highlights */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {t('tours.itineraryOverview', 'Itinerary Overview & Highlights')}
            </h3>
            <div className="p-4 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/30 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <p className="text-xs leading-relaxed text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] whitespace-pre-line">
                {tour.description || t('tours.defaultDescription', 'All-inclusive curated itinerary exploring majestic temples, local artisan workshops, and authentic dining across Cambodia with accredited licensed guides.')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-[var(--color-surface-hover-light)]/40 dark:bg-[var(--color-surface-hover-dark)]/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onDelete?.(tour)}
            className="px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('tours.deletePackage', 'Delete Package')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleStatus?.(tour)}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isActive ? t('tours.moveToDraft', 'Move to Draft') : t('tours.publishTour', 'Publish Tour')}</span>
            </button>

            <button
              type="button"
              onClick={() => onEdit?.(tour)}
              className="px-4 py-2 bg-[#003E83] hover:bg-[#002e62] text-white rounded-md text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>{t('tours.editPackage', 'Edit Package')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
