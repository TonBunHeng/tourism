import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  CalendarCheck,
  Users,
  Star,
  FileSpreadsheet,
  FileText,
  Download,
  Printer,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Building2,
  ChevronRight,
  Filter,
  Sparkles,
  Percent,
  Award,
  ArrowUpRight,
  PieChart as PieChartIcon,
  Layers,
  Loader2,
  Calendar,
  ShieldCheck,
  Check,
  Search,
} from 'lucide-react';
import { exportToPDF, exportToExcel } from '../../utils/exportReports';
import { useAlert } from '../../context/AlertContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import businessService from '../../services/businessService';
import Breadcrumb from '../../components/common/Breadcrumb';
import SimplePagination from '../../components/common/SimplePagination';

// Custom Tooltip for Trend Chart
const TrendCustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-700 text-xs space-y-1.5 min-w-[190px]">
        <p className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-1.5 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-gray-400 font-normal">Report Interval</span>
        </p>
        {payload.map((entry, index) => (
          <div key={`trend-tooltip-${index}`} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: entry.color || entry.stroke }} />
              {entry.name}:
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {entry.dataKey === 'revenue'
                ? `$${Number(entry.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : Number(entry.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Pie Chart
const PieCustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700 text-xs space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color || data.fill }} />
          <span className="font-bold text-gray-900 dark:text-white">{data.name}</span>
        </div>
        <p className="text-gray-500 dark:text-zinc-400">
          Count: <strong className="text-gray-900 dark:text-white">{data.value}</strong> ({data.payload.percentage || 0}%)
        </p>
      </div>
    );
  }
  return null;
};

export default function BusinessReports() {
  const { showConfirm, showSuccess, showError } = useAlert();
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [timeframe, setTimeframe] = useState('this_year');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue' | 'bookings' | 'both'
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const [error, setError] = useState(null);

  // Load owned businesses for the filter dropdown
  useEffect(() => {
    businessService.getOwnerBusinesses()
      .then((res) => {
        const list = res?.data?.businesses || res?.data || [];
        setBusinesses(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.warn('Could not load owner businesses list:', err);
      });
  }, []);

  // Fetch report data based on active filters
  const fetchReport = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = {};
    if (selectedBusinessId) params.business_id = selectedBusinessId;
    if (timeframe) params.timeframe = timeframe;
    if (timeframe === 'custom') {
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
    }
    if (statusFilter) params.status = statusFilter;

    businessService.getReports(params)
      .then((res) => {
        setReportData(res?.data || null);
      })
      .catch((err) => {
        console.error('Failed to load business report:', err);
        setError(err?.message || 'Failed to load business report.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedBusinessId, timeframe, dateFrom, dateTo, statusFilter]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Handle Stylized PDF Export matching Admin Reports
  const handleExportPdf = async () => {
    try {
      const params = { format: 'json' };
      if (selectedBusinessId) params.business_id = selectedBusinessId;
      if (timeframe) params.timeframe = timeframe;
      if (timeframe === 'custom') {
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
      }
      if (statusFilter) params.status = statusFilter;

      setExportingPdf(true);
      const res = await businessService.exportReport(params);
      const data = res?.data || {};
      const records = data.records || reportData?.recent_bookings || [];
      const recordCount = records.length;

      const confirmed = await showConfirm({
        title: 'Export PDF Confirmation',
        message: `Are you sure you want to export the Business Performance dataset (${recordCount} records) as a PDF file?`,
        confirmText: 'Export PDF',
        cancelText: 'Cancel',
        type: 'danger',
        customIcon: (
          <div className="w-16 h-16 rounded-md bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 ring-8 ring-red-50/70 dark:ring-red-950/30 flex items-center justify-center shadow-xs">
            <FileText size={30} />
          </div>
        ),
      });

      if (!confirmed) {
        setExportingPdf(false);
        return;
      }

      const todayStr = new Date().toISOString().slice(0, 10);
      const headers = [
        'Booking Ref',
        'Business',
        'Service',
        'Customer Name',
        'Date & Time',
        'Guests',
        'Total ($)',
        'Status',
        'Payment'
      ];

      const rows = records.map((r) => [
        r.booking_reference || `#${r.id}`,
        r.business?.name || r.business_name || 'Business',
        r.service?.name || r.service_name || 'Direct Reservation',
        r.customer_name || r.user?.name || 'Guest',
        `${r.booking_date || ''} ${r.booking_time ? String(r.booking_time).slice(0, 5) : ''}`.trim(),
        r.total_guests || 1,
        `$${Number(r.total_price || 0).toFixed(2)}`,
        (r.status || 'pending').toUpperCase(),
        (r.payment_status || 'unpaid').toUpperCase()
      ]);

      const result = exportToPDF({
        title: 'BUSINESS PERFORMANCE & RESERVATIONS REPORT',
        subtitle: `Scope: ${timeframeInfo.label || 'All Available Records'} | Generated on ${new Date().toLocaleString()} | Filter: ${statusFilter || 'All Statuses'}`,
        headers,
        rows,
        summary: reportData?.summary,
        filename: `Business_Report_${todayStr}.pdf`
      });

      if (result.success) {
        showSuccess(`Business report (${recordCount} items) has been exported to PDF successfully.`, 'PDF Exported Successfully');
      } else {
        showError(result.error || 'Failed to generate PDF document.', 'Export Failed');
      }
    } catch (err) {
      console.error('PDF Export Error:', err);
      showError(err?.message || 'Failed to export PDF report.', 'Export Failed');
    } finally {
      setExportingPdf(false);
    }
  };

  // Handle Excel (.xlsx) Export matching Admin Reports
  const handleExportExcel = async () => {
    try {
      const params = { format: 'json' };
      if (selectedBusinessId) params.business_id = selectedBusinessId;
      if (timeframe) params.timeframe = timeframe;
      if (timeframe === 'custom') {
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
      }
      if (statusFilter) params.status = statusFilter;

      setExportingExcel(true);
      const res = await businessService.exportReport(params);
      const data = res?.data || {};
      const records = data.records || reportData?.recent_bookings || [];
      const recordCount = records.length;

      const confirmed = await showConfirm({
        title: 'Export Excel Confirmation',
        message: `Are you sure you want to export the Business Performance dataset (${recordCount} records) as an Excel spreadsheet?`,
        confirmText: 'Export Excel',
        cancelText: 'Cancel',
        type: 'success',
        customIcon: (
          <div className="w-16 h-16 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-50/70 dark:ring-emerald-950/30 flex items-center justify-center shadow-xs">
            <FileSpreadsheet size={30} />
          </div>
        ),
      });

      if (!confirmed) {
        setExportingExcel(false);
        return;
      }

      const todayStr = new Date().toISOString().slice(0, 10);
      const excelData = records.map((r) => ({
        'Booking Reference': r.booking_reference || `#${r.id}`,
        'Business': r.business?.name || r.business_name || 'Business',
        'Service': r.service?.name || r.service_name || 'Direct Reservation',
        'Customer Name': r.customer_name || r.user?.name || 'Guest',
        'Customer Email': r.customer_email || r.user?.email || '',
        'Customer Phone': r.customer_phone || '',
        'Booking Date': r.booking_date || '',
        'Booking Time': r.booking_time || '',
        'Guests': r.total_guests || 1,
        'Total Amount (USD)': Number(r.total_price || 0),
        'Booking Status': (r.status || '').toUpperCase(),
        'Payment Status': (r.payment_status || '').toUpperCase(),
        'Created At': r.created_at ? new Date(r.created_at).toLocaleString() : ''
      }));

      const result = exportToExcel({
        data: excelData,
        sheetName: 'Business Bookings',
        filename: `Business_Report_${todayStr}.xlsx`
      });

      if (result.success) {
        showSuccess(`Business report (${recordCount} items) has been exported to Excel successfully.`, 'Excel Exported Successfully');
      } else {
        showError(result.error || 'Failed to generate Excel spreadsheet.', 'Export Failed');
      }
    } catch (err) {
      console.error('Excel Export Error:', err);
      showError(err?.message || 'Failed to export Excel report.', 'Export Failed');
    } finally {
      setExportingExcel(false);
    }
  };

  // Handle CSV Download fallback
  const handleExportCsv = async () => {
    try {
      setExportingCsv(true);
      const params = { format: 'csv' };
      if (selectedBusinessId) params.business_id = selectedBusinessId;
      if (timeframe) params.timeframe = timeframe;
      if (timeframe === 'custom') {
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
      }
      if (statusFilter) params.status = statusFilter;

      const blobData = await businessService.exportReport(params);
      const blob = new Blob([blobData], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `business-report-${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess('Business report CSV file downloaded successfully.', 'CSV Downloaded');
    } catch (err) {
      console.error('CSV Export Error:', err);
      showError('Failed to download CSV report.', 'Export Failed');
    } finally {
      setExportingCsv(false);
    }
  };

  const summary = reportData?.summary || {};
  const trends = reportData?.trends || [];
  const topServices = reportData?.top_services || [];
  const customerInsights = reportData?.customer_insights || {};
  const ratingsBreakdown = reportData?.ratings_breakdown || {};
  const bookingStatusBreakdown = reportData?.booking_status_breakdown || [];
  const paymentBreakdown = reportData?.payment_status_breakdown || {};
  const timeframeInfo = reportData?.timeframe || {};
  const displayBusinesses = businesses.length > 0 ? businesses : (reportData?.businesses || []);

  const timeframeOptions = [
    { id: 'this_year', label: 'This Year (2026)' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'this_week', label: 'This Week' },
    { id: 'today', label: 'Today' },
    { id: 'all_time', label: 'All Time' },
    { id: 'custom', label: 'Custom Range' },
  ];

  const statusOptions = [
    { id: '', label: 'All Statuses' },
    { id: 'completed', label: 'Completed' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'pending', label: 'Pending' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const allRecords = reportData?.recent_bookings || [];
  const filteredRecords = allRecords.filter((r) => {
    if (!tableSearch) return true;
    const term = tableSearch.toLowerCase();
    return (
      (r.booking_reference && r.booking_reference.toLowerCase().includes(term)) ||
      (r.customer_name && r.customer_name.toLowerCase().includes(term)) ||
      (r.customer_email && r.customer_email.toLowerCase().includes(term)) ||
      (r.business_name && r.business_name.toLowerCase().includes(term)) ||
      (r.service_name && r.service_name.toLowerCase().includes(term)) ||
      (r.status && r.status.toLowerCase().includes(term))
    );
  });

  const tableItemsPerPage = 8;
  const totalPages = Math.ceil(filteredRecords.length / tableItemsPerPage) || 1;
  const tableStartIndex = (tablePage - 1) * tableItemsPerPage;
  const paginatedRecords = filteredRecords.slice(tableStartIndex, tableStartIndex + tableItemsPerPage);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md">
            Completed
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md">
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-md">
            Pending
          </span>
        );
      case 'cancelled':
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-md">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 rounded-md">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const getPaymentBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md">
            Paid
          </span>
        );
      case 'unpaid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-md">
            Unpaid
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 rounded-md">
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 rounded-md">
            {status || 'Pending'}
          </span>
        );
    }
  };

  // Shared button class matching Admin ReportsHeader.jsx
  const actionBtnClass =
    'flex items-center justify-center gap-1.5 md:gap-2 w-full sm:w-[100px] px-3.5 py-2 text-xs md:text-sm font-medium rounded-md transition-colors cursor-pointer disabled:opacity-50 shrink-0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Print-only Official Header (Shown only during paper / system printing) */}
      <div className="hidden print:block mb-6 border-b-2 border-[#003E83] pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#003E83] tracking-tight">SMART TOURISM BUSINESS REPORT</h1>
            <p className="text-xs text-gray-600 mt-1">AngkorVerses Platform - Business Performance & Reservation Analytics</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p className="font-semibold text-gray-800">Generated: {new Date().toLocaleString()}</p>
            <p>Scope: {timeframeInfo.label || 'All Available Records'}</p>
          </div>
        </div>
      </div>

      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: 'Business Portal', to: '/business/dashboard' },
            { label: 'Business Reports' },
          ]}
        />
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 dark:border-zinc-800 bg-gradient-to-br from-blue-50/60 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-6 sm:p-8 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003E83]/10 dark:bg-blue-400/10 text-[#003E83] dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Financial & Analytics Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Business Performance Reports
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 mt-1 max-w-2xl">
              Analyze reservation volume, gross revenue, guest satisfaction, customer retention, and export financial statements.
            </p>
          </div>

          {/* Action Controls - PDF, Excel & CSV Export */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={exportingExcel}
              onClick={handleExportExcel}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-2xl transition-all cursor-pointer disabled:opacity-50 border border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 shadow-xs"
              title="Export Full Dataset as Excel Spreadsheet (.xlsx)"
            >
              {exportingExcel ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
              )}
              <span>Export Excel</span>
            </button>

            <button
              type="button"
              disabled={exportingPdf}
              onClick={handleExportPdf}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-2xl transition-all cursor-pointer disabled:opacity-50 border border-transparent bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-xs"
              title="Export Stylized PDF Document"
            >
              {exportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <Download className="w-4 h-4 shrink-0" />
              )}
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-xs space-y-4 transition-colors print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Business & Timeframe Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Business Dropdown */}
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                className="text-xs sm:text-sm font-bold rounded-2xl border border-gray-200 dark:border-zinc-700 bg-gray-50/60 dark:bg-zinc-800 text-gray-900 dark:text-white px-3.5 py-2 focus:ring-2 focus:ring-[#003E83]/20 outline-hidden cursor-pointer"
              >
                <option value="">All My Businesses ({displayBusinesses.length})</option>
                {displayBusinesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Timeframe Presets */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-md text-xs">
              {timeframeOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTimeframe(opt.id)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    timeframe === opt.id
                      ? 'bg-white dark:bg-zinc-900 text-[#003E83] dark:text-[#60a5fa] font-bold shadow-xs'
                      : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter & Refresh */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white px-2.5 py-1.5 focus:ring-2 focus:ring-[#003E83] outline-hidden"
            >
              {statusOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={fetchReport}
              disabled={loading}
              className="p-1.5 text-gray-500 hover:text-[#003E83] dark:text-zinc-400 dark:hover:text-blue-400 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              title="Refresh Report"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Custom Date Range Picker */}
        {timeframe === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800 text-xs">
            <span className="font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#003E83]" />
              Select Date Range:
            </span>
            <div className="flex items-center gap-2">
              <label htmlFor="dateFrom" className="text-gray-500">From:</label>
              <input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-2.5 py-1 border border-gray-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs outline-hidden"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="dateTo" className="text-gray-500">To:</label>
              <input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-2.5 py-1 border border-gray-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs outline-hidden"
              />
            </div>
            <button
              type="button"
              onClick={fetchReport}
              className="px-3 py-1 bg-[#003E83] text-white rounded text-xs font-semibold hover:bg-[#002e62]"
            >
              Apply Dates
            </button>
          </div>
        )}

        {/* Active Filter Scope Info */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-zinc-400 pt-1">
          <span>
            Showing data for: <strong className="text-gray-900 dark:text-white">{timeframeInfo.label || 'All Available Records'}</strong>
          </span>
          {reportData?.businesses?.length > 0 && (
            <span>
              Covering: <strong className="text-gray-900 dark:text-white">{reportData.businesses.map(b => b.name).join(', ')}</strong>
            </span>
          )}
        </div>
      </div>

      {loading && !reportData ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#003E83] dark:text-[#60a5fa] animate-spin" />
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Computing business performance statements...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{error}</p>
          <button
            type="button"
            onClick={fetchReport}
            className="px-4 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded hover:bg-rose-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <>
          {/* Executive Summary Cards (6 KPIs) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Gross Revenue */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs space-y-1 transition-colors">
              <div className="flex items-center justify-between text-gray-500 dark:text-zinc-400 text-xs">
                <span className="font-semibold">Gross Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                ${Number(summary.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">
                Completed: ${Number(summary.completed_revenue || 0).toFixed(2)}
              </div>
            </div>

            {/* 2. Total Bookings */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs space-y-1 transition-colors">
              <div className="flex items-center justify-between text-gray-500 dark:text-zinc-400 text-xs">
                <span className="font-semibold">Total Bookings</span>
                <CalendarCheck className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                {summary.total_bookings || 0}
              </p>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {summary.completion_rate || 0}% Completion Rate
              </div>
            </div>

            {/* 3. Pending Pipeline */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs space-y-1 transition-colors">
              <div className="flex items-center justify-between text-gray-500 dark:text-zinc-400 text-xs">
                <span className="font-semibold">Pending Action</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                {summary.pending_bookings || 0}
              </p>
              <div className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">
                Pipeline: ${Number(summary.pending_revenue || 0).toFixed(2)}
              </div>
            </div>

            {/* 4. Guests Hosted */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs space-y-1 transition-colors">
              <div className="flex items-center justify-between text-gray-500 dark:text-zinc-400 text-xs">
                <span className="font-semibold">Total Guests</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                {summary.total_guests || 0}
              </p>
              <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                Avg Party: {summary.average_party_size || 0} guests
              </div>
            </div>

            {/* 5. Average Booking Value */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs space-y-1 transition-colors">
              <div className="flex items-center justify-between text-gray-500 dark:text-zinc-400 text-xs">
                <span className="font-semibold">Avg Ticket (AOV)</span>
                <TrendingUp className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                ${Number(summary.average_booking_value || 0).toFixed(2)}
              </p>
              <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                Per reservation
              </div>
            </div>

            {/* 6. Guest Reviews & Response */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs space-y-1 transition-colors">
              <div className="flex items-center justify-between text-gray-500 dark:text-zinc-400 text-xs">
                <span className="font-semibold">Satisfaction</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                {ratingsBreakdown.average_rating ? Number(ratingsBreakdown.average_rating).toFixed(1) : '5.0'}★
              </p>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                {ratingsBreakdown.response_rate || 0}% Reply Rate
              </div>
            </div>
          </div>

          {/* Section 1: Interactive Charts (Trend Chart & Status Donut) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Time-Series Trend Chart (2 Cols) */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-5 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#003E83] dark:text-[#60a5fa]" />
                    <span>Revenue & Booking Activity Trend</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                    Calculated over {timeframeInfo.label || 'current period'} ({timeframeInfo.interval === 'day' ? 'daily' : 'monthly'} resolution)
                  </p>
                </div>

                {/* Metric toggle */}
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 p-0.5 rounded text-xs">
                  <button
                    type="button"
                    onClick={() => setChartMetric('revenue')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      chartMetric === 'revenue'
                        ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-gray-600 dark:text-zinc-400'
                    }`}
                  >
                    Revenue ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMetric('bookings')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      chartMetric === 'bookings'
                        ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-gray-600 dark:text-zinc-400'
                    }`}
                  >
                    Bookings Count
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMetric('both')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      chartMetric === 'both'
                        ? 'bg-white dark:bg-zinc-900 text-[#003E83] dark:text-[#60a5fa] shadow-xs'
                        : 'text-gray-600 dark:text-zinc-400'
                    }`}
                  >
                    Combined
                  </button>
                </div>
              </div>

              {trends.length > 0 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: '#9CA3AF' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#9CA3AF' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => (chartMetric === 'bookings' ? val : `$${val}`)}
                      />
                      <Tooltip content={<TrendCustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                      {(chartMetric === 'revenue' || chartMetric === 'both') && (
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="Gross Revenue ($)"
                          stroke="#10B981"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                        />
                      )}

                      {(chartMetric === 'bookings' || chartMetric === 'both') && (
                        <Area
                          type="monotone"
                          dataKey="bookings"
                          name="Total Bookings"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorBookings)"
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg">
                  <CalendarCheck className="w-8 h-8 text-gray-300 dark:text-zinc-600 mb-2" />
                  <p className="text-xs font-bold text-gray-700 dark:text-zinc-300">No Historical Records Found</p>
                  <p className="text-[11px] text-gray-400 dark:text-zinc-500 max-w-sm mt-0.5">
                    No reservations logged in this timeframe. Trends will plot here as travelers book visits.
                  </p>
                </div>
              )}
            </div>

            {/* Booking Status Distribution (1 Col) */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-purple-500" />
                    <span>Booking Status Distribution</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400">
                    {summary.total_bookings || 0} Total
                  </span>
                </div>

                {summary.total_bookings > 0 ? (
                  <div className="h-52 w-full relative mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bookingStatusBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={46}
                          outerRadius={72}
                          paddingAngle={3}
                          dataKey="count"
                        >
                          {bookingStatusBreakdown.map((entry, index) => (
                            <Cell key={`status-slice-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieCustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-black text-gray-900 dark:text-white">{summary.total_bookings}</span>
                      <span className="text-[9px] uppercase font-semibold text-gray-400 tracking-wider">Bookings</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-52 flex flex-col items-center justify-center text-center p-4 border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg mt-2">
                    <PieChartIcon className="w-7 h-7 text-gray-300 dark:text-zinc-600 mb-1" />
                    <p className="text-xs font-bold text-gray-700 dark:text-zinc-300">No Booking Data</p>
                  </div>
                )}

                {/* Slices legend */}
                <div className="space-y-1.5 mt-3">
                  {bookingStatusBreakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-700 dark:text-zinc-300 font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-[11px] font-mono">{item.count}</span>
                        <span className="text-gray-900 dark:text-white font-bold w-10 text-right">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-500 dark:text-zinc-400 flex items-center justify-between">
                <span>Completed Bookings:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">{summary.completed_bookings || 0} visits</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Top Performing Services & Ratings Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Performing Services (2 Cols) */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-5 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4 transition-colors">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Top Performing Packages & Services</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                    Revenue and volume generated per offered business package
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#003E83] dark:text-[#60a5fa]">
                  {topServices.length} Active Services
                </span>
              </div>

              {topServices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 font-semibold">
                        <th className="pb-2.5">Service / Package</th>
                        <th className="pb-2.5 text-center">Unit Price</th>
                        <th className="pb-2.5 text-center">Bookings</th>
                        <th className="pb-2.5 text-center">Guests</th>
                        <th className="pb-2.5 text-right">Revenue ($)</th>
                        <th className="pb-2.5 text-right">Share (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {topServices.map((svc, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="py-2.5 font-bold text-gray-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950 text-[#003E83] dark:text-blue-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                                #{i + 1}
                              </span>
                              <span className="truncate max-w-xs">{svc.service_name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 text-center text-gray-600 dark:text-zinc-300">
                            {svc.price ? `$${Number(svc.price).toFixed(2)}` : 'Custom'}
                          </td>
                          <td className="py-2.5 text-center font-bold text-gray-900 dark:text-white">
                            {svc.bookings_count}
                          </td>
                          <td className="py-2.5 text-center text-gray-600 dark:text-zinc-300">
                            {svc.guests_count}
                          </td>
                          <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                            ${Number(svc.revenue).toFixed(2)}
                          </td>
                          <td className="py-2.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 bg-gray-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-[#003E83] dark:bg-[#60a5fa] h-full rounded-full"
                                  style={{ width: `${Math.min(svc.share_percentage || 0, 100)}%` }}
                                />
                              </div>
                              <span className="font-semibold text-gray-700 dark:text-zinc-300 w-10 text-right">
                                {svc.share_percentage}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center space-y-2 border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg">
                  <Building2 className="w-8 h-8 text-gray-300 dark:text-zinc-600 mx-auto" />
                  <p className="text-xs font-bold text-gray-700 dark:text-zinc-300">No Services Booked In This Period</p>
                  <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                    Ensure your business services and promotional packages are available in your Business Manager.
                  </p>
                </div>
              )}
            </div>

            {/* Ratings & Quality (1 Col) */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4 transition-colors">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Ratings & Guest Feedback</span>
                </h3>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {ratingsBreakdown.average_rating ? Number(ratingsBreakdown.average_rating).toFixed(1) : '5.0'} / 5.0
                </span>
              </div>

              {/* Star Rating Breakdown Bars */}
              <div className="space-y-2.5">
                {ratingsBreakdown.stars?.map((s, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-zinc-300 font-medium">{s.label}</span>
                      <span className="text-gray-500 dark:text-zinc-400 font-bold">
                        {s.count} ({s.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${s.percentage || 0}%`, backgroundColor: s.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Response Rate Metric */}
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-md text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-900 dark:text-blue-200">Owner Review Reply Rate</span>
                  <span className="font-bold text-[#003E83] dark:text-[#60a5fa]">{ratingsBreakdown.response_rate || 0}%</span>
                </div>
                <p className="text-[11px] text-blue-700 dark:text-blue-300">
                  {ratingsBreakdown.replied_reviews || 0} of {ratingsBreakdown.total_reviews || 0} reviews replied to. Responding promptly builds trust with tourists.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Customer Retention Insights & Leaderboard */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-500" />
                  <span>Customer Loyalty & Guest Retention</span>
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                  Track repeat travelers, VIP patrons, and guest lifetime value
                </p>
              </div>

              {/* Quick stats pills */}
              <div className="flex items-center gap-3 text-xs">
                <div className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 rounded-md">
                  <span className="text-gray-500 dark:text-zinc-400">Unique Guests: </span>
                  <strong className="text-gray-900 dark:text-white">{customerInsights.total_unique_customers || 0}</strong>
                </div>
                <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-900">
                  <span>Repeat Customers: </span>
                  <strong>{customerInsights.repeat_customers || 0} ({customerInsights.repeat_customer_rate || 0}%)</strong>
                </div>
              </div>
            </div>

            {customerInsights.top_customers?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 font-semibold">
                      <th className="pb-2.5">Customer Name</th>
                      <th className="pb-2.5">Contact Email / Phone</th>
                      <th className="pb-2.5 text-center">Visits / Bookings</th>
                      <th className="pb-2.5 text-center">Last Booking Date</th>
                      <th className="pb-2.5 text-right">Total Spent ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {customerInsights.top_customers.map((c, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="py-2.5 font-bold text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span>{c.customer_name || 'Guest Explorer'}</span>
                            {c.bookings_count > 1 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                Repeat Guest
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 text-gray-600 dark:text-zinc-300">
                          <div>{c.customer_email || '—'}</div>
                          {c.customer_phone && <div className="text-[11px] text-gray-400">{c.customer_phone}</div>}
                        </td>
                        <td className="py-2.5 text-center font-bold text-gray-900 dark:text-white">
                          {c.bookings_count}
                        </td>
                        <td className="py-2.5 text-center text-gray-500 dark:text-zinc-400">
                          {c.last_booking_date ? String(c.last_booking_date).slice(0, 10) : '—'}
                        </td>
                        <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          ${Number(c.total_spent || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-500">
                No customer retention metrics recorded for this timeframe.
              </div>
            )}
          </div>

          {/* Section 4: Payment Status Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <span>Paid Transactions</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                ${Number(paymentBreakdown.paid?.amount || 0).toFixed(2)}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                {paymentBreakdown.paid?.count || 0} settled transactions
              </p>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 text-xs font-semibold">
                <span>Unpaid / On-Site Settlement</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xl font-black text-amber-700 dark:text-amber-300">
                ${Number(paymentBreakdown.unpaid?.amount || 0).toFixed(2)}
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                {paymentBreakdown.unpaid?.count || 0} unpaid or payable upon arrival
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-gray-700 dark:text-zinc-300 text-xs font-semibold">
                <span>Refunded Transactions</span>
                <XCircle className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-xl font-black text-gray-900 dark:text-white">
                ${Number(paymentBreakdown.refunded?.amount || 0).toFixed(2)}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                {paymentBreakdown.refunded?.count || 0} cancelled / refunded transactions
              </p>
            </div>
          </div>
          {/* Section 5: Detailed Reservation Records Dataset (Matching Admin Reports Table) */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs overflow-hidden transition-colors">
            {/* Table Header & Search */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-[#003E83] dark:text-[#60a5fa]" />
                  <span>Reservation Records Dataset</span>
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                  Detailed booking transactions matching selected filters ({filteredRecords.length} records)
                </p>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search customer, ref #, service..."
                    value={tableSearch}
                    onChange={(e) => {
                      setTableSearch(e.target.value);
                      setTablePage(1);
                    }}
                    className="text-xs pl-8 pr-3 py-1.5 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#003E83] outline-hidden w-full sm:w-64"
                  />
                </div>
              </div>
            </div>

            {/* Table Content */}
            {paginatedRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-zinc-800/60 text-gray-500 dark:text-zinc-400 font-semibold border-b border-gray-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Ref #</th>
                      <th className="py-3 px-4">Business</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4 text-center">Guests</th>
                      <th className="py-3 px-4 text-right">Total</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {paginatedRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-[#003E83] dark:text-[#60a5fa]">
                          {r.booking_reference || `#${r.id}`}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {r.business_name || r.business?.name || 'Business'}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-zinc-300">
                          {r.service_name || r.service?.name || 'Direct Reservation'}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-gray-900 dark:text-white">{r.customer_name || 'Guest'}</p>
                          {r.customer_email && (
                            <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{r.customer_email}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-zinc-300">
                          <div className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>{r.booking_date ? String(r.booking_date).slice(0, 10) : '—'}</span>
                          </div>
                          {r.booking_time && (
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span>{String(r.booking_time).slice(0, 5)}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-gray-700 dark:text-zinc-300">
                          {r.total_guests || 1}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">
                          ${Number(r.total_price || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(r.status)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getPaymentBadge(r.payment_status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center space-y-2">
                <CalendarCheck className="w-8 h-8 text-gray-300 dark:text-zinc-600 mx-auto" />
                <p className="text-xs font-bold text-gray-700 dark:text-zinc-300">No Reservation Records Found</p>
                <p className="text-[11px] text-gray-400">
                  {tableSearch ? 'No reservations match your search criteria.' : 'No bookings recorded for this timeframe.'}
                </p>
              </div>
            )}

            {/* Standard Pagination Footer */}
            <SimplePagination
              currentPage={tablePage}
              totalPages={totalPages}
              onPageChange={setTablePage}
              startIndex={tableStartIndex}
              endIndex={Math.min(tableStartIndex + tableItemsPerPage, filteredRecords.length)}
              totalRecords={filteredRecords.length}
              label="records"
              className="print:hidden border-t border-gray-100 dark:border-zinc-800"
            />
          </div>

        </>
      )}
    </div>
  );
}
