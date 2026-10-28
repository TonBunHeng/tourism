import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Star, ChevronDown, MapPin, Calendar, Users, FolderTree, Eye,
  Landmark, User, X, Database, Compass, CalendarCheck, DollarSign
} from 'lucide-react';
import SimplePagination from '../../components/common/SimplePagination';
import { useLanguage } from '../../i18n';

export default function ReportsTable({
  activeTab,
  onTabChange,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  data = [],
  isLoading = false
}) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, statusFilter]);

  const safeText = (val, fallback = '') => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') return val.name || val.title || val.label || fallback;
    return String(val);
  };

  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setSelectedItem(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedItem]);

  const tabs = [
    { id: 'all', label: t('reports.tabAllRecords', 'All Records'), icon: Database },
    { id: 'places', label: t('reports.tabPlaces', 'Places Report'), icon: MapPin },
    { id: 'events', label: t('reports.tabEvents', 'Events Report'), icon: Calendar },
    { id: 'tours', label: t('reports.tabTours', 'Tours Report'), icon: Compass },
    { id: 'bookings', label: t('reports.tabBookings', 'Bookings Report'), icon: CalendarCheck },
    { id: 'users', label: t('reports.tabUsers', 'Users Report'), icon: Users },
    { id: 'reviews', label: t('reports.tabReviews', 'Reviews Report'), icon: Star },
    { id: 'categories', label: t('reports.tabCategories', 'Categories Report'), icon: FolderTree }
  ];

  const totalRecords = data.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const rawStr = typeof status === 'string' ? status : (status !== null && status !== undefined ? String(status) : '');
    const s = rawStr.toLowerCase();
    switch (s) {
      case 'active':
      case 'approved':
      case 'completed':
      case 'confirmed':
      case 'published': {
        const text = s === 'active' ? t('reports.badgeActive', 'Active') :
          s === 'approved' ? t('reports.badgeApproved', 'Approved') :
          s === 'completed' ? t('reports.badgeCompleted', 'Completed') :
          s === 'confirmed' ? t('reports.badgeConfirmed', 'Confirmed') :
          t('reports.badgePublished', 'Published');
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)] text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] border border-[var(--color-success-border)] dark:border-[var(--color-success-dark-border)]">
            {text}
          </span>
        );
      }
      case 'pending':
      case 'upcoming':
      case 'scheduled':
      case 'draft':
      case 'under_review': {
        const text = s === 'pending' ? t('reports.badgePending', 'Pending') :
          s === 'upcoming' ? t('reports.badgeUpcoming', 'Upcoming') :
          s === 'scheduled' ? t('reports.badgeScheduled', 'Scheduled') :
          s === 'draft' ? t('reports.badgeDraft', 'Draft') :
          t('reports.badgeUnderReview', 'Under Review');
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)] text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)] border border-[var(--color-warning-border)] dark:border-[var(--color-warning-dark-border)]">
            {text}
          </span>
        );
      }
      case 'suspended':
      case 'flagged':
      case 'inactive':
      case 'rejected':
      case 'cancelled': {
        const text = s === 'suspended' ? t('reports.badgeSuspended', 'Suspended') :
          s === 'flagged' ? t('reports.badgeFlagged', 'Flagged') :
          s === 'inactive' ? t('reports.badgeInactive', 'Inactive') :
          s === 'rejected' ? t('reports.badgeRejected', 'Rejected') :
          t('reports.badgeCancelled', 'Cancelled');
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md bg-[var(--color-danger-bg)] dark:bg-[var(--color-danger-dark-bg)] text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] border border-[var(--color-danger-border)] dark:border-[var(--color-danger-dark-border)]">
            {text}
          </span>
        );
      }
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md bg-[var(--color-neutral-badge-bg)] dark:bg-[var(--color-neutral-badge-dark-bg)] text-[var(--color-neutral-badge-text)] dark:text-[var(--color-neutral-badge-dark-text)] border border-[var(--color-neutral-badge-border)] dark:border-[var(--color-neutral-badge-dark-border)]">
            {rawStr || t('reports.badgeStandard', 'Standard')}
          </span>
        );
    }
  };

  const getEntityBadge = (type) => {
    switch (type) {
      case 'Place':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
            <Landmark className="w-3 h-3 shrink-0" />
            {t('reports.entityPlace', 'Place')}
          </span>
        );
      case 'Event':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/40">
            <Calendar className="w-3 h-3 shrink-0" />
            {t('reports.entityEvent', 'Event')}
          </span>
        );
      case 'Tour':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40">
            <Compass className="w-3 h-3 shrink-0" />
            {t('reports.entityTour', 'Tour')}
          </span>
        );
      case 'Booking':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40">
            <CalendarCheck className="w-3 h-3 shrink-0" />
            {t('reports.entityBooking', 'Booking')}
          </span>
        );
      case 'User':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900/40">
            <Users className="w-3 h-3 shrink-0" />
            {t('reports.entityUser', 'User')}
          </span>
        );
      case 'Review':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
            <Star className="w-3 h-3 shrink-0" />
            {t('reports.entityReview', 'Review')}
          </span>
        );
      case 'Category':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900/40">
            <FolderTree className="w-3 h-3 shrink-0" />
            {t('reports.entityCategory', 'Category')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
            {type || t('reports.entityRecord', 'Record')}
          </span>
        );
    }
  };

  return (
    <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] shadow-sm overflow-hidden transition-colors duration-200">
      
      {/* Table Toolbar Header */}
      <div className="px-4 md:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
            {activeTab === 'all' ? t('reports.allPlatformRecords', 'All Platform Records') : tabs.find(t => t.id === activeTab)?.label || t('reports.allPlatformRecords', 'All Reports')}
          </h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
            {totalRecords.toLocaleString()} {totalRecords === 1 ? t('reports.recordSingle', 'record') : t('reports.recordPlural', 'records')}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap self-start sm:self-auto w-full sm:w-auto">
          {/* Report Type Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={activeTab}
              onChange={(e) => { onTabChange(e.target.value); setCurrentPage(1); }}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              <option value="All">{t('reports.statusAll', 'All Statuses')}</option>
              <option value="Active">{t('reports.statusActive', 'Active / Approved')}</option>
              <option value="Pending">{t('reports.statusPending', 'Pending / Scheduled')}</option>
              <option value="Suspended">{t('reports.statusSuspended', 'Flagged / Suspended')}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>
        </div>
      </div>


      {/* Mobile Card List View (Visible on Mobile Screens < sm) */}
      <div key={`mobile-${activeTab}-${currentPage}`} className="block sm:hidden divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)] animate-page-enter">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="p-4 space-y-3 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-20" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-24" />
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2" />
            </div>
          ))
        ) : paginatedData.length === 0 ? (
          <div className="py-10 px-4 text-center text-[var(--color-text-muted-light)] dark:text-[var(--color-text-muted-dark)] font-medium text-xs">
            {t('reports.noDataFound', 'No report data matching selected search or status filters.')}
          </div>
        ) : (
          paginatedData.map((row, i) => (
            <div key={i} className="p-4 space-y-2 hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/40 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-muted-dark)] font-bold">
                    #{row.id}
                  </span>
                  {row.entityType && getEntityBadge(row.entityType)}
                </div>
                <div>{getStatusBadge(row.status)}</div>
              </div>

              {/* Master All Data View Mobile */}
              {(!['places', 'events', 'tours', 'bookings', 'users', 'reviews', 'categories'].includes(activeTab)) && (
                <>
                  <h4 className="font-bold text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                    {safeText(row.primaryName || row.name || row.title || row.booking_code || row.userName, 'Unnamed Record')}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">{t('reports.labelDetail', 'Detail:')}</span> {safeText(row.secondaryDetail || row.category || row.destination || row.province || row.role, 'N/A')}</div>
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">{t('reports.labelDate', 'Date:')}</span> {safeText(row.date || row.createdAt || row.startDate, 'N/A')}</div>
                  </div>
                </>
              )}

              {activeTab === 'places' && (
                <>
                  <h4 className="font-bold text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                    {safeText(row.name)}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">{t('reports.labelCategoryShort', 'Cat:')}</span> {safeText(row.category)}</div>
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">{t('reports.labelProvince', 'Province:')}</span> {safeText(row.province)}</div>
                    <div className="inline-flex items-center gap-1 font-semibold text-amber-500">
                      <Star className="w-3 h-3 fill-amber-400" /> {row.rating} ({row.reviews} {t('reports.thReviews', 'revs')})
                    </div>
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">{t('reports.labelDate', 'Date:')}</span> {safeText(row.createdAt)}</div>
                  </div>
                </>
              )}

              {activeTab === 'events' && (
                <>
                  <h4 className="font-bold text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                    {row.title}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">{t('reports.labelLocationShort', 'Loc:')}</span> {row.location}</div>
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">{t('reports.labelAttended', 'Attended:')}</span> {row.attendees?.toLocaleString()}</div>
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">{t('reports.labelStart', 'Start:')}</span> {row.startDate}</div>
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">{t('reports.labelEnd', 'End:')}</span> {row.endDate}</div>
                  </div>
                </>
              )}

              {activeTab === 'tours' && (
                <>
                  <h4 className="font-bold text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                    {row.title}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">{t('reports.labelDestinationShort', 'Dest:')}</span> {row.destination}</div>
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">{t('reports.labelDuration', 'Duration:')}</span> {row.duration}</div>
                    <div className="font-semibold text-emerald-600 dark:text-emerald-400">${row.price_per_person} / person</div>
                    <div className="inline-flex items-center gap-1 font-semibold text-amber-500">
                      <Star className="w-3 h-3 fill-amber-400" /> {row.rating}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'bookings' && (
                <>
                  <h4 className="font-bold text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                    Booking #{row.booking_code}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">{t('reports.labelGuest', 'Guest:')}</span> {row.user?.name || row.customer_name || 'Traveler'}</div>
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">{t('reports.labelService', 'Service:')}</span> {row.service_name}</div>
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">{t('reports.labelAmount', 'Amount:')}</span> ${row.total_price}</div>
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">{t('reports.labelDate', 'Date:')}</span> {row.booking_date || row.date}</div>
                  </div>
                </>
              )}

              {activeTab === 'users' && (
                <>
                  <h4 className="font-bold text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                    {row.name}
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                    {row.email}
                  </p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] pt-1">
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">{t('reports.labelRole', 'Role:')}</span> {row.role}</div>
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">{t('reports.labelJoined', 'Joined:')}</span> {row.joinedDate}</div>
                    <div><span className="font-semibold text-[var(--color-text-muted-light)]">{t('reports.labelReviews', 'Reviews:')}</span> {row.reviewsCount}</div>
                  </div>
                </>
              )}

              {activeTab === 'reviews' && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] border border-slate-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                      {row.avatar ? (
                        <img src={row.avatar} alt={row.userName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                          {row.userName}
                        </h4>
                        <span className="font-semibold text-xs text-amber-500 inline-flex items-center gap-1 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {Number(row.rating || 0).toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1 truncate mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="truncate">{row.placeName}</span>
                      </p>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'categories' && (
                <>
                  <h4 className="font-bold text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                    {row.name}
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] line-clamp-2">
                    {row.description}
                  </p>
                  <div className="text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] pt-1">
                    {t('reports.labelTotalPlaces', 'Total Places:')} <span className="text-[#003E83] dark:text-blue-400">{row.totalPlaces}</span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end mt-2 pt-2 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                <button
                  type="button"
                  onClick={() => setSelectedItem(row)}
                  className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-colors cursor-pointer"
                  title={t('reports.tooltipViewDetails', 'View Details')}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (Visible on sm: and up) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs md:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
          <thead className="bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/50 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider text-xs font-medium">
            {(!['places', 'events', 'tours', 'bookings', 'users', 'reviews', 'categories'].includes(activeTab)) && (
              <tr>
                <th className="pl-4 pr-2 py-3.5 text-xs font-medium uppercase tracking-wider w-12 text-center">{t('reports.thIndex', '#')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-32">{t('reports.thType', 'Type')}</th>
                <th className="px-4 py-3.5">{t('reports.thTitleSubject', 'Title / Subject')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-48">{t('reports.thDetailScope', 'Detail / Scope')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">{t('reports.thStatus', 'Status')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-32">{t('reports.thDate', 'Date')}</th>
                <th className="pl-3 pr-4 py-3.5 text-right w-20 whitespace-nowrap">{t('reports.thActions', 'Actions')}</th>
              </tr>
            )}
            {activeTab === 'places' && (
              <tr>
                <th className="pl-4 pr-2 py-3.5 text-xs font-medium uppercase tracking-wider w-12 text-center">{t('reports.thIndex', '#')}</th>
                <th className="px-4 py-3.5">{t('reports.thPlaceCategory', 'Place & Category')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-44">{t('reports.thProvince', 'Province')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">{t('reports.thRating', 'Rating')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-24">{t('reports.thReviews', 'Reviews')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">{t('reports.thStatus', 'Status')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-32">{t('reports.thCreatedDate', 'Created Date')}</th>
                <th className="pl-3 pr-4 py-3.5 text-right w-20 whitespace-nowrap">{t('reports.thActions', 'Actions')}</th>
              </tr>
            )}
            {activeTab === 'events' && (
              <tr>
                <th className="pl-4 pr-2 py-3.5 text-xs font-medium uppercase tracking-wider w-12 text-center">{t('reports.thIndex', '#')}</th>
                <th className="px-4 py-3.5">{t('reports.thEventLocation', 'Event & Location')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-32">{t('reports.thStartDate', 'Start Date')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-32">{t('reports.thEndDate', 'End Date')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">{t('reports.thAttendees', 'Attendees')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">{t('reports.thStatus', 'Status')}</th>
                <th className="pl-3 pr-4 py-3.5 text-right w-20 whitespace-nowrap">{t('reports.thActions', 'Actions')}</th>
              </tr>
            )}
            {activeTab === 'tours' && (
              <tr>
                <th className="pl-4 pr-2 py-3.5 text-xs font-medium uppercase tracking-wider w-12 text-center">{t('reports.thIndex', '#')}</th>
                <th className="px-4 py-3.5">{t('reports.thTourPackageCategory', 'Tour Package & Category')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-40">{t('reports.thDestination', 'Destination')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">{t('reports.thDuration', 'Duration')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-32">{t('reports.thPricePerson', 'Price / Person')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">{t('reports.thRating', 'Rating')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">{t('reports.thStatus', 'Status')}</th>
                <th className="pl-3 pr-4 py-3.5 text-right w-20 whitespace-nowrap">{t('reports.thActions', 'Actions')}</th>
              </tr>
            )}
            {activeTab === 'bookings' && (
              <tr>
                <th className="pl-4 pr-2 py-3.5 text-xs font-medium uppercase tracking-wider w-12 text-center">{t('reports.thIndex', '#')}</th>
                <th className="px-4 py-3.5">{t('reports.thBookingCodeGuest', 'Booking Code & Guest')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-48">{t('reports.thServiceBusiness', 'Service & Business')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-32">{t('reports.thBookingDate', 'Booking Date')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">{t('reports.thAmount', 'Amount')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">{t('reports.thStatus', 'Status')}</th>
                <th className="pl-3 pr-4 py-3.5 text-right w-20 whitespace-nowrap">{t('reports.thActions', 'Actions')}</th>
              </tr>
            )}
            {activeTab === 'users' && (
              <tr>
                <th className="pl-4 pr-2 py-3.5 text-xs font-medium uppercase tracking-wider w-12 text-center">{t('reports.thIndex', '#')}</th>
                <th className="px-4 py-3.5">{t('reports.thUserEmail', 'User & Email')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-32">{t('reports.thRole', 'Role')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-32">{t('reports.thJoinedDate', 'Joined Date')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">{t('reports.thReviews', 'Reviews')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">{t('reports.thStatus', 'Status')}</th>
                <th className="pl-3 pr-4 py-3.5 text-right w-20 whitespace-nowrap">{t('reports.thActions', 'Actions')}</th>
              </tr>
            )}
            {activeTab === 'reviews' && (
              <tr>
                <th className="pl-4 pr-2 py-3.5 text-xs font-medium uppercase tracking-wider w-12 text-center">{t('reports.thIndex', '#')}</th>
                <th className="px-4 py-3.5">{t('reports.thUserReview', 'User & Review')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-44">{t('reports.thTargetPlace', 'Target Place')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">{t('reports.thRating', 'Rating')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-32">{t('reports.thDate', 'Date')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">{t('reports.thStatus', 'Status')}</th>
                <th className="pl-3 pr-4 py-3.5 text-right w-20 whitespace-nowrap">{t('reports.thActions', 'Actions')}</th>
              </tr>
            )}
            {activeTab === 'categories' && (
              <tr>
                <th className="pl-4 pr-2 py-3.5 text-xs font-medium uppercase tracking-wider w-12 text-center">{t('reports.thIndex', '#')}</th>
                <th className="px-4 py-3.5">{t('reports.thCategoryName', 'Category Name')}</th>
                <th className="px-3 py-3.5">{t('reports.thDescription', 'Description')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-32">{t('reports.thTotalPlaces', 'Total Places')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">{t('reports.thStatus', 'Status')}</th>
                <th className="pl-3 pr-4 py-3.5 text-right w-20 whitespace-nowrap">{t('reports.thActions', 'Actions')}</th>
              </tr>
            )}
          </thead>

          <tbody key={`${activeTab}-${currentPage}`} className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)] animate-page-enter">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-8" /></td>
                  <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-24" /></td>
                  <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-36" /></td>
                  <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-24" /></td>
                  <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-16" /></td>
                  <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-20" /></td>
                  <td className="py-3.5 px-4"><div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-md w-10 ml-auto" /></td>
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[var(--color-text-muted-light)] dark:text-[var(--color-text-muted-dark)] font-medium">
                  {t('reports.noDataFound', 'No report data matching selected search or status filters.')}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, i) => (
                <tr key={i} className="hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/40 transition-colors">
                  
                  {/* Master All Data View */}
                  {(!['places', 'events', 'tours', 'bookings', 'users', 'reviews', 'categories'].includes(activeTab)) && (
                    <>
                      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                        {startIndex + i + 1}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {getEntityBadge(row.entityType || 'Record')}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                            {safeText(row.primaryName || row.name || row.title || row.booking_code || row.userName, 'Unnamed Item')}
                          </p>
                          <span className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate block font-mono">
                            ID #{row.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                        {safeText(row.secondaryDetail || row.category || row.destination || row.province || row.role || row.placeName || row.description, 'General')}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">
                        {safeText(row.date || row.createdAt || row.startDate || row.joinedDate || row.booking_date, 'N/A')}
                      </td>
                      <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(row)}
                          className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title={t('reports.tooltipViewDetails', 'View Details')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}

                  {/* Places Tab */}
                  {activeTab === 'places' && (
                    <>
                      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                        {startIndex + i + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                            <Landmark className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                              {safeText(row.name)}
                            </p>
                            <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] border border-[var(--color-info-border)] dark:border-[var(--color-info-dark-border)]">
                              {safeText(row.category)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{safeText(row.province)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-[var(--color-warning-text)] text-[var(--color-warning-text)] shrink-0" />
                          <span className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                            {Number(row.rating || 0).toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                        {row.reviews}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">
                        {row.createdAt}
                      </td>
                      <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(row)}
                          className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title={t('reports.tooltipViewDetails', 'View Details')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}

                  {/* Events Tab */}
                  {activeTab === 'events' && (
                    <>
                      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                        {startIndex + i + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                              {row.title}
                            </p>
                            <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{row.location}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">
                        {row.startDate}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">
                        {row.endDate}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                        {row.attendees?.toLocaleString()}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>
                      <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(row)}
                          className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title={t('reports.tooltipViewDetails', 'View Details')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}

                  {/* Tours Tab */}
                  {activeTab === 'tours' && (
                    <>
                      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                        {startIndex + i + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shrink-0">
                            <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                              {safeText(row.title)}
                            </p>
                            <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40">
                              {safeText(row.category, 'Tour Package')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{safeText(row.destination)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">
                        {safeText(row.duration)}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        ${row.price_per_person}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                          <span className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                            {Number(row.rating || 5.0).toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>
                      <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(row)}
                          className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title={t('reports.tooltipViewDetails', 'View Details')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}

                  {/* Bookings Tab */}
                  {activeTab === 'bookings' && (
                    <>
                      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                        {startIndex + i + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shrink-0">
                            <CalendarCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs md:text-sm font-semibold font-mono text-[#003E83] dark:text-blue-400 truncate">
                              #{safeText(row.booking_code)}
                            </p>
                            <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                              {safeText(row.user?.name || row.customer_name, 'Traveler')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                        <p className="font-medium text-[var(--color-text-primary-light)] dark:text-white truncate">{safeText(row.service_name)}</p>
                        <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-zinc-400 truncate">{safeText(row.business_name)}</p>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">
                        {safeText(row.booking_date || row.date)}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        ${row.total_price}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>
                      <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(row)}
                          className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title={t('reports.tooltipViewDetails', 'View Details')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}

                  {/* Users Tab */}
                  {activeTab === 'users' && (
                    <>
                      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                        {startIndex + i + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                              {safeText(row.name)}
                            </p>
                            <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                              {safeText(row.email)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs">
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] border border-gray-200 dark:border-zinc-700">
                          {safeText(row.role)}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">
                        {safeText(row.joinedDate)}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                        {row.reviewsCount}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>
                      <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(row)}
                          className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title={t('reports.tooltipViewDetails', 'View Details')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}

                  {/* Reviews Tab */}
                  {activeTab === 'reviews' && (
                    <>
                      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                        {startIndex + i + 1}
                      </td>
                      <td className="px-4 py-3.5 min-w-[240px]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                            {row.avatar ? (
                              <img src={row.avatar} alt={row.userName} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                              {safeText(row.userName)}
                            </p>
                            <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate max-w-xs italic" title={safeText(row.comment)}>
                              {safeText(row.comment) ? `"${safeText(row.comment)}"` : 'Tourist review'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                        <div className="flex items-center gap-1.5 max-w-[180px] truncate" title={safeText(row.placeName)}>
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{safeText(row.placeName)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                          <span className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                            {Number(row.rating || 0).toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">
                        {safeText(row.date)}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>
                      <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(row)}
                          className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title={t('reports.tooltipViewDetails', 'View Details')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}

                  {/* Categories Tab */}
                  {activeTab === 'categories' && (
                    <>
                      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                        {startIndex + i + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                            <FolderTree className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                            {safeText(row.name)}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] max-w-xs truncate">
                        {safeText(row.description)}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-xs font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                        {row.totalPlaces}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>
                      <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(row)}
                          className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title={t('reports.tooltipViewDetails', 'View Details')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Simple Pagination Footer */}
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        startIndex={startIndex}
        endIndex={endIndex}
        totalRecords={totalRecords}
        label={t('reports.paginationLabel', 'records')}
      />

      {/* Details View Modal */}
      {selectedItem && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-alert-backdrop"
          onClick={() => setSelectedItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-[var(--color-white)] dark:bg-[#18181b] rounded-md shadow-2xl max-w-lg w-full mx-4 p-6 relative border border-[var(--color-border-subtle-light)] dark:border-zinc-800 animate-alert-popup overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle-light)] dark:border-zinc-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                  {selectedItem.entityType === 'Tour' || activeTab === 'tours' ? (
                    <Compass className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  ) : selectedItem.entityType === 'Booking' || activeTab === 'bookings' ? (
                    <CalendarCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : selectedItem.entityType === 'Event' || activeTab === 'events' ? (
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : selectedItem.entityType === 'User' || activeTab === 'users' ? (
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  ) : selectedItem.entityType === 'Review' || activeTab === 'reviews' ? (
                    <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  ) : selectedItem.entityType === 'Category' || activeTab === 'categories' ? (
                    <FolderTree className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Landmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--color-text-primary-light)] dark:text-white truncate max-w-[280px]">
                    {selectedItem.primaryName || selectedItem.name || selectedItem.title || selectedItem.booking_code || selectedItem.userName}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted-light)] dark:text-zinc-400 font-mono">
                    {t('reports.recordId', { id: selectedItem.id }, `ID #${selectedItem.id}`)} • {(selectedItem.entityType || activeTab).toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-md text-[var(--color-text-muted-light)] hover:text-[var(--color-text-primary-light)] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label={t('reports.btnClose', 'Close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body with Specific Tab/Entity Details */}
            <div className="space-y-4 text-xs sm:text-sm max-h-[60vh] overflow-y-auto pr-1">
              {/* Place Entity */}
              {(selectedItem.entityType === 'Place' || activeTab === 'places') && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalCategory', 'Category')}</span>
                      <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.category}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.thProvince', 'Province')}</span>
                      <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.province}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalRatingScore', 'Rating Score')}</span>
                      <span className="font-semibold text-amber-500 inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {Number(selectedItem.rating || 0).toFixed(1)} ({selectedItem.reviews} {t('reports.thReviews', 'reviews')})
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalStatus', 'Status')}</span>
                      <div className="mt-0.5">{getStatusBadge(selectedItem.status)}</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800 space-y-1">
                    <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalLocationAddress', 'Location Address')}</span>
                    <p className="font-medium text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.location || 'Cambodia'}</p>
                    <span className="text-[11px] text-[var(--color-text-muted-light)] dark:text-zinc-400 block pt-1 font-mono">
                      {t('reports.modalCreatedDate', { date: selectedItem.createdAt || selectedItem.date }, `Created Date: ${selectedItem.createdAt || selectedItem.date}`)}
                    </span>
                  </div>
                </div>
              )}

              {/* Event Entity */}
              {(selectedItem.entityType === 'Event' || activeTab === 'events') && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalLocation', 'Location')}</span>
                      <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.location}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalStatus', 'Status')}</span>
                      <div className="mt-0.5">{getStatusBadge(selectedItem.status)}</div>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.thStartDate', 'Start Date')}</span>
                      <span className="font-semibold font-mono text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.startDate}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.thEndDate', 'End Date')}</span>
                      <span className="font-semibold font-mono text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.endDate}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
                    <span className="text-xs font-medium text-blue-900 dark:text-blue-300">{t('reports.modalTotalRegisteredAttendees', 'Total Registered Attendees')}</span>
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{selectedItem.attendees?.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Tour Entity */}
              {(selectedItem.entityType === 'Tour' || activeTab === 'tours') && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalDestination', 'Destination')}</span>
                      <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.destination}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalDuration', 'Duration')}</span>
                      <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.duration}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalPricePerson', 'Price / Person')}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">${selectedItem.price_per_person}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalRating', 'Rating')}</span>
                      <span className="font-bold text-amber-500 inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {Number(selectedItem.rating || 5.0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block mb-1">{t('reports.modalPackageSummary', 'Package Summary')}</span>
                    <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-zinc-300 leading-relaxed">
                      {selectedItem.description || 'Curated high-standard tour experience in Cambodia.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Booking Entity */}
              {(selectedItem.entityType === 'Booking' || activeTab === 'bookings') && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalBookingReference', 'Booking Reference')}</span>
                      <span className="font-bold font-mono text-[#003E83] dark:text-blue-400">#{selectedItem.booking_code}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalStatus', 'Status')}</span>
                      <div className="mt-0.5">{getStatusBadge(selectedItem.status)}</div>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalTotalAmount', 'Total Amount')}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">${selectedItem.total_price}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalBookingDate', 'Booking Date')}</span>
                      <span className="font-semibold font-mono text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.booking_date || selectedItem.date}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800 space-y-1">
                    <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalServiceExperience', 'Service & Experience')}</span>
                    <p className="font-semibold text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.service_name}</p>
                    <p className="text-xs text-[var(--color-text-muted-light)] dark:text-zinc-400">
                      {t('reports.modalProvidedBy', { name: selectedItem.business_name }, `Provided by ${selectedItem.business_name}`)}
                    </p>
                  </div>
                </div>
              )}

              {/* User Entity */}
              {(selectedItem.entityType === 'User' || activeTab === 'users') && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalEmailAddress', 'Email Address')}</span>
                      <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-white truncate block">{selectedItem.email}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalUserRole', 'User Role')}</span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-[var(--color-text-primary-light)] dark:text-white border border-gray-200 dark:border-zinc-700 inline-block mt-0.5">
                        {selectedItem.role}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalJoinedDate', 'Joined Date')}</span>
                      <span className="font-semibold font-mono text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.joinedDate}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalReviewsWritten', 'Reviews Written')}</span>
                      <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-white">{selectedItem.reviewsCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <span className="text-xs font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400">{t('reports.modalAccountStatus', 'Account Status')}</span>
                    <div>{getStatusBadge(selectedItem.status)}</div>
                  </div>
                </div>
              )}

              {/* Review Entity */}
              {(selectedItem.entityType === 'Review' || activeTab === 'reviews') && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <div className="w-10 h-10 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] overflow-hidden flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700">
                      {selectedItem.avatar ? (
                        <img src={selectedItem.avatar} alt={selectedItem.userName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                        {selectedItem.userName}
                      </h4>
                      <p className="text-xs text-[var(--color-text-muted-light)] dark:text-zinc-400 font-mono">
                        {t('reports.modalSubmittedOn', { date: selectedItem.date }, `Submitted on ${selectedItem.date}`)}
                      </p>
                    </div>
                    <div>{getStatusBadge(selectedItem.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalTargetPlace', 'Target Place')}</span>
                      <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-white flex items-center gap-1.5 mt-0.5 truncate" title={selectedItem.placeName}>
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{selectedItem.placeName}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalRatingScore', 'Rating Score')}</span>
                      <span className="font-bold text-amber-500 inline-flex items-center gap-1 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {Number(selectedItem.rating || 0).toFixed(1)} / 5.0
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block mb-1">{t('reports.modalTouristFeedback', 'Tourist Feedback')}</span>
                    <p className="italic text-xs text-[var(--color-text-secondary-light)] dark:text-zinc-300 leading-relaxed bg-[var(--color-white)] dark:bg-zinc-800/80 p-2.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-zinc-700">
                      "{selectedItem.comment || 'No comment text provided.'}"
                    </p>
                  </div>
                </div>
              )}

              {/* Category Entity */}
              {(selectedItem.entityType === 'Category' || activeTab === 'categories') && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalTotalPlacesListed', 'Total Places Listed')}</span>
                      <span className="text-base font-bold text-[#003E83] dark:text-blue-400">{selectedItem.totalPlaces} Places</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block">{t('reports.modalStatus', 'Status')}</span>
                      <div className="mt-0.5">{getStatusBadge(selectedItem.status)}</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-[var(--color-surface-hover-light)]/40 dark:bg-zinc-900/40 border border-[var(--color-border-subtle-light)] dark:border-zinc-800">
                    <span className="text-[11px] font-medium text-[var(--color-text-muted-light)] dark:text-zinc-400 block mb-1">{t('reports.modalDescription', 'Description')}</span>
                    <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-zinc-300 leading-relaxed">
                      {selectedItem.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-[var(--color-border-subtle-light)] dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-xs md:text-sm font-medium rounded-md bg-[#003E83] hover:bg-[#002e62] text-white transition-colors cursor-pointer"
              >
                {t('reports.btnClose', 'Close')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
