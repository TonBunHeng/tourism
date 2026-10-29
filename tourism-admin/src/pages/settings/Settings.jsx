import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getInitialTheme,
  getInitialSidebarStyle,
  getInitialCompactSidebar,
  getInitialFontSize,
  getInitialFontFamily,
  applyTheme,
  applySidebarStyle,
  applyCompactSidebar,
  applyFontSize,
  applyFontFamily
} from "../../utils/Theme";
import {
  Settings as SettingsIcon,
  Palette,
  Bell,
  Shield,
  Database,
  Save,
  RotateCcw,
  CheckCircle2,
  RefreshCw
} from "lucide-react";

import SettingsHeader from "./SettingsHeader";
import SettingsStats from "./SettingsStats";
import SettingsTabs from "./SettingsTabs";
import GeneralTab from "./GeneralTab";
import AppearanceTab from "./AppearanceTab";
import NotificationTab from "./NotificationTab";
import SecurityTab from "./SecurityTab";
import BackupTab from "./BackupTab";
import settingService from "../../services/settingService";
import { useAlert } from "../../context/AlertContext";
import { useSearch } from "../../context/SearchContext";
import { useLanguage } from "../../i18n";

const KEY_GROUP_MAP = {
  // General
  siteName: 'general',
  appName: 'general',
  organizationName: 'general',
  siteDescription: 'general',
  contactEmail: 'general',
  contactPhone: 'general',
  emergencyPolice: 'general',
  emergencyTouristPolice: 'general',
  emergencyAmbulance: 'general',
  emergencyFire: 'general',
  defaultLanguage: 'general',
  defaultCurrency: 'general',
  timezone: 'general',
  dateFormat: 'general',
  termsOfServiceUrl: 'general',
  privacyPolicyUrl: 'general',
  maintenanceMode: 'general',
  maintenanceMessage: 'general',
  logoUrl: 'general',
  logoFileName: 'general',
  faviconUrl: 'general',
  faviconFileName: 'general',

  // Appearance
  theme: 'appearance',
  sidebarStyle: 'appearance',
  compactSidebar: 'appearance',
  fontSize: 'appearance',
  fontFamily: 'appearance',

  // Notifications
  pushNotifications: 'notifications',
  emailNotifications: 'notifications',
  smsNotifications: 'notifications',
  newUserAlert: 'notifications',
  newReviewAlert: 'notifications',
  newEventAlert: 'notifications',
  deletionRequestAlert: 'notifications',
  securityAlert: 'notifications',

  // Security
  twoFactorAuth: 'security',
  sessionTimeout: 'security',
  passwordPolicy: 'security',
  loginAttempts: 'security',

  // Integrations
  googleMapsApiKey: 'integrations',
  mapboxApiKey: 'integrations',
  weatherApiKey: 'integrations',
  aiProvider: 'integrations',
  aiApiKey: 'integrations',
  smtpHost: 'integrations',
  smtpPort: 'integrations',
  smtpEncryption: 'integrations',
  smtpUsername: 'integrations',
  smtpPassword: 'integrations',

  // Backup
  backupSchedule: 'backup',
  backupRetention: 'backup'
};

const SNAKE_TO_CAMEL = {
  site_name: 'siteName',
  app_name: 'appName',
  organization_name: 'organizationName',
  site_description: 'siteDescription',
  contact_email: 'contactEmail',
  support_email: 'contactEmail',
  contact_phone: 'contactPhone',
  support_phone: 'contactPhone',
  emergency_police: 'emergencyPolice',
  emergency_tourist_police: 'emergencyTouristPolice',
  emergency_ambulance: 'emergencyAmbulance',
  emergency_fire: 'emergencyFire',
  default_language: 'defaultLanguage',
  default_currency: 'defaultCurrency',
  timezone: 'timezone',
  date_format: 'dateFormat',
  terms_of_service_url: 'termsOfServiceUrl',
  privacy_policy_url: 'privacyPolicyUrl',
  maintenance_mode: 'maintenanceMode',
  maintenance_message: 'maintenanceMessage',
  logo_url: 'logoUrl',
  logo_file_name: 'logoFileName',
  favicon_url: 'faviconUrl',
  favicon_file_name: 'faviconFileName',
  theme: 'theme',
  sidebar_style: 'sidebarStyle',
  compact_sidebar: 'compactSidebar',
  font_size: 'fontSize',
  font_family: 'fontFamily',
  push_notifications: 'pushNotifications',
  email_notifications: 'emailNotifications',
  sms_notifications: 'smsNotifications',
  new_user_alert: 'newUserAlert',
  new_review_alert: 'newReviewAlert',
  new_event_alert: 'newEventAlert',
  deletion_request_alert: 'deletionRequestAlert',
  security_alert: 'securityAlert',
  two_factor_auth: 'twoFactorAuth',
  session_timeout: 'sessionTimeout',
  password_policy: 'passwordPolicy',
  login_attempts: 'loginAttempts',
  google_maps_api_key: 'googleMapsApiKey',
  mapbox_api_key: 'mapboxApiKey',
  weather_api_key: 'weatherApiKey',
  ai_provider: 'aiProvider',
  ai_api_key: 'aiApiKey',
  smtp_host: 'smtpHost',
  smtp_port: 'smtpPort',
  smtp_encryption: 'smtpEncryption',
  smtp_username: 'smtpUsername',
  smtp_password: 'smtpPassword',
  backup_schedule: 'backupSchedule',
  backup_retention: 'backupRetention'
};

const BOOLEAN_KEYS = new Set([
  'maintenanceMode',
  'maintenance_mode',
  'pushNotifications',
  'push_notifications',
  'emailNotifications',
  'email_notifications',
  'smsNotifications',
  'sms_notifications',
  'newUserAlert',
  'new_user_alert',
  'newReviewAlert',
  'new_review_alert',
  'newEventAlert',
  'new_event_alert',
  'deletionRequestAlert',
  'deletion_request_alert',
  'securityAlert',
  'security_alert',
  'twoFactorAuth',
  'two_factor_auth',
  'compactSidebar',
  'compact_sidebar'
]);

const SETTING_TAB_IDS = ["general", "appearance", "notifications", "security", "backup"];

export default function Settings() {
  const { t } = useLanguage();
  const { showConfirm, showSuccess, showError } = useAlert();
  const [searchParams, setSearchParams] = useSearchParams();

  const settingTabs = useMemo(() => [
    { id: "general", label: t('settings.tabGeneral', 'General'), icon: SettingsIcon },
    { id: "appearance", label: t('settings.tabAppearance', 'Appearance'), icon: Palette },
    { id: "notifications", label: t('settings.tabNotifications', 'Notifications'), icon: Bell },
    { id: "security", label: t('settings.tabSecurity', 'Security'), icon: Shield },
    { id: "backup", label: t('settings.tabBackup', 'Backup & Restore'), icon: Database }
  ], [t]);

  // Tab persistence via search param + sessionStorage
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && SETTING_TAB_IDS.includes(tabFromUrl)) return tabFromUrl;
    const tabFromStorage = sessionStorage.getItem('settings_active_tab');
    if (tabFromStorage && SETTING_TAB_IDS.includes(tabFromStorage)) return tabFromStorage;
    return "general";
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { searchTerm: searchQuery } = useSearch();

  // Keep activeTab reactive to browser search param changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab && SETTING_TAB_IDS.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
      sessionStorage.setItem('settings_active_tab', tabFromUrl);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    sessionStorage.setItem('settings_active_tab', tabId);
    if (tabId === 'general') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ tab: tabId }, { replace: true });
    }
    // Scroll to top smoothly when section changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Comprehensive System Settings State
  const defaultSettings = useMemo(() => ({
    // General
    siteName: "AngkorVerses Smart Tourism Portal",
    appName: "AngkorVerses",
    organizationName: "Ministry of Tourism & Culture Cambodia",
    siteDescription: "Official AngkorVerses Administration & Cultural Heritage Management Portal",
    contactEmail: "support@tourism.gov.kh",
    contactPhone: "+855 23 888 999",
    emergencyPolice: "117",
    emergencyTouristPolice: "+855 31 322 2117",
    emergencyAmbulance: "119",
    emergencyFire: "118",
    defaultLanguage: "km",
    defaultCurrency: "USD",
    timezone: "Asia/Phnom_Penh",
    dateFormat: "YYYY-MM-DD",
    termsOfServiceUrl: "https://tourism.gov.kh/terms",
    privacyPolicyUrl: "https://tourism.gov.kh/privacy",
    maintenanceMode: false,
    maintenanceMessage: "The AngkorVerses administrative portal is undergoing scheduled maintenance. Please check back shortly.",
    logoUrl: null,
    logoFileName: "",
    faviconUrl: null,
    faviconFileName: "",

    // Appearance
    theme: getInitialTheme(),
    sidebarStyle: getInitialSidebarStyle(),
    compactSidebar: getInitialCompactSidebar(),
    fontSize: getInitialFontSize(),
    fontFamily: getInitialFontFamily(),

    // Notifications
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    newUserAlert: true,
    newReviewAlert: true,
    newEventAlert: true,
    deletionRequestAlert: true,
    securityAlert: true,

    // Security
    twoFactorAuth: true,
    sessionTimeout: "30",
    passwordPolicy: "strong",
    loginAttempts: "5",

    // Integrations
    googleMapsApiKey: "",
    mapboxApiKey: "",
    weatherApiKey: "",
    aiProvider: "gemini",
    aiApiKey: "",
    smtpHost: "",
    smtpPort: "587",
    smtpEncryption: "tls",
    smtpUsername: "",
    smtpPassword: "",

    // Backup
    backupSchedule: "daily",
    backupRetention: "30"
  }), []);

  const [settings, setSettings] = useState(defaultSettings);

  const loadSettingsData = async (silent = false) => {
    try {
      const res = await settingService.getSettings();
      if (res.success && res.data && res.data.length > 0) {
        const loaded = { ...defaultSettings };
        res.data.forEach((item) => {
          const rawKey = item.key || item.setting_key;
          let val = item.value !== undefined ? item.value : item.setting_value;
          if (rawKey && val !== undefined && val !== null) {
            const camelKey = SNAKE_TO_CAMEL[rawKey];
            const isBool = BOOLEAN_KEYS.has(rawKey) || (camelKey && BOOLEAN_KEYS.has(camelKey));

            if (isBool) {
              val = val === true || val === "true" || val === 1 || val === "1";
            }

            if (Object.prototype.hasOwnProperty.call(loaded, rawKey)) {
              loaded[rawKey] = val;
            }
            if (camelKey && Object.prototype.hasOwnProperty.call(loaded, camelKey)) {
              loaded[camelKey] = val;
            }
          }
        });

        loaded.theme = getInitialTheme();
        applyTheme(loaded.theme);
        applySidebarStyle(loaded.sidebarStyle);
        applyCompactSidebar(loaded.compactSidebar);
        applyFontSize(loaded.fontSize);
        applyFontFamily(loaded.fontFamily);
        setSettings(loaded);
        if (!silent) {
          showSuccess(
            t('settings.settingsSyncedMsg', 'Settings reloaded and synchronized with server.'),
            t('settings.settingsSyncedTitle', 'Settings Synced')
          );
        }
      }
    } catch (e) {
      console.error("Failed to load settings from API:", e);
      if (!silent) {
        showError(
          e.message || t('settings.syncFailedMsg', 'Failed to load settings from server.'),
          t('settings.syncFailedTitle', 'Sync Failed')
        );
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      loadSettingsData(true);
    }
    return () => {
      isMounted = false;
    };
  }, [defaultSettings]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadSettingsData(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Search Match Calculator
  const searchMatchCounts = useMemo(() => {
    if (!searchQuery.trim()) return {};
    const q = searchQuery.toLowerCase();
    const counts = {};

    settingTabs.forEach((tab) => {
      let count = 0;
      if (tab.label.toLowerCase().includes(q)) count += 1;

      Object.entries(settings).forEach(([key, val]) => {
        const group = KEY_GROUP_MAP[key];
        if (group === tab.id) {
          if (key.toLowerCase().includes(q) || String(val).toLowerCase().includes(q)) {
            count += 1;
          }
        }
      });

      if (count > 0) counts[tab.id] = count;
    });

    return counts;
  }, [searchQuery, settings, settingTabs]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Construct settings payload with proper group assignment
      const settingsArray = [];

      Object.keys(settings).forEach((key) => {
        const group = KEY_GROUP_MAP[key] || 'general';
        const rawVal = settings[key];
        const valStr = typeof rawVal === "boolean"
          ? (rawVal ? "true" : "false")
          : typeof rawVal === "object" && rawVal !== null
          ? JSON.stringify(rawVal)
          : String(rawVal ?? "");

        settingsArray.push({
          key,
          value: valStr,
          group,
        });
      });

      // Synchronize key pairs for public endpoint compatibility
      const syncPairs = [
        { key: 'site_name', val: settings.siteName, group: 'general' },
        { key: 'app_name', val: settings.appName || settings.siteName, group: 'general' },
        { key: 'support_email', val: settings.contactEmail, group: 'general' },
        { key: 'support_phone', val: settings.contactPhone, group: 'general' },
        { key: 'maintenance_mode', val: settings.maintenanceMode ? 'true' : 'false', group: 'general' },
        { key: 'default_language', val: settings.defaultLanguage, group: 'general' },
        { key: 'default_currency', val: settings.defaultCurrency, group: 'general' },
        { key: 'terms_of_service_url', val: settings.termsOfServiceUrl, group: 'general' },
        { key: 'privacy_policy_url', val: settings.privacyPolicyUrl, group: 'general' },
      ];

      syncPairs.forEach((pair) => {
        if (!settingsArray.some((s) => s.key === pair.key)) {
          settingsArray.push({
            key: pair.key,
            value: String(pair.val ?? ''),
            group: pair.group,
          });
        }
      });

      await settingService.updateSettings(settingsArray);

      // Re-apply theme setting on save
      if (settings.theme) applyTheme(settings.theme);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      showSuccess(
        t('settings.saveSuccessMsg', 'System settings have been saved and applied successfully.'),
        t('settings.saveSuccessTitle', 'Settings Saved')
      );
    } catch (e) {
      showError(
        e.message || t('settings.saveFailedMsg', 'Failed to save settings to backend.'),
        t('settings.saveFailedTitle', 'Save Failed')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const confirmed = await showConfirm({
      title: t('settings.resetConfirmTitle', 'Reset Settings'),
      message: t('settings.resetConfirmMsg', 'Are you sure you want to restore default administrative settings? Unsaved changes will be discarded.'),
      confirmText: t('settings.btnConfirmReset', 'Reset to Default'),
      type: "warning"
    });
    if (confirmed) {
      setSettings(defaultSettings);
      applyTheme('system');
      showSuccess(
        t('settings.resetSuccessMsg', 'Settings restored to system defaults.'),
        t('settings.resetSuccessTitle', 'Settings Reset')
      );
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralTab settings={settings} setSettings={setSettings} />;
      case "appearance":
        return <AppearanceTab settings={settings} setSettings={setSettings} />;
      case "notifications":
        return <NotificationTab settings={settings} setSettings={setSettings} />;
      case "security":
        return <SecurityTab settings={settings} setSettings={setSettings} />;
      case "backup":
        return <BackupTab settings={settings} setSettings={setSettings} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col relative pb-10">
      {/* Settings Header */}
      <SettingsHeader />

      {/* KPI Overview Summary Stats */}
      <SettingsStats settings={settings} />

      {/* Main Settings Card */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden flex flex-col min-h-[550px]">
        {/* Top Header Navigation Tabs */}
        <SettingsTabs
          tabs={settingTabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          searchMatchCounts={searchMatchCounts}
        />

        {/* Tab Content Body */}
        <div className="flex-1 p-5 md:p-7 min-w-0">
          {renderTabContent()}
        </div>

        {/* Card Footer Action Bar */}
        <div className="px-4 md:px-6 py-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-surface-hover-light)]/40 dark:bg-[var(--color-surface-hover-dark)]/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
            {t('settings.activeSectionLabel', 'Active Section:')} <strong className="text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] font-semibold">{settingTabs.find(t => t.id === activeTab)?.label || t('settings.tabGeneral', 'General')}</strong>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="p-2 sm:px-3.5 sm:py-2 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] text-xs md:text-sm font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>{t('settings.btnReset', 'Reset')}</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-md bg-[#003E83] hover:bg-[#002e62] active:scale-[0.98] text-white transition-all shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  <span>{t('settings.saving', 'Saving...')}</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>{t('settings.saved', 'Saved!')}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 shrink-0" />
                  <span>{t('settings.btnSaveChanges', 'Save Changes')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
