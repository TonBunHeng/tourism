import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2, CheckCircle, XCircle, AlertCircle, Eye, ShieldAlert,
  Plus, RefreshCw, AlertTriangle, Edit, Trash2, ShieldCheck, Filter, X, ChevronDown,
  ExternalLink
} from 'lucide-react';
import businessService from '../../services/businessService';
import SimplePagination from '../../components/common/SimplePagination';
import BusinessDetailsModal from './BusinessDetailsModal';
import BusinessModal from './BusinessModal';
import BusinessReasonModal from './BusinessReasonModal';
import { useAlert } from '../../context/AlertContext';
import { useSearch } from '../../context/SearchContext';
import { getBusinessVerificationStatusColor } from '../../utils/StatusUtils';
import { getPageCache, setPageCache } from '../../utils/pageCache';
import { useLanguage } from '../../i18n';

export default function Businesses() {
  const { t } = useLanguage();
  const { showConfirm, showSuccess, showError } = useAlert();
  const cachedData = getPageCache('businesses_data');
  const [businesses, setBusinesses] = useState(() => cachedData?.businesses || []);
  const [stats, setStats] = useState(() => cachedData?.stats || { pending: 0, approved: 0, suspended: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(() => !cachedData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const { searchTerm: search, setSearchTerm: setSearch } = useSearch();
  const [actionLoading, setActionLoading] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [viewingBusiness, setViewingBusiness] = useState(null);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [reasonModal, setReasonModal] = useState({
    isOpen: false,
    actionType: 'reject', // 'reject' | 'suspend'
    targetBusiness: null,
    title: '',
    subtitle: ''
  });

  const fetchBusinesses = async () => {
    setIsRefreshing(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.verification_status = statusFilter;
      if (search) params.search = search;

      const res = await businessService.getAdminAll(params);
      const data = res?.data?.data || res?.data || res;

      const rawList = Array.isArray(data?.businesses) ? data.businesses : (Array.isArray(data) ? data : []);
      const mapped = rawList.map(item => ({
        ...item,
        image: item.image || item.image_url || item.cover_image || item.photo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
        price_tier: item.price_tier || '$$',
        latitude: item.latitude ?? null,
        longitude: item.longitude ?? null
      }));
      setBusinesses(mapped);
      let computedStats;
      if (data?.verification_stats) {
        computedStats = data.verification_stats;
      } else {
        const total = mapped.length;
        const pending = mapped.filter(b => b.verification_status === 'pending').length;
        const approved = mapped.filter(b => b.verification_status === 'approved').length;
        const rejected = mapped.filter(b => b.verification_status === 'rejected').length;
        const suspended = mapped.filter(b => b.verification_status === 'suspended').length;
        computedStats = { total, pending, approved, rejected, suspended };
      }
      setStats(computedStats);
      setPageCache('businesses_data', { businesses: mapped, stats: computedStats });
    } catch (err) {
      console.warn('Backend business API fetch notice:', err);
      if (!cachedData) setBusinesses([]);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [statusFilter]);

  // Recalculate stats & filtered businesses locally
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const statusMatch = statusFilter === 'all' || b.verification_status === statusFilter;
      const q = (search || '').toLowerCase().trim();
      const searchMatch = !q ||
        b.name?.toLowerCase().includes(q) ||
        b.owner?.name?.toLowerCase().includes(q) ||
        b.owner?.email?.toLowerCase().includes(q) ||
        b.province?.name?.toLowerCase().includes(q) ||
        b.license_number?.toLowerCase().includes(q);

      return statusMatch && searchMatch;
    });
  }, [businesses, statusFilter, search]);

  useEffect(() => {
    const pendingCount = businesses.filter(b => b.verification_status === 'pending').length;
    const approvedCount = businesses.filter(b => b.verification_status === 'approved').length;
    const suspendedCount = businesses.filter(b => b.verification_status === 'suspended').length;
    const rejectedCount = businesses.filter(b => b.verification_status === 'rejected').length;

    setStats({
      pending: pendingCount,
      approved: approvedCount,
      suspended: suspendedCount,
      rejected: rejectedCount,
      total: businesses.length
    });
  }, [businesses]);

  // Handle Approve Action
  const handleApprove = async (business) => {
    setActionLoading(business.id);
    try {
      await businessService.approve(business.id);
      setBusinesses(prev => prev.map(b => b.id === business.id ? { ...b, verification_status: 'approved' } : b));
      if (viewingBusiness && viewingBusiness.id === business.id) {
        setViewingBusiness(prev => ({ ...prev, verification_status: 'approved' }));
      }
      showSuccess(
        t('businesses.approvedSuccess', 'Business profile "{name}" has been approved and activated on AngkorVerses.').replace('{name}', business.name),
        t('businesses.approvedTitle', 'Profile Approved')
      );
    } catch (err) {
      showError(err.message || t('businesses.approveFailed', 'Failed to approve business profile.'), t('businesses.errorTitle', 'Action Failed'));
    } finally {
      setActionLoading(null);
    }
  };

  // Open Reject Reason Modal
  const openRejectModal = (business) => {
    setReasonModal({
      isOpen: true,
      actionType: 'reject',
      targetBusiness: business,
      title: t('businesses.rejectModalTitle', 'Reject Business Profile'),
      subtitle: t('businesses.rejectSubtitle', 'Please state the reason for rejecting "{name}"').replace('{name}', business.name)
    });
  };

  // Open Suspend Reason Modal
  const openSuspendModal = (business) => {
    setReasonModal({
      isOpen: true,
      actionType: 'suspend',
      targetBusiness: business,
      title: t('businesses.suspendModalTitle', 'Suspend Business Profile'),
      subtitle: t('businesses.suspendSubtitle', 'Provide operational justification for suspending "{name}"').replace('{name}', business.name)
    });
  };

  // Handle Submission from Reason Modal
  const handleReasonSubmit = async (reasonText) => {
    const { targetBusiness, actionType } = reasonModal;
    if (!targetBusiness) return;

    setActionLoading(targetBusiness.id);
    try {
      if (actionType === 'reject') {
        await businessService.reject(targetBusiness.id, { rejection_reason: reasonText });
        setBusinesses(prev => prev.map(b => b.id === targetBusiness.id ? { ...b, verification_status: 'rejected', rejection_reason: reasonText } : b));
        if (viewingBusiness && viewingBusiness.id === targetBusiness.id) {
          setViewingBusiness(prev => ({ ...prev, verification_status: 'rejected', rejection_reason: reasonText }));
        }
        showSuccess(
          t('businesses.rejectedSuccess', 'Business profile "{name}" has been rejected.').replace('{name}', targetBusiness.name),
          t('businesses.rejectedTitle', 'Profile Rejected')
        );
      } else {
        await businessService.suspend(targetBusiness.id, { suspension_reason: reasonText });
        setBusinesses(prev => prev.map(b => b.id === targetBusiness.id ? { ...b, verification_status: 'suspended', suspension_reason: reasonText } : b));
        if (viewingBusiness && viewingBusiness.id === targetBusiness.id) {
          setViewingBusiness(prev => ({ ...prev, verification_status: 'suspended', suspension_reason: reasonText }));
        }
        showSuccess(
          t('businesses.suspendedSuccess', 'Business profile "{name}" has been suspended.').replace('{name}', targetBusiness.name),
          t('businesses.suspendedTitle', 'Profile Suspended')
        );
      }
    } catch (err) {
      showError(err.message || t('businesses.statusUpdateFailed', 'Failed to update business status.'), t('businesses.errorTitle', 'Action Failed'));
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Activate Action
  const handleActivate = async (business) => {
    setActionLoading(business.id);
    try {
      await businessService.activate(business.id);
      setBusinesses(prev => prev.map(b => b.id === business.id ? { ...b, verification_status: 'approved' } : b));
      if (viewingBusiness && viewingBusiness.id === business.id) {
        setViewingBusiness(prev => ({ ...prev, verification_status: 'approved' }));
      }
      showSuccess(
        t('businesses.reactivatedSuccess', 'Business profile "{name}" has been reactivated.').replace('{name}', business.name),
        t('businesses.reactivatedTitle', 'Profile Reactivated')
      );
    } catch (err) {
      showError(err.message || t('businesses.activateFailed', 'Failed to reactivate business profile.'), t('businesses.errorTitle', 'Action Failed'));
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Delete Action
  const handleDelete = async (business) => {
    const confirmed = await showConfirm({
      title: t('businesses.deleteTitle', 'Delete Business Profile'),
      message: t('businesses.deleteMessage', 'Are you sure you want to permanently delete "{name}"?\n\nThis will remove all associated ratings, media, and owner profile links.').replace('{name}', business.name),
      confirmText: t('businesses.deleteConfirmBtn', 'Delete Profile'),
      type: 'danger'
    });

    if (!confirmed) return;

    setActionLoading(business.id);
    try {
      await businessService.delete(business.id);
      setBusinesses(prev => prev.filter(b => b.id !== business.id));
      if (viewingBusiness && viewingBusiness.id === business.id) {
        setViewingBusiness(null);
      }
      showSuccess(
        t('businesses.deletedSuccess', 'Business profile "{name}" has been removed.').replace('{name}', business.name),
        t('businesses.deletedTitle', 'Profile Deleted')
      );
    } catch (err) {
      showError(err.message || t('businesses.deleteFailed', 'Failed to delete business profile.'), t('businesses.errorTitle', 'Action Failed'));
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Form Submit for Create / Edit
  const handleSaveBusiness = async (formData) => {
    try {
      if (editingBusiness) {
        await businessService.update(editingBusiness.id, formData);
        setBusinesses(prev => prev.map(b => b.id === editingBusiness.id ? {
          ...b,
          ...formData,
          province: typeof formData.province === 'string' ? { name: formData.province } : (formData.province || b.province),
          category: formData.category_name ? { id: formData.category_id, name: formData.category_name } : b.category,
          category_name: formData.category_name || b.category_name,
          image: formData.image !== undefined ? formData.image : b.image,
          price_tier: formData.price_tier || b.price_tier,
          latitude: formData.latitude ?? b.latitude,
          longitude: formData.longitude ?? b.longitude,
          phone: formData.phone || formData.owner_phone || b.phone,
          email: formData.email || formData.owner_email || b.email,
          owner: {
            ...b.owner,
            name: formData.owner_name || b.owner?.name,
            email: formData.owner_email || b.owner?.email,
            phone: formData.owner_phone || b.owner?.phone,
          }
        } : b));
        showSuccess(
          t('businesses.updatedSuccess', 'Business profile "{name}" has been updated.').replace('{name}', formData.name),
          t('businesses.updatedTitle', 'Changes Saved')
        );
      } else {
        const res = await businessService.create(formData);
        const created = res?.data?.data || res?.data || res;
        if (res?.success === false || !created?.id) {
          throw new Error(res?.message || t('businesses.errorSaving', 'The server did not return the created business.'));
        }
        setBusinesses(prev => [{ ...created, image: created.image || created.image_url || formData.image }, ...prev]);
        showSuccess(
          t('businesses.createdSuccess', 'New business profile "{name}" registered successfully.').replace('{name}', formData.name),
          t('businesses.createdTitle', 'Business Created')
        );
      }
      setIsAddModalOpen(false);
      setEditingBusiness(null);
    } catch (err) {
      showError(err.message || t('businesses.errorSaving', 'Failed to save business profile.'), t('businesses.errorSavingTitle', 'Error Saving'));
    }
  };

  // Pagination calculation
  const totalRecords = filteredBusinesses.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBusinesses = filteredBusinesses.slice(startIndex, startIndex + itemsPerPage);
  const endIndex = Math.min(startIndex + paginatedBusinesses.length, totalRecords);

  const statsList = [
    {
      label: t('businesses.totalBusinesses', "Total Businesses"),
      value: (stats.total || 0).toLocaleString(),
      subtext: t('businesses.allRecords', "All business records"),
      icon: Building2,
      color: "text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]",
      bg: "bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]"
    },
    {
      label: t('businesses.activeApproved', "Active & Approved"),
      value: (stats.approved || 0).toLocaleString(),
      subtext: t('businesses.verifiedListings', "Verified commercial listings"),
      icon: CheckCircle,
      color: "text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]",
      bg: "bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]"
    },
    {
      label: t('businesses.pendingReview', "Pending Review"),
      value: (stats.pending || 0).toLocaleString(),
      subtext: t('businesses.awaitingVerification', "Awaiting verification"),
      icon: AlertCircle,
      color: "text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]",
      bg: "bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]"
    },
    {
      label: t('businesses.suspended', "Suspended"),
      value: (stats.suspended || 0).toLocaleString(),
      subtext: t('businesses.temporarilyFlagged', "Temporarily flagged"),
      icon: AlertTriangle,
      color: "text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]",
      bg: "bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]"
    }
  ];

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return t('businesses.statusApproved', 'Approved');
      case 'pending': return t('businesses.statusPending', 'Pending Review');
      case 'suspended': return t('businesses.statusSuspended', 'Suspended');
      case 'rejected': return t('businesses.statusRejected', 'Rejected');
      default: return status;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-tight">
              {t('businesses.pageTitle', 'Businesses')}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
              {t('businesses.pageSubtitle', 'Review, verify, approve, and manage commercial tourism profiles from business owners across Cambodia.')}
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <a
              href={(() => {
                const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
                const travelBase = isLocal ? 'http://localhost:5175' : '';
                return `${travelBase}/businesses`;
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 md:gap-2 px-3.5 py-2 text-xs md:text-sm font-medium rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] text-[#003E83] dark:text-blue-400 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>{t('businesses.visitPage', 'Visit Page')}</span>
            </a>
            <button
              type="button"
              onClick={() => { setEditingBusiness(null); setIsAddModalOpen(true); }}
              className="flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-md bg-[#003E83] hover:bg-[#002e62] text-white transition-colors shrink-0 w-full sm:w-auto cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>{t('businesses.registerBusiness', 'Register Business')}</span>
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

      {/* Main Business Table Container */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden flex-1">
        {/* Toolbar Header */}
        <div className="px-4 md:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                {t('businesses.allBusinesses', 'All Businesses')}
              </h2>
              {totalRecords !== undefined && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                  {totalRecords === 1
                    ? t('businesses.businessCount', '{count} business').replace('{count}', totalRecords)
                    : t('businesses.businessesCount', '{count} businesses').replace('{count}', totalRecords)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              {/* Status Filter Dropdown */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
                >
                  <option value="all">{t('businesses.allStatuses', 'All Statuses')}</option>
                  <option value="pending">{t('businesses.statusPending', 'Pending Review')}</option>
                  <option value="approved">{t('businesses.statusApproved', 'Approved')}</option>
                  <option value="suspended">{t('businesses.statusSuspended', 'Suspended')}</option>
                  <option value="rejected">{t('businesses.statusRejected', 'Rejected')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
            <thead className="bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/50">
              <tr>
                <th className="pl-4 pr-2 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-10 text-center">
                  {t('businesses.colNumber', '#')}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  {t('businesses.colNameCategory', 'BUSINESS NAME & CATEGORY')}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  {t('businesses.colOwnerContact', 'OWNER CONTACT')}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  {t('businesses.colProvinceLicense', 'PROVINCE & LICENSE')}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  {t('businesses.colStatus', 'VERIFICATION STATUS')}
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap">
                  {t('businesses.colActions', 'ACTIONS')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[var(--color-text-muted-light)]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#003E83]" />
                    {t('businesses.loadingRecords', 'Loading business registrations...')}
                  </td>
                </tr>
              ) : paginatedBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 px-4">
                    <Building2 className="w-12 h-12 text-[#003E83] mx-auto mb-2 opacity-80" />
                    <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
                      {t('businesses.noRecordsFound', 'No business profile records found')}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                      {t('businesses.refineFilterPrompt', 'Try refining your search or filter criteria')}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedBusinesses.map((b, index) => {
                  const status = String(b.verification_status || 'pending').toLowerCase();
                  return (
                    <tr key={b.id} className="hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors">
                      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700 overflow-hidden font-bold text-[#003E83] dark:text-blue-400">
                            {(b.image || b.image_url || b.cover_image || b.logo) ? (
                              <img
                                src={b.image || b.image_url || b.cover_image || b.logo}
                                alt={b.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              b.name?.charAt(0)?.toUpperCase() || 'B'
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                              {b.name}
                            </div>
                            <div className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                              {b.category?.name || b.category_name || b.category || 'Hospitality'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-xs font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                          {b.owner?.name || b.owner_name || 'Owner'}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                          {b.owner?.email || b.email}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-xs text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] font-medium">
                          {b.province?.name || b.province || '—'}
                        </div>
                        <div className="text-[11px] font-mono text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                          {b.license_number || '—'}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border capitalize ${getBusinessVerificationStatusColor(status)}`}>
                          {status === 'pending' && <AlertCircle className="w-3.5 h-3.5 mr-1" />}
                          {status === 'approved' && <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                          {status === 'suspended' && <AlertTriangle className="w-3.5 h-3.5 mr-1" />}
                          {status === 'rejected' && <XCircle className="w-3.5 h-3.5 mr-1" />}
                          {getStatusText(status)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingBusiness(b)}
                            className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title={t('businesses.viewDetails', 'View Details')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <a
                            href={(() => {
                              const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
                              const travelBase = isLocal ? 'http://localhost:5175' : '';
                              return `${travelBase}/businesses/${b.id || ''}`;
                            })()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-[#003E83] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer inline-flex items-center justify-center"
                            title={t('businesses.visitPublicPage', 'Visit Public Page')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => { setEditingBusiness(b); setIsAddModalOpen(true); }}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title={t('businesses.editProfile', 'Edit Profile')}
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(b)}
                                disabled={actionLoading === b.id}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md text-xs font-medium transition-all active:scale-95 hover:scale-105 disabled:opacity-50 cursor-pointer"
                              >
                                {t('businesses.approve', 'Approve')}
                              </button>
                              <button
                                onClick={() => openRejectModal(b)}
                                disabled={actionLoading === b.id}
                                className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-md text-xs font-medium transition-all active:scale-95 hover:scale-105 disabled:opacity-50 cursor-pointer"
                              >
                                {t('businesses.reject', 'Reject')}
                              </button>
                            </>
                          )}

                          {status === 'approved' && (
                            <button
                              onClick={() => openSuspendModal(b)}
                              disabled={actionLoading === b.id}
                              className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-md text-xs font-medium transition-all active:scale-95 hover:scale-105 disabled:opacity-50 cursor-pointer"
                            >
                              {t('businesses.suspend', 'Suspend')}
                            </button>
                          )}

                          {status === 'suspended' && (
                            <button
                              onClick={() => handleActivate(b)}
                              disabled={actionLoading === b.id}
                              className="bg-[#003E83] hover:bg-[#002e62] text-white px-2.5 py-1 rounded-md text-xs font-medium transition-all active:scale-95 hover:scale-105 disabled:opacity-50 cursor-pointer"
                            >
                              {t('businesses.reactivate', 'Reactivate')}
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(b)}
                            className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title={t('businesses.deleteProfile', 'Delete Profile')}
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

        {/* Simple Pagination Footer */}
        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalRecords={totalRecords}
          label={t('sidebar.businesses', 'businesses')}
        />
      </div>

      {/* Business Details View Modal */}
      {viewingBusiness && (
        <BusinessDetailsModal
          business={viewingBusiness}
          onClose={() => setViewingBusiness(null)}
          onApprove={handleApprove}
          onReject={openRejectModal}
          onSuspend={openSuspendModal}
          onActivate={handleActivate}
          onEdit={(b) => { setViewingBusiness(null); setEditingBusiness(b); setIsAddModalOpen(true); }}
        />
      )}

      {/* Add / Edit Business Profile Modal */}
      <BusinessModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingBusiness(null); }}
        editingBusiness={editingBusiness}
        onSubmit={handleSaveBusiness}
      />

      {/* Reason Modal (Rejection / Suspension) */}
      <BusinessReasonModal
        isOpen={reasonModal.isOpen}
        onClose={() => setReasonModal(prev => ({ ...prev, isOpen: false }))}
        onSubmit={handleReasonSubmit}
        title={reasonModal.title}
        subtitle={reasonModal.subtitle}
        actionType={reasonModal.actionType}
        businessName={reasonModal.targetBusiness?.name}
      />
    </div>
  );
}
