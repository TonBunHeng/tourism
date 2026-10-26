import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  User, Mail, Phone, MapPin, Award, CheckCircle2,
  AlertCircle, DollarSign, Languages, Clock, BookOpen,
  Edit, Trash2, ShieldCheck, X
} from 'lucide-react';
import { getStatusColor } from '../../utils/StatusUtils';

export default function GuideDetailsModal({
  guide,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete
}) {
  useEffect(() => {
    if (guide) {
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
  }, [guide, onClose]);

  if (!guide) return null;

  const isActive = guide.status === 'verified' || guide.status === 'Active';
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(guide.name || 'Tour Guide')}&background=003E83&color=fff&size=200`;
  const guideAvatar = guide.avatar || guide.photo || guide.image_url || defaultAvatar;

  const languages = Array.isArray(guide.languages)
    ? guide.languages
    : (typeof guide.languages === 'string' ? guide.languages.split(',').map(l => l.trim()).filter(Boolean) : []);

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
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/30 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-md bg-[#003E83] text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-xs overflow-hidden border border-slate-200 dark:border-zinc-700">
                <img
                  src={guideAvatar}
                  alt={guide.name}
                  className="w-full h-full object-cover rounded-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatar;
                  }}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                    {guide.name}
                  </h2>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getStatusColor(isActive ? 'active' : 'inactive')}`}>
                    {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {isActive ? 'Accredited' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs font-mono text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                  License: {guide.license_no || 'Pending Certification'}
                </p>
              </div>
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

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#003E83] dark:text-blue-400" /> Daily Rate
              </span>
              <p className="text-base font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1">
                ${guide.daily_rate || '45'} <span className="text-xs font-normal text-[var(--color-text-muted-light)]">/ day</span>
              </p>
            </div>

            <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Experience
              </span>
              <p className="text-base font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1">
                {guide.experience_years || '5'}+ <span className="text-xs font-normal text-[var(--color-text-muted-light)]">years</span>
              </p>
            </div>

            <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> Region
              </span>
              <p className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 truncate">
                {guide.province || guide.location || 'Siem Reap'}
              </p>
            </div>

            <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/40 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Languages
              </span>
              <p className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1">
                {languages.length} Spoken
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/30 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] block">Email</span>
                  <span className="text-xs font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                    {guide.email || 'No email registered'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] block">Phone</span>
                  <span className="text-xs font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                    {guide.phone || 'No phone registered'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Spoken Languages */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              Language Capabilities
            </h3>
            <div className="flex flex-wrap gap-2">
              {languages.length > 0 ? (
                languages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-md text-xs font-medium bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40"
                  >
                    {lang}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[var(--color-text-muted-light)]">No languages specified</span>
              )}
            </div>
          </div>

          {/* Specialties & Bio */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              Specialties & Historical Expertise
            </h3>
            <div className="p-4 rounded-md bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/30 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <p className="text-xs leading-relaxed text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                {guide.specialties || guide.bio || 'General tourism specialist with extensive background in cultural, architectural, and historical exploration across Cambodian destinations.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-[var(--color-surface-hover-light)]/40 dark:bg-[var(--color-surface-hover-dark)]/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onDelete?.(guide);
            }}
            className="px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Profile</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleStatus?.(guide)}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isActive ? 'Mark Inactive' : 'Accredit Guide'}</span>
            </button>

            <button
              type="button"
              onClick={() => onEdit?.(guide)}
              className="px-4 py-2 bg-[#003E83] hover:bg-[#002e62] text-white rounded-md text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Guide</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
