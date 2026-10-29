import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users, ShieldCheck, MapPin, Languages, CheckCircle,
  AlertCircle, Eye, Edit, Trash2, Plus, RefreshCw, ChevronDown
} from 'lucide-react';
import guideService from '../../services/guideService';
import SimplePagination from '../../components/common/SimplePagination';
import GuideModal from './GuideModal';
import GuideDetailsModal from './GuideDetailsModal';
import { useAlert } from '../../context/AlertContext';
import { useSearch } from '../../context/SearchContext';
import { useLanguage } from '../../i18n';
import { getStatusColor } from '../../utils/StatusUtils';
import { getPageCache, setPageCache } from '../../utils/pageCache';

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

const LANGUAGE_KEYS = {
  'Khmer': 'langKhmer',
  'English': 'langEnglish',
  'French': 'langFrench',
  'Japanese': 'langJapanese',
  'Chinese (Mandarin)': 'langChinese',
  'German': 'langGerman'
};

export default function Guides() {
  const { t } = useLanguage();
  const { showConfirm, showSuccess, showError } = useAlert();
  const { searchTerm: search } = useSearch();

  const [guides, setGuides] = useState(() => getPageCache('guides_data') || []);
  const [loading, setLoading] = useState(() => !getPageCache('guides_data'));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');

  // Modals
  const [viewingGuide, setViewingGuide] = useState(null);
  const [editingGuide, setEditingGuide] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const languagesList = ['All', 'Khmer', 'English', 'French', 'Japanese', 'Chinese (Mandarin)', 'German'];

  const fetchGuides = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await guideService.getGuides({ per_page: 100 });
      const data = res?.data?.data?.guides || res?.data?.guides || res?.data?.data || res?.data || [];
      const rawList = Array.isArray(data) ? data : [];
      const mapped = rawList.map(g => ({
        ...g,
        avatar: g.avatar || g.photo || g.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(g.name || 'Tour Guide')}&background=003E83&color=fff&size=200`,
        province: g.province || g.location || 'Siem Reap & Angkor',
        daily_rate: Number(g.daily_rate) || 45,
        experience_years: Number(g.experience_years) || 5,
        status: g.status === 'verified' || g.status === 'Active' ? 'Active' : 'Inactive'
      }));
      setGuides(mapped);
      setPageCache('guides_data', mapped);
    } catch (err) {
      console.warn('Backend guides fetch notice:', err);
      if (!getPageCache('guides_data')) setGuides([]);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  const regionsList = useMemo(() => {
    const set = new Set(guides.map(g => g.province).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [guides]);

  // Filtered Guides
  const filteredGuides = useMemo(() => {
    return guides.filter(g => {
      // Status Match
      const isAct = g.status === 'Active' || g.status === 'verified';
      const statusMatch = statusFilter === 'all' ||
        (statusFilter === 'active' && isAct) ||
        (statusFilter === 'inactive' && !isAct);

      // Language Match
      const guideLangs = Array.isArray(g.languages) ? g.languages : (g.languages ? [g.languages] : []);
      const langMatch = languageFilter === 'All' || guideLangs.some(l => String(l).toLowerCase().includes(languageFilter.toLowerCase()));

      // Region Match
      const regionMatch = regionFilter === 'All' || (g.province || '').toLowerCase().includes(regionFilter.toLowerCase());

      // Search Query Match
      const q = (search || '').toLowerCase().trim();
      const searchMatch = !q ||
        (g.name || '').toLowerCase().includes(q) ||
        (g.license_no || '').toLowerCase().includes(q) ||
        (g.email || '').toLowerCase().includes(q) ||
        (g.province || '').toLowerCase().includes(q);

      return statusMatch && langMatch && regionMatch && searchMatch;
    });
  }, [guides, statusFilter, languageFilter, regionFilter, search]);

  // Statistics
  const stats = useMemo(() => {
    const total = guides.length;
    const verified = guides.filter(g => g.status === 'Active' || g.status === 'verified').length;
    const regions = new Set(guides.map(g => g.province).filter(Boolean)).size;
    const allLangs = new Set(guides.flatMap(g => Array.isArray(g.languages) ? g.languages : [g.languages]).filter(Boolean)).size;
    return { total, verified, regions, allLangs };
  }, [guides]);

  // Pagination calculation
  const totalRecords = filteredGuides.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedGuides = filteredGuides.slice(startIndex, startIndex + itemsPerPage);
  const endIndex = Math.min(startIndex + paginatedGuides.length, totalRecords);

  // Helper for localized province name
  const getProvinceLabel = (prov) => {
    if (!prov) return t('guides.defaultLocation', 'Cambodia');
    return PROVINCE_KEYS[prov] ? t(`guides.${PROVINCE_KEYS[prov]}`, prov) : prov;
  };

  // Helper for localized language name
  const getLanguageLabel = (lang) => {
    if (lang === 'All') return t('guides.allLanguages', 'All Languages');
    return LANGUAGE_KEYS[lang] ? t(`guides.${LANGUAGE_KEYS[lang]}`, lang) : lang;
  };

  // Save / Edit Guide
  const handleSaveGuide = async (payload) => {
    try {
      if (editingGuide) {
        const res = await guideService.updateGuide(editingGuide.id, payload);
        const serverData = res?.data?.data || res?.data || {};
        const updated = {
          ...editingGuide,
          ...payload,
          ...(typeof serverData === 'object' ? serverData : {}),
          status: payload.status || editingGuide.status
        };
        setGuides(prev => {
          const next = prev.map(g => g.id === editingGuide.id ? updated : g);
          setPageCache('guides_data', next);
          return next;
        });
        if (viewingGuide && viewingGuide.id === editingGuide.id) {
          setViewingGuide(updated);
        }
        showSuccess(
          t('guides.guideUpdatedSuccess', 'Tour guide profile "{name}" updated successfully.').replace('{name}', payload.name),
          t('guides.changesSavedTitle', 'Changes Saved')
        );
      } else {
        const res = await guideService.createGuide(payload);
        const serverData = res?.data?.data || res?.data || {};
        const newId = serverData?.id || res?.data?.id || Date.now();
        const created = {
          ...payload,
          ...serverData,
          id: newId,
          avatar: serverData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name)}&background=003E83&color=fff&size=200`,
          status: serverData?.status === 'verified' || serverData?.status === 'Active' || payload.status === 'Active' ? 'Active' : 'Inactive'
        };
        setGuides(prev => {
          const next = [created, ...prev];
          setPageCache('guides_data', next);
          return next;
        });
        showSuccess(
          t('guides.guideRegisteredSuccess', 'New tour guide "{name}" accredited successfully.').replace('{name}', payload.name),
          t('guides.guideRegisteredTitle', 'Guide Registered')
        );
      }
      setIsModalOpen(false);
      setEditingGuide(null);
    } catch (err) {
      const errMsg = err?.message ||
        err?.response?.data?.message ||
        (err?.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : null) ||
        t('guides.saveFailedError', 'Failed to save tour guide profile.');
      showError(errMsg, t('guides.saveFailedTitle', 'Save Failed'));
    }
  };

  // Toggle status
  const handleToggleStatus = async (guide) => {
    const isAct = guide.status === 'Active' || guide.status === 'verified';
    const newStatus = isAct ? 'Inactive' : 'Active';
    try {
      await guideService.updateGuide(guide.id, { status: newStatus });
    } catch {
      // optimistic update
    } finally {
      setGuides(prev => {
        const next = prev.map(g => g.id === guide.id ? { ...g, status: newStatus } : g);
        setPageCache('guides_data', next);
        return next;
      });
      if (viewingGuide && viewingGuide.id === guide.id) {
        setViewingGuide(prev => ({ ...prev, status: newStatus }));
      }
      const statusText = newStatus === 'Active' ? t('guides.statusAccredited', 'Active') : t('guides.statusInactive', 'Inactive');
      showSuccess(
        t('guides.statusUpdatedSuccess', 'Status for "{name}" updated to {status}.').replace('{name}', guide.name).replace('{status}', statusText),
        t('guides.statusUpdatedTitle', 'Status Updated')
      );
    }
  };

  // Delete Guide
  const handleDeleteGuide = async (guide) => {
    const confirmed = await showConfirm({
      title: t('guides.deleteConfirmTitle', 'Delete Tour Guide'),
      message: t('guides.deleteConfirmMessage', 'Are you sure you want to permanently remove "{name}" from the accredited directory?').replace('{name}', guide.name),
      confirmText: t('guides.confirmDeleteBtn', 'Delete Guide'),
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await guideService.deleteGuide(guide.id);
    } catch {
      // optimistic update
    } finally {
      setGuides(prev => {
        const next = prev.filter(g => g.id !== guide.id);
        setPageCache('guides_data', next);
        return next;
      });
      if (viewingGuide && viewingGuide.id === guide.id) {
        setViewingGuide(null);
      }
      showSuccess(
        t('guides.guideDeletedSuccess', 'Tour guide "{name}" has been deleted.').replace('{name}', guide.name),
        t('guides.guideRemovedTitle', 'Guide Removed')
      );
    }
  };

  const statsList = [
    {
      label: t('guides.statRegisteredGuides', 'Registered Guides'),
      value: (stats.total || 0).toLocaleString(),
      subtext: t('guides.statRegisteredSubtext', 'MoT licensed staff'),
      icon: Users,
      color: "text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]",
      bg: "bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]"
    },
    {
      label: t('guides.statAccreditedActive', 'Accredited & Active'),
      value: (stats.verified || 0).toLocaleString(),
      subtext: t('guides.statAccreditedSubtext', 'Background checked'),
      icon: ShieldCheck,
      color: "text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]",
      bg: "bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]"
    },
    {
      label: t('guides.statActiveProvinces', 'Active Provinces'),
      value: (stats.regions || 0).toLocaleString(),
      subtext: t('guides.statActiveProvincesSubtext', 'Geographic coverage'),
      icon: MapPin,
      color: "text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)]",
      bg: "bg-[var(--color-purple-badge-bg)] dark:bg-[var(--color-purple-badge-dark-bg)]"
    },
    {
      label: t('guides.statLanguagesCovered', 'Languages Covered'),
      value: (stats.allLangs || 0).toLocaleString(),
      subtext: t('guides.statLanguagesSubtext', 'International fluency'),
      icon: Languages,
      color: "text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]",
      bg: "bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]"
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
              {t('guides.directoryTitle', 'Tour Guides')}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
              {t('guides.directorySubtitle', 'Review, verify, and manage licensed Cambodian tour guides, language proficiencies, and credentials.')}
            </p>
          </div>
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={fetchGuides}
              disabled={isRefreshing}
              className="p-2 text-xs md:text-sm font-medium rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] transition-colors shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
              title={t('guides.refreshTooltip', 'Refresh directory')}
            >
              <RefreshCw className={`w-4 h-4 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => { setEditingGuide(null); setIsModalOpen(true); }}
              className="flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-md bg-[#003E83] hover:bg-[#002e62] text-white transition-colors shrink-0 w-full sm:w-auto cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>{t('guides.registerGuideBtn', 'Register Guide')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statsList.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-medium truncate">
                    {stat.label}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-md shrink-0 ${stat.bg}`}>
                  <IconComponent className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] mt-2">
                {stat.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Guides Table Container */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden flex-1">
        {/* Toolbar Header */}
        <div className="px-4 md:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                {t('guides.allGuides', 'All Tour Guides')}
              </h2>
              {totalRecords !== undefined && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                  {totalRecords} {totalRecords === 1 ? t('guides.guideCountSingle', 'guide') : t('guides.guideCountPlural', 'guides')}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
              {/* Language Filter */}
              <div className="relative">
                <select
                  value={languageFilter}
                  onChange={(e) => { setLanguageFilter(e.target.value); setCurrentPage(1); }}
                  className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
                >
                  {languagesList.map(l => (
                    <option key={l} value={l}>
                      {getLanguageLabel(l)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
                >
                  <option value="all">{t('guides.allStatuses', 'All Statuses')}</option>
                  <option value="active">{t('guides.filterActiveAccredited', 'Active & Accredited')}</option>
                  <option value="inactive">{t('guides.filterInactive', 'Inactive')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
              </div>

              {/* Region Filter */}
              {regionsList.length > 2 && (
                <div className="relative">
                  <select
                    value={regionFilter}
                    onChange={(e) => { setRegionFilter(e.target.value); setCurrentPage(1); }}
                    className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
                  >
                    {regionsList.map(r => (
                      <option key={r} value={r}>
                        {r === 'All' ? t('guides.allRegions', 'All Regions') : getProvinceLabel(r)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
            <thead className="bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/50">
              <tr>
                <th className="pl-4 pr-2 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-10 text-center">
                  {t('guides.thIndex', '#')}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  {t('guides.thGuideNameLicense', 'GUIDE NAME & LICENSE')}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  {t('guides.thPrimaryRegion', 'PRIMARY REGION')}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  {t('guides.thSpokenLanguages', 'SPOKEN LANGUAGES')}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  {t('guides.thRateExperience', 'RATE & EXPERIENCE')}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  {t('guides.thStatus', 'STATUS')}
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  {t('guides.thActions', 'ACTIONS')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[var(--color-text-muted-light)]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#003E83]" />
                    {t('guides.loadingGuides', 'Loading tour guides...')}
                  </td>
                </tr>
              ) : paginatedGuides.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 px-4">
                    <Users className="w-12 h-12 text-[#003E83] mx-auto mb-2 opacity-80" />
                    <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
                      {t('guides.noGuidesFound', 'No tour guides found')}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                      {t('guides.refineSearchFilter', 'Try refining your search or filter options')}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedGuides.map((guide, index) => {
                  const isActive = guide.status === 'Active' || guide.status === 'verified';
                  const langs = Array.isArray(guide.languages)
                    ? guide.languages
                    : (guide.languages ? String(guide.languages).split(',').map(s => s.trim()) : []);

                  return (
                    <tr key={guide.id} className="hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors">
                      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                        {startIndex + index + 1}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={guide.avatar}
                            alt={guide.name}
                            className="w-9 h-9 rounded-md object-cover shrink-0 border border-slate-200 dark:border-zinc-700"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(guide.name || 'G')}&background=003E83&color=fff`;
                            }}
                          />
                          <div className="min-w-0">
                            <div className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                              {guide.name}
                            </div>
                            <div className="text-[11px] font-mono text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                              {guide.license_no || t('guides.defaultLicense', 'MoT Licensed')}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-xs text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] font-medium flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">{getProvinceLabel(guide.province)}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {langs.slice(0, 3).map((l, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-[#003E83] dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40"
                            >
                              {l}
                            </span>
                          ))}
                          {langs.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400">
                              +{langs.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                          ${guide.daily_rate} <span className="text-[10px] font-normal text-[var(--color-text-muted-light)]">{t('guides.perDay', '/ day')}</span>
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                          {guide.experience_years} {t('guides.yearsExp', 'years exp')}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getStatusColor(isActive ? 'active' : 'inactive')}`}>
                          {isActive ? <CheckCircle className="w-3.5 h-3.5 mr-1" /> : <AlertCircle className="w-3.5 h-3.5 mr-1" />}
                          {isActive ? t('guides.statusAccredited', 'Accredited') : t('guides.statusInactive', 'Inactive')}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingGuide(guide)}
                            className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title={t('guides.tooltipViewDetails', 'View Details')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => { setEditingGuide(guide); setIsModalOpen(true); }}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title={t('guides.tooltipEditGuide', 'Edit Guide')}
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(guide)}
                            className={`p-1.5 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer ${isActive
                              ? 'text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30'
                              }`}
                            title={isActive ? t('guides.tooltipMarkInactive', 'Mark Inactive') : t('guides.tooltipAccreditGuide', 'Accredit Guide')}
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteGuide(guide)}
                            className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title={t('guides.tooltipDeleteGuide', 'Delete Guide')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="block md:hidden divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
          {loading ? (
            <div className="text-center py-12 text-[var(--color-text-muted-light)]">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#003E83]" />
              {t('guides.loadingGuides', 'Loading tour guides...')}
            </div>
          ) : paginatedGuides.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Users className="w-12 h-12 text-[#003E83] mx-auto mb-2 opacity-80" />
              <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
                {t('guides.noGuidesFound', 'No tour guides found')}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                {t('guides.refineSearchFilter', 'Try refining your search or filter options')}
              </p>
            </div>
          ) : (
            paginatedGuides.map((guide) => {
              const isActive = guide.status === 'Active' || guide.status === 'verified';
              const langs = Array.isArray(guide.languages)
                ? guide.languages
                : (guide.languages ? String(guide.languages).split(',').map(s => s.trim()) : []);

              return (
                <div key={guide.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={guide.avatar}
                        alt={guide.name}
                        className="w-10 h-10 rounded-md object-cover shrink-0 border border-slate-200 dark:border-zinc-700"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(guide.name || 'G')}&background=003E83&color=fff`;
                        }}
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                          {guide.name}
                        </div>
                        <div className="text-xs font-mono text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                          {guide.license_no || t('guides.defaultLicense', 'MoT Licensed')}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getStatusColor(isActive ? 'active' : 'inactive')}`}>
                      {isActive ? t('guides.statusAccredited', 'Accredited') : t('guides.statusInactive', 'Inactive')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{getProvinceLabel(guide.province)}</span>
                    </div>
                    <div className="text-right font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                      ${guide.daily_rate} <span className="font-normal text-[var(--color-text-muted-light)]">{t('guides.perDay', '/ day')}</span>
                    </div>
                  </div>

                  {langs.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {langs.slice(0, 3).map((l, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-[#003E83] dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border-light)] dark:border-[var(--color-border-dark)]">
                    <button
                      onClick={() => setViewingGuide(guide)}
                      className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] rounded-md cursor-pointer"
                      title={t('guides.tooltipViewDetails', 'View Details')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setEditingGuide(guide); setIsModalOpen(true); }}
                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 rounded-md cursor-pointer"
                      title={t('guides.tooltipEditGuide', 'Edit Guide')}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(guide)}
                      className={`p-1.5 rounded-md cursor-pointer ${isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      title={isActive ? t('guides.tooltipMarkInactive', 'Mark Inactive') : t('guides.tooltipAccreditGuide', 'Accredit Guide')}
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGuide(guide)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                      title={t('guides.tooltipDeleteGuide', 'Delete Guide')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Simple Pagination Footer */}
        <SimplePagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalRecords={totalRecords}
          label={t('guides.guideCountPlural', 'guides')}
        />
      </div>

      {/* View Details Modal */}
      {viewingGuide && (
        <GuideDetailsModal
          guide={viewingGuide}
          onClose={() => setViewingGuide(null)}
          onEdit={(g) => {
            setViewingGuide(null);
            setEditingGuide(g);
            setIsModalOpen(true);
          }}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteGuide}
        />
      )}

      {/* Add / Edit Guide Modal */}
      <GuideModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingGuide(null); }}
        editingGuide={editingGuide}
        onSubmit={handleSaveGuide}
      />
    </div>
  );
}
