import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, FileText, FileSpreadsheet } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';
import { useSearch } from '../../context/SearchContext';
import authService, { isSuperAdminRole } from '../../services/authService';
import userTrackingService from '../../services/userTrackingService';
import { exportToPDF, exportToExcel } from '../../utils/exportReports';
import { getPageCache, setPageCache } from '../../utils/pageCache';
import TrackingHeader from './TrackingHeader';
import TrackingStats from './TrackingStats';
import TrackingToolbar from './TrackingToolbar';
import TrackingList from './TrackingList';
import TrackingDetailsModal from './TrackingDetailsModal';
import SimplePagination from '../../components/common/SimplePagination';

export default function UsersTracking() {
  const { showConfirm, showSuccess, showError } = useAlert();
  const { searchTerm } = useSearch();
  const currentUser = authService.getCurrentUser();
  const isSuperAdmin = isSuperAdminRole(currentUser?.role);

  const cachedData = getPageCache('user_tracking_data');

  // Data states
  const [logs, setLogs] = useState(() => cachedData?.logs || []);
  const [meta, setMeta] = useState(() => cachedData?.meta || {});
  const [stats, setStats] = useState(() => cachedData?.stats || {});
  const [loading, setLoading] = useState(() => !cachedData);

  // Filters & Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [totalRecords, setTotalRecords] = useState(() => cachedData?.totalRecords || 0);
  const [totalPages, setTotalPages] = useState(() => cachedData?.totalPages || 1);
  const itemsPerPage = 10;

  // Modals
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch logs from backend
  const fetchLogs = useCallback(async (showLoadingSpinner = true) => {
    if (showLoadingSpinner && !getPageCache('user_tracking_data')) setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        period: periodFilter !== 'all' ? periodFilter : undefined,
        search: searchTerm ? searchTerm.trim() : undefined,
      };

      const res = await userTrackingService.getLogs(params);
      if (res && res.data) {
        const list = Array.isArray(res.data) ? res.data : [];
        const resMeta = res.meta || {};
        setLogs(list);
        setMeta(resMeta);

        const total = res.pagination?.total ?? resMeta.total ?? resMeta.total_logs ?? list.length;
        const pages = res.pagination?.last_page ?? resMeta.last_page ?? Math.ceil(total / itemsPerPage) ?? 1;
        setTotalRecords(total);
        setTotalPages(pages);

        setPageCache('user_tracking_data', {
          logs: list,
          meta: resMeta,
          stats,
          totalRecords: total,
          totalPages: pages,
        });
      }
    } catch (err) {
      console.error('Failed to load tracking logs:', err);
      showError(err.message || 'Failed to fetch user tracking records', 'Data Error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, roleFilter, actionFilter, periodFilter, searchTerm, showError, stats, itemsPerPage]);

  // Fetch stats for cards
  const fetchStats = useCallback(async () => {
    try {
      const res = await userTrackingService.getStatistics();
      if (res && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Could not load tracking statistics:', err);
    }
  }, []);

  useEffect(() => {
    fetchLogs(true);
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Reset to page 1 on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleRoleFilterChange = (val) => {
    setRoleFilter(val);
    setCurrentPage(1);
  };

  const handleActionFilterChange = (val) => {
    setActionFilter(val);
    setCurrentPage(1);
  };

  const handlePeriodFilterChange = (val) => {
    setPeriodFilter(val);
    setCurrentPage(1);
  };

  // Handle View Details Modal
  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  // Super Admin: Delete single log
  const handleDeleteLog = async (log) => {
    const confirmed = await showConfirm({
      title: 'Delete Activity Record',
      message: `Are you sure you want to permanently delete activity record #${log.id} (${log.action})?\n\nThis action cannot be undone.`,
      confirmText: 'Delete Record',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      await userTrackingService.deleteLog(log.id);
      showSuccess('Activity record permanently deleted.', 'Record Deleted');
      fetchLogs(false);
      fetchStats();
    } catch (err) {
      showError(err.message || 'Failed to delete record.', 'Delete Error');
    }
  };

  // Export to PDF
  const handleExportPDF = async () => {
    const recordCount = totalRecords || logs.length;
    if (recordCount === 0) {
      showError('No records found to export.', 'Export Failed');
      return;
    }

    const confirmed = await showConfirm({
      title: 'Export PDF Report Confirmation',
      message: `Are you sure you want to export the "Users Tracking" dataset (${recordCount} items) as a styled PDF document?`,
      confirmText: 'Export PDF',
      cancelText: 'Cancel',
      type: 'danger',
      customIcon: (
        <div className="w-16 h-16 rounded-md bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 ring-8 ring-red-50/70 dark:ring-red-950/30 flex items-center justify-center shadow-xs">
          <FileText size={30} />
        </div>
      )
    });

    if (!confirmed) return;

    try {
      const params = {
        role: roleFilter !== 'all' ? roleFilter : undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        period: periodFilter !== 'all' ? periodFilter : undefined,
        search: searchTerm ? searchTerm.trim() : undefined,
      };
      const res = await userTrackingService.getExportData(params);
      const items = res?.data || [];

      if (items.length === 0) {
        showError('No records found to export.', 'Export Failed');
        return;
      }

      const headers = ['ID', 'Date & Time', 'User / Initiator', 'Role', 'Action', 'Target Item', 'Description', 'IP Address'];
      const rows = items.map(item => [
        item.ID || '',
        item.Timestamp ? item.Timestamp.replace('T', ' ').substring(0, 19) : '',
        item.User || '',
        item.Role || '',
        item.Action || '',
        item.Entity || '',
        item.Description || '',
        item['IP Address'] || ''
      ]);

      const todayStr = new Date().toISOString().slice(0, 10);
      const result = exportToPDF({
        title: 'Users Tracking & Activity History Report',
        subtitle: `User CRUD operations and action history across all platform roles (${items.length} records).`,
        headers,
        rows,
        filename: `Users_Tracking_Report_${todayStr}.pdf`,
        columnStyles: {
          0: { cellWidth: 12 },
          1: { cellWidth: 32 },
          2: { cellWidth: 30 },
          3: { cellWidth: 24 },
          4: { cellWidth: 32 },
          5: { cellWidth: 28 },
          6: { cellWidth: 78 },
          7: { cellWidth: 28 },
        }
      });

      if (result.success) {
        showSuccess(`The "Users Tracking" dataset (${items.length} items) has been exported to PDF successfully.`, 'PDF Exported Successfully');
      } else {
        showError(result.error || 'Failed to generate PDF report document.', 'Export Failed');
      }
    } catch (err) {
      console.error('PDF Export Error:', err);
      showError(err.message || 'An unexpected error occurred during PDF export.', 'Export Failed');
    }
  };

  // Export to Excel
  const handleExportExcel = async () => {
    const recordCount = totalRecords || logs.length;
    if (recordCount === 0) {
      showError('No records found to export.', 'Export Failed');
      return;
    }

    const confirmed = await showConfirm({
      title: 'Export Excel Spreadsheet Confirmation',
      message: `Are you sure you want to export the "Users Tracking" dataset (${recordCount} items) as an Excel spreadsheet?`,
      confirmText: 'Export Excel',
      cancelText: 'Cancel',
      type: 'success',
      customIcon: (
        <div className="w-16 h-16 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-50/70 dark:ring-emerald-950/30 flex items-center justify-center shadow-xs">
          <FileSpreadsheet size={30} />
        </div>
      )
    });

    if (!confirmed) return;

    try {
      const params = {
        role: roleFilter !== 'all' ? roleFilter : undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        period: periodFilter !== 'all' ? periodFilter : undefined,
        search: searchTerm ? searchTerm.trim() : undefined,
      };
      const res = await userTrackingService.getExportData(params);
      const items = res?.data || [];

      if (items.length === 0) {
        showError('No records found to export.', 'Export Failed');
        return;
      }

      const todayStr = new Date().toISOString().slice(0, 10);
      const result = exportToExcel({
        data: items,
        sheetName: 'Users Tracking',
        filename: `Users_Tracking_Report_${todayStr}.xlsx`
      });

      if (result.success) {
        showSuccess(`The "Users Tracking" dataset (${items.length} items) has been exported to Excel successfully.`, 'Excel Exported Successfully');
      } else {
        showError(result.error || 'Failed to generate Excel spreadsheet.', 'Export Failed');
      }
    } catch (err) {
      console.error('Excel Export Error:', err);
      showError(err.message || 'An unexpected error occurred during Excel export.', 'Export Failed');
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + logs.length, totalRecords);

  return (
    <div className="flex flex-col">
      {/* 1. Header Section with PDF & Excel */}
      <TrackingHeader
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
      />

      {/* 2. Key Metrics & Analytics Row */}
      <TrackingStats meta={meta} stats={stats} />

      {/* 3. Main Activities Table / Grid Section */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden flex-1">
        {/* Toolbar with Role Dropdown, Action Dropdown, and Timeframe Dropdown */}
        <TrackingToolbar
          totalCount={totalRecords}
          roleFilter={roleFilter}
          onRoleFilterChange={handleRoleFilterChange}
          actionFilter={actionFilter}
          onActionFilterChange={handleActionFilterChange}
          periodFilter={periodFilter}
          onPeriodFilterChange={handlePeriodFilterChange}
        />

        {/* Content Table or Spinner */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#003E83] dark:text-blue-500 animate-spin" />
              <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Loading user activity records...</p>
            </div>
          </div>
        ) : (
          <TrackingList
            logs={logs}
            startIndex={startIndex}
            loading={loading}
            isSuperAdmin={isSuperAdmin}
            onViewDetails={handleViewDetails}
            onDeleteLog={handleDeleteLog}
          />
        )}

        {/* Simple Pagination Footer */}
        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalRecords={totalRecords}
          label="activities"
        />
      </div>

      {/* View Activity Record Details Modal */}
      <TrackingDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        log={selectedLog}
      />
    </div>
  );
}
