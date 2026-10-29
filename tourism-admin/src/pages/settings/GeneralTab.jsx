import { useState, useEffect } from 'react';
import {
  Globe,
  Mail,
  Phone,
  Clock,
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  FileText,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { validateImageFile } from '../../utils/fileValidation';
import uploadService from '../../services/uploadService';
import { useLanguage } from '../../i18n';

export default function GeneralTab({ settings, setSettings }) {
  const { t } = useLanguage();
  const [logoPreview, setLogoPreview] = useState(settings.logoUrl || null);
  const [faviconPreview, setFaviconPreview] = useState(settings.faviconUrl || null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Sync previews whenever settings change from server
  useEffect(() => {
    setLogoPreview(settings.logoUrl || null);
  }, [settings.logoUrl]);

  useEffect(() => {
    setFaviconPreview(settings.faviconUrl || null);
  }, [settings.faviconUrl]);

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      if (e.target) e.target.value = '';
      return;
    }

    setUploadingLogo(true);
    try {
      // Attempt server file upload first
      const res = await uploadService.uploadFile(file, 'settings');
      if (res.success && res.data?.url) {
        setLogoPreview(res.data.url);
        handleChange('logoUrl', res.data.url);
        handleChange('logoFileName', file.name);
      } else {
        throw new Error('Server returned invalid file response');
      }
    } catch {
      // Graceful local preview fallback
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        setLogoPreview(base64);
        handleChange('logoUrl', base64);
        handleChange('logoFileName', file.name);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    const isIco = file.name.toLowerCase().endsWith('.ico');
    if (!isIco) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setUploadError(validation.error);
        if (e.target) e.target.value = '';
        return;
      }
    }

    setUploadingFavicon(true);
    try {
      const res = await uploadService.uploadFile(file, 'settings');
      if (res.success && res.data?.url) {
        setFaviconPreview(res.data.url);
        handleChange('faviconUrl', res.data.url);
        handleChange('faviconFileName', file.name);
      } else {
        throw new Error('Server returned invalid file response');
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        setFaviconPreview(base64);
        handleChange('faviconUrl', base64);
        handleChange('faviconFileName', file.name);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingFavicon(false);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    handleChange('logoUrl', '');
    handleChange('logoFileName', '');
  };

  const removeFavicon = () => {
    setFaviconPreview(null);
    handleChange('faviconUrl', '');
    handleChange('faviconFileName', '');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
          {t('settings.generalTitle', 'General Platform Settings')}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
          {t('settings.generalSubtitle', 'Configure official platform identity, organization details, emergency contacts, localization, and branding assets.')}
        </p>
      </div>

      {/* Card 1: Platform Identity & Organization */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
          <Globe className="w-4 h-4 text-[var(--color-primary)]" />
          {t('settings.cardPlatformIdentity', 'Platform Identity & Department')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              {t('settings.labelSystemName', 'System Name')} <span className="text-[var(--color-danger-text)]">*</span>
            </label>
            <input
              type="text"
              value={settings.siteName || ''}
              onChange={(e) => handleChange('siteName', e.target.value)}
              placeholder={t('settings.placeholderSystemName', 'e.g. AngkorVerses Administrative Portal')}
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              {t('settings.labelOrganization', 'Organization / Ministry')} <span className="text-[var(--color-danger-text)]">*</span>
            </label>
            <input
              type="text"
              value={settings.organizationName || ''}
              onChange={(e) => handleChange('organizationName', e.target.value)}
              placeholder={t('settings.placeholderOrganization', 'e.g. Ministry of Tourism & Culture Cambodia')}
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              {t('settings.labelPlatformDescription', 'Platform Overview & Description')}
            </label>
            <textarea
              rows={2}
              value={settings.siteDescription || ''}
              onChange={(e) => handleChange('siteDescription', e.target.value)}
              placeholder={t('settings.placeholderPlatformDescription', "Describe the tourism portal's primary purpose and target tourist audience...")}
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Card 2: Official Support & Emergency Contacts */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
          <Phone className="w-4 h-4 text-[var(--color-primary)]" />
          {t('settings.cardEmergencyHotlines', 'Official Support & Tourist Emergency Hotlines')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              {t('settings.labelSupportEmail', 'Official Support Email')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]" />
              <input
                type="email"
                value={settings.contactEmail || ''}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                placeholder={t('settings.placeholderSupportEmail', 'support@tourism.gov.kh')}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              {t('settings.labelSupportPhone', 'Support Phone Hotline')}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]" />
              <input
                type="text"
                value={settings.contactPhone || ''}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                placeholder={t('settings.placeholderSupportPhone', '+855 23 888 999')}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              {t('settings.labelPoliceHotline', 'National Police Hotline')}
            </label>
            <input
              type="text"
              value={settings.emergencyPolice ?? '117'}
              onChange={(e) => handleChange('emergencyPolice', e.target.value)}
              placeholder="117"
              className="w-full px-3 py-2 text-sm font-mono rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              {t('settings.labelAmbulanceHotline', 'National Ambulance / Medical Emergency')}
            </label>
            <input
              type="text"
              value={settings.emergencyAmbulance ?? '119'}
              onChange={(e) => handleChange('emergencyAmbulance', e.target.value)}
              placeholder="119"
              className="w-full px-3 py-2 text-sm font-mono rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              {t('settings.labelFireHotline', 'Fire & Rescue Emergency Hotline')}
            </label>
            <input
              type="text"
              value={settings.emergencyFire ?? '118'}
              onChange={(e) => handleChange('emergencyFire', e.target.value)}
              placeholder="118"
              className="w-full px-3 py-2 text-sm font-mono rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              {t('settings.labelTouristPoliceHotline', 'Tourist Police Emergency Number')}
            </label>
            <input
              type="text"
              value={settings.emergencyTouristPolice ?? '+855 31 322 2117'}
              onChange={(e) => handleChange('emergencyTouristPolice', e.target.value)}
              placeholder="+855 31 322 2117"
              className="w-full px-3 py-2 text-sm font-mono rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Card 3: Regional Localization & Formats */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
          <Clock className="w-4 h-4 text-[var(--color-primary)]" />
          {t('settings.cardRegionalLocale', 'Regional Localization & Currency')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              {t('settings.labelDefaultLanguage', 'Default System Language')}
            </label>
            <select
              value={settings.defaultLanguage || 'km'}
              onChange={(e) => handleChange('defaultLanguage', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
            >
              <option value="km">ខ្មែរ (Khmer)</option>
              <option value="en">English (US)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              {t('settings.labelDefaultCurrency', 'Default Currency')}
            </label>
            <select
              value={settings.defaultCurrency || 'USD'}
              onChange={(e) => handleChange('defaultCurrency', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
            >
              <option value="USD">USD ($ - US Dollar)</option>
              <option value="KHR">KHR (៛ - Cambodian Riel)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              {t('settings.labelTimezone', 'Timezone')}
            </label>
            <select
              value={settings.timezone || 'Asia/Phnom_Penh'}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
            >
              <option value="Asia/Phnom_Penh">Asia/Phnom_Penh (GMT+07:00 ICT)</option>
              <option value="America/New_York">America/New_York (GMT-05:00)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card 4: Legal & Policy URLs */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
          <FileText className="w-4 h-4 text-[var(--color-primary)]" />
          {t('settings.cardLegalLinks', 'Public Legal & Compliance Links')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              {t('settings.labelTermsUrl', 'Terms of Service URL')}
            </label>
            <input
              type="url"
              value={settings.termsOfServiceUrl || ''}
              onChange={(e) => handleChange('termsOfServiceUrl', e.target.value)}
              placeholder="https://tourism.gov.kh/terms"
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1">
              {t('settings.labelPrivacyUrl', 'Privacy Policy URL')}
            </label>
            <input
              type="url"
              value={settings.privacyPolicyUrl || ''}
              onChange={(e) => handleChange('privacyPolicyUrl', e.target.value)}
              placeholder="https://tourism.gov.kh/privacy"
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Card 5: Maintenance Mode Toggle */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]" />
            {t('settings.cardMaintenanceMode', 'System Maintenance Mode')}
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(settings.maintenanceMode)}
              onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-md peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-md after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
          </label>
        </div>

        {settings.maintenanceMode && (
          <div className="p-3 bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)] border border-[var(--color-warning-border)] dark:border-[var(--color-warning-dark-border)] rounded-md text-xs text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)] space-y-2 animate-in fade-in duration-150">
            <span className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> {t('settings.maintenanceActiveBadge', 'Active: Maintenance Mode Enabled')}
            </span>
            <p className="text-[11px] leading-relaxed">
              {t('settings.maintenanceNoticeDesc', 'Public mobile app visitors and web visitors will see a maintenance notice banner. Only logged-in administrators can access management functions.')}
            </p>
            <div className="pt-1">
              <label className="block text-[11px] font-semibold mb-1 text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                {t('settings.labelMaintenanceBannerMsg', 'Public Maintenance Message Banner')}
              </label>
              <input
                type="text"
                value={settings.maintenanceMessage || ''}
                onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                placeholder={t('settings.placeholderMaintenanceMsg', 'The system is undergoing scheduled maintenance. Please check back shortly.')}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-1 focus:ring-[var(--color-input)]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Card 6: Branding Assets Upload (Logo & Favicon) */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
          <ImageIcon className="w-4 h-4 text-[var(--color-primary)]" />
          {t('settings.cardBrandingAssets', 'Brand Assets (Logo & Favicon)')}
        </h3>

        {uploadError && (
          <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-700 dark:text-red-400 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Uploader */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {t('settings.labelUploadLogo', 'Upload System Logo')}
            </label>

            {uploadingLogo ? (
              <div className="border-2 border-dashed border-[#003E83] dark:border-blue-500 rounded-md p-6 flex flex-col items-center justify-center bg-blue-50/50 dark:bg-blue-950/30 text-[#003E83] dark:text-blue-400">
                <RefreshCw className="w-6 h-6 animate-spin mb-1.5" />
                <span className="text-xs font-semibold">{t('settings.uploadingLogoMsg', 'Uploading system logo to server...')}</span>
                <span className="text-[10px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">{t('settings.pleaseWait', 'Please wait a moment')}</span>
              </div>
            ) : logoPreview ? (
              <div className="relative border-2 border-dashed border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md p-4 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex items-center justify-center overflow-hidden">
                    <img src={logoPreview} alt="System Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] block truncate max-w-[140px]">
                      {settings.logoFileName || 'logo.png'}
                    </span>
                    <span className="text-[10px] text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> {t('settings.readyToSave', 'Ready to save')}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeLogo}
                  className="p-1.5 text-[var(--color-text-muted-light)] hover:text-[var(--color-danger-text)] dark:hover:text-[var(--color-danger-dark-text)] rounded-md transition-colors cursor-pointer"
                  title={t('settings.tooltipRemoveLogo', 'Remove Logo')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] hover:border-[var(--color-primary)] rounded-md p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/30">
                <Upload className="w-6 h-6 text-[var(--color-text-muted-light)] mb-1" />
                <span className="text-xs font-medium text-[var(--color-primary)]">{t('settings.clickUploadLogo', 'Click to upload logo')}</span>
                <span className="text-[10px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">{t('settings.logoFormatsHint', 'PNG, SVG, or JPG (max 2MB)')}</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Favicon Uploader */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {t('settings.labelUploadFavicon', 'Upload Favicon')}
            </label>

            {uploadingFavicon ? (
              <div className="border-2 border-dashed border-[#003E83] dark:border-blue-500 rounded-md p-6 flex flex-col items-center justify-center bg-blue-50/50 dark:bg-blue-950/30 text-[#003E83] dark:text-blue-400">
                <RefreshCw className="w-6 h-6 animate-spin mb-1.5" />
                <span className="text-xs font-semibold">{t('settings.uploadingFaviconMsg', 'Uploading favicon to server...')}</span>
                <span className="text-[10px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">{t('settings.pleaseWait', 'Please wait a moment')}</span>
              </div>
            ) : faviconPreview ? (
              <div className="relative border-2 border-dashed border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md p-4 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex items-center justify-center overflow-hidden">
                    <img src={faviconPreview} alt="Favicon" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] block truncate max-w-[140px]">
                      {settings.faviconFileName || 'favicon.ico'}
                    </span>
                    <span className="text-[10px] text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> {t('settings.readyToSave', 'Ready to save')}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFavicon}
                  className="p-1.5 text-[var(--color-text-muted-light)] hover:text-[var(--color-danger-text)] dark:hover:text-[var(--color-danger-dark-text)] rounded-md transition-colors cursor-pointer"
                  title={t('settings.tooltipRemoveFavicon', 'Remove Favicon')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] hover:border-[var(--color-primary)] rounded-md p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/30">
                <Upload className="w-6 h-6 text-[var(--color-text-muted-light)] mb-1" />
                <span className="text-xs font-medium text-[var(--color-primary)]">{t('settings.clickUploadFavicon', 'Click to upload favicon')}</span>
                <span className="text-[10px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">{t('settings.faviconFormatsHint', 'ICO, PNG, or SVG (32x32px)')}</span>
                <input type="file" accept="image/*,.ico" onChange={handleFaviconUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
