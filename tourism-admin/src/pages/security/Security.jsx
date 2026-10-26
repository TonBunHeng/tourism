import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';
import { useSearch } from '../../context/SearchContext';
import securityService from '../../services/securityService';
import SecurityHeader from './SecurityHeader';
import SecurityStats from './SecurityStats';
import SecurityList from './SecurityList';
import SecurityDetailsModal from './SecurityDetailsModal';
import SecurityExportModal from './SecurityExportModal';
import SecurityToolbar from './SecurityToolbar';
import SimplePagination from '../../components/common/SimplePagination';
import { getPageCache, setPageCache } from '../../utils/pageCache';

export default function Security() {
  const { showConfirm, showSuccess, showError } = useAlert();
  const { searchTerm } = useSearch();

  const cachedSecurity = getPageCache('security_data');
  const [alerts, setAlerts] = useState(() => cachedSecurity?.alerts || []);
  const [meta, setMeta] = useState(() => cachedSecurity?.meta || {});
  const [loading, setLoading] = useState(() => !cachedSecurity);

  // Modal States
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Pagination & Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const itemsPerPage = 10;

  const fetchSecurityAlerts = useCallback(async () => {
    if (!cachedSecurity && alerts.length === 0) {
      setLoading(true);
    }
    try {
      const res = await securityService.getAlerts({ per_page: 100 });
      const data = res?.data || [];
      const alertsList = Array.isArray(data) ? data : [];
      setAlerts(alertsList);
      const newMeta = res?.meta || {};
      if (res?.meta) {
        setMeta(newMeta);
      }
      setPageCache('security_data', { alerts: alertsList, meta: newMeta });
    } catch (err) {
      console.error('Failed to load security alerts from DB:', err);
    } finally {
      setLoading(false);
    }
  }, [cachedSecurity, alerts.length]);

  useEffect(() => {
    fetchSecurityAlerts();
  }, [fetchSecurityAlerts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const q = (searchTerm || '').toLowerCase();
      const matchesSearch = !q || (
        (a.target_email || a.email || '').toLowerCase().includes(q) ||
        (a.ip_address || a.ip || '').toLowerCase().includes(q) ||
        (a.description || a.incident || a.message || '').toLowerCase().includes(q)
      );
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'unread' && !a.is_read) ||
        (statusFilter === 'read' && a.is_read) ||
        (statusFilter === 'blocked' && a.is_ip_blocked);

      return matchesSearch && matchesStatus;
    });
  }, [alerts, searchTerm, statusFilter]);

  const totalRecords = filteredAlerts.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);
  const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);

  const handleOpenDetails = (alert) => {
    setSelectedAlert(alert);
    setIsDetailsModalOpen(true);

    if (!alert.is_read) {
      handleMarkRead(alert.id);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await securityService.markAsRead(id);
      setAlerts(prev =>
        prev.map(a => (a.id === id ? { ...a, is_read: true } : a))
      );
      if (selectedAlert && selectedAlert.id === id) {
        setSelectedAlert(prev => ({ ...prev, is_read: true }));
      }
      setMeta(prev => ({ ...prev, unread_count: Math.max(0, (prev.unread_count || 1) - 1) }));
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await securityService.markAllRead();
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
      setMeta(prev => ({ ...prev, unread_count: 0 }));
      showSuccess('All security incidents marked as acknowledged.', 'Success');
    } catch (err) {
      showError(err.message || 'Failed to mark alerts as read.', 'Error');
    }
  };

  const handleBlockIp = async (ipAddress) => {
    if (!ipAddress) return;
    const confirmed = await showConfirm({
      title: 'Block IP Address',
      message: `Are you sure you want to block IP address "${ipAddress}"? All login requests and access from this IP will be immediately rejected.`,
      confirmText: 'Block IP',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await securityService.blockIp(ipAddress, 'Blocked by admin due to security threshold violation.');
        setAlerts(prev =>
          prev.map(a => (a.ip_address === ipAddress ? { ...a, is_ip_blocked: true } : a))
        );
        if (selectedAlert && selectedAlert.ip_address === ipAddress) {
          setSelectedAlert(prev => ({ ...prev, is_ip_blocked: true }));
        }
        setMeta(prev => ({ ...prev, blocked_ips_count: (prev.blocked_ips_count || 0) + 1 }));
        showSuccess(`IP address ${ipAddress} has been blocked.`, 'IP Blocked');
      } catch (err) {
        showError(err.message || 'Failed to block IP address.', 'Error');
      }
    }
  };

  const handleUnblockIp = async (ipAddress) => {
    if (!ipAddress) return;
    const confirmed = await showConfirm({
      title: 'Unblock IP Address',
      message: `Are you sure you want to unblock IP address "${ipAddress}"?`,
      confirmText: 'Unblock IP',
      type: 'info'
    });

    if (confirmed) {
      try {
        await securityService.unblockIp(ipAddress);
        setAlerts(prev =>
          prev.map(a => (a.ip_address === ipAddress ? { ...a, is_ip_blocked: false } : a))
        );
        if (selectedAlert && selectedAlert.ip_address === ipAddress) {
          setSelectedAlert(prev => ({ ...prev, is_ip_blocked: false }));
        }
        setMeta(prev => ({ ...prev, blocked_ips_count: Math.max(0, (prev.blocked_ips_count || 1) - 1) }));
        showSuccess(`IP address ${ipAddress} is now unblocked.`, 'IP Unblocked');
      } catch (err) {
        showError(err.message || 'Failed to unblock IP address.', 'Error');
      }
    }
  };

  const handleDeleteAlert = async (id) => {
    const confirmed = await showConfirm({
      title: 'Delete Security Alert',
      message: 'Are you sure you want to permanently remove this incident record?',
      confirmText: 'Delete',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await securityService.deleteAlert(id);
        setAlerts(prev => prev.filter(a => a.id !== id));
        if (selectedAlert && selectedAlert.id === id) {
          setIsDetailsModalOpen(false);
          setSelectedAlert(null);
        }
        setMeta(prev => ({ ...prev, total_alerts: Math.max(0, (prev.total_alerts || 1) - 1) }));
        showSuccess('Security alert deleted.', 'Success');
      } catch (err) {
        showError(err.message || 'Failed to delete security alert.', 'Error');
      }
    }
  };

  return (
    <>
      {/* Details Modal with IP Blocking Controls */}
      <SecurityDetailsModal
        isOpen={isDetailsModalOpen}
        alert={selectedAlert}
        onClose={() => setIsDetailsModalOpen(false)}
        onMarkRead={handleMarkRead}
        onDelete={handleDeleteAlert}
        onBlockIp={handleBlockIp}
        onUnblockIp={handleUnblockIp}
      />

      {/* Download Data / Export Modal */}
      <SecurityExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        alerts={alerts}
        meta={meta}
      />

      {/* Header */}
      <SecurityHeader
        onOpenExport={() => setIsExportModalOpen(true)}
      />

      {/* Standard KPI Stats Cards */}
      <SecurityStats meta={meta} />

      {/* Standard Table List View with Pagination */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
          <Loader2 className="w-8 h-8 text-[#003E83] dark:text-blue-500 animate-spin" />
          <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
            Loading real security logs from database...
          </p>
        </div>
      ) : (
        <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden shadow-xs">
          <SecurityToolbar
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            totalResults={totalRecords}
          />
          <SecurityList
            alerts={paginatedAlerts}
            loading={loading}
            onOpenDetails={handleOpenDetails}
            onMarkRead={handleMarkRead}
            onDeleteAlert={handleDeleteAlert}
            startIndex={startIndex}
          />

          {/* Simple Pagination Footer */}
          <SimplePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalRecords={totalRecords}
            label="alerts"
          />
        </div>
      )}
    </>
  );
}
