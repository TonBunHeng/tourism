import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useLanguage } from '../../i18n';

const CAMBODIA_PROVINCES = [
  'Siem Reap & Angkor',
  'Phnom Penh',
  'Battambang',
  'Kampot & Kep',
  'Preah Sihanouk',
  'Koh Kong',
  'Mondulkiri',
  'Ratanakiri',
  'Preah Vihear',
  'Kratie',
  'Pursat',
  'Kampong Cham'
];

const PROVINCE_KEYS = {
  'Siem Reap & Angkor': 'provSiemReap',
  'Siem Reap': 'provSiemReap',
  'Phnom Penh': 'provPhnomPenh',
  'Battambang': 'provBattambang',
  'Kampot & Kep': 'provKampotKep',
  'Kampot': 'provKampotKep',
  'Kep': 'provKampotKep',
  'Preah Sihanouk': 'provSihanouk',
  'Sihanoukville': 'provSihanouk',
  'Koh Kong': 'provKohKong',
  'Mondulkiri': 'provMondulkiri',
  'Ratanakiri': 'provRatanakiri',
  'Preah Vihear': 'provPreahVihear',
  'Kratie': 'provKratie',
  'Pursat': 'provPursat',
  'Kampong Cham': 'provKampongCham'
};

export default function GuideModal({
  isOpen,
  onClose,
  editingGuide = null,
  onSubmit
}) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    license_no: '',
    province: 'Siem Reap & Angkor',
    languages: 'Khmer, English',
    daily_rate: '45',
    experience_years: '5',
    specialties: '',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingGuide) {
      setFormData({
        name: editingGuide.name || '',
        email: editingGuide.email || '',
        phone: editingGuide.phone || '',
        license_no: editingGuide.license_no || '',
        province: editingGuide.province || editingGuide.location || 'Siem Reap & Angkor',
        languages: Array.isArray(editingGuide.languages)
          ? editingGuide.languages.join(', ')
          : (editingGuide.languages || 'Khmer, English'),
        daily_rate: String(editingGuide.daily_rate ?? '45'),
        experience_years: String(editingGuide.experience_years ?? '5'),
        specialties: editingGuide.specialties || editingGuide.bio || '',
        status: editingGuide.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        license_no: 'MOT-SR-2026-',
        province: 'Siem Reap & Angkor',
        languages: 'Khmer, English',
        daily_rate: '45',
        experience_years: '5',
        specialties: '',
        status: 'Active'
      });
    }
    setErrors({});
  }, [editingGuide, isOpen]);

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
    if (!formData.name.trim()) {
      newErrors.name = t('guides.nameRequired', 'Full name is required');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('guides.emailRequired', 'Email address is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = t('guides.emailInvalid', 'Please enter a valid email address');
    }
    if (!formData.license_no.trim()) {
      newErrors.license_no = t('guides.licenseRequired', 'MoT License number is required');
    }
    if (!formData.daily_rate || Number(formData.daily_rate) <= 0) {
      newErrors.daily_rate = t('guides.rateRequired', 'Valid daily rate is required');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedLangs = formData.languages.split(',').map(l => l.trim()).filter(Boolean);
      await onSubmit({
        ...formData,
        languages: parsedLangs,
        daily_rate: Number(formData.daily_rate) || 45,
        experience_years: Number(formData.experience_years) || 1,
        location: formData.province
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
                {editingGuide
                  ? t('guides.modalEditTitle', 'Edit Tour Guide Profile')
                  : t('guides.modalRegisterTitle', 'Register New Tour Guide')}
              </h2>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                {t('guides.modalSubtitle', 'Ministry of Tourism licensing credential & contact information')}
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
            {/* Guide Name */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                {t('guides.guideFullName', 'Guide Full Name')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t('guides.namePlaceholder', 'e.g. Sopheaktra Bun')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm ${
                  errors.name ? 'border-rose-400 ring-rose-200' : 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            {/* License No & Province */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  {t('guides.licenseNo', 'MoT License No.')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.license_no}
                  onChange={(e) => handleChange('license_no', e.target.value)}
                  placeholder={t('guides.licensePlaceholder', 'MOT-SR-2026-001')}
                  className={`w-full px-3 py-2 font-mono border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm ${
                    errors.license_no ? 'border-rose-400' : 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
                  }`}
                />
                {errors.license_no && <p className="text-[11px] text-rose-500 mt-1">{errors.license_no}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  {t('guides.primaryRegion', 'Primary Region')} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.province}
                  onChange={(e) => handleChange('province', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer"
                >
                  {CAMBODIA_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {PROVINCE_KEYS[p] ? t(`guides.${PROVINCE_KEYS[p]}`, p) : p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  {t('guides.emailAddress', 'Email Address')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder={t('guides.emailPlaceholder', 'guide@cambodiatourism.gov.kh')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm ${
                    errors.email ? 'border-rose-400' : 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
                  }`}
                />
                {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  {t('guides.phoneNumber', 'Phone Number')}
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder={t('guides.phonePlaceholder', '+855 12 345 678')}
                  className="w-full px-3 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm"
                />
              </div>
            </div>

            {/* Spoken Languages */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                {t('guides.spokenLanguages', 'Spoken Languages (comma separated)')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.languages}
                onChange={(e) => handleChange('languages', e.target.value)}
                placeholder={t('guides.languagesPlaceholder', 'Khmer, English, French, Japanese')}
                className="w-full px-3 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm"
              />
              <span className="text-[11px] text-[var(--color-text-muted-light)] mt-1 block">
                {t('guides.languagesHint', 'Separated by commas, e.g. Khmer, English, French')}
              </span>
            </div>

            {/* Daily Rate & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  {t('guides.dailyRate', 'Daily Rate (USD)')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.daily_rate}
                  onChange={(e) => handleChange('daily_rate', e.target.value)}
                  placeholder={t('guides.ratePlaceholder', '45')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm ${
                    errors.daily_rate ? 'border-rose-400' : 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]'
                  }`}
                />
                {errors.daily_rate && <p className="text-[11px] text-rose-500 mt-1">{errors.daily_rate}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                  {t('guides.experienceYears', 'Experience (Years)')}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={(e) => handleChange('experience_years', e.target.value)}
                  placeholder={t('guides.experiencePlaceholder', '5')}
                  className="w-full px-3 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm"
                />
              </div>
            </div>

            {/* Specialties & Historical Focus */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                {t('guides.specialties', 'Specialties & Focus')}
              </label>
              <textarea
                rows={3}
                value={formData.specialties}
                onChange={(e) => handleChange('specialties', e.target.value)}
                placeholder={t('guides.specialtiesPlaceholder', 'e.g. Angkor Wat bas-reliefs, Angkor Thom history, Kulen waterfalls...')}
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
              {t('guides.cancelBtn', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#003E83] hover:bg-[#002e62] text-white rounded-md text-xs font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>{editingGuide ? t('guides.saveChangesBtn', 'Save Changes') : t('guides.registerBtn', 'Register Guide')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
