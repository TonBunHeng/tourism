import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Download,
  DollarSign,
  CalendarCheck,
  Users,
  TrendingUp,
  Loader2,
  ChevronDown,
  BarChart3,
  PieChart
} from 'lucide-react';
import businessOwnerService from '../../services/businessOwnerService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function BusinessReports() {
  const { selectedBusiness } = useOutletContext();
  const { showSuccess, showError } = useAlert();

  const [timeframe, setTimeframe] = useState('this_month');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const fetchReports = useCallback(() => {
    setIsLoading(true);
    const params = { timeframe };
    if (selectedBusiness?.id) params.business_id = selectedBusiness.id;

    businessOwnerService
      .getReports(params)
      .then((res) => {
        if (res?.success) {
          setReportData(res.data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load business reports:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [timeframe, selectedBusiness]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const params = { timeframe };
      if (selectedBusiness?.id) params.business_id = selectedBusiness.id;
      await businessOwnerService.exportReportsCsv(params);
      showSuccess('CSV report statement downloaded successfully.', 'Export Complete');
    } catch (err) {
      showError(err.message || 'Failed to export report.');
    } finally {
      setIsExporting(false);
    }
  };

  const summary = reportData?.summary || {};
  const topServices = reportData?.top_services || [];
  const rawStatusBreakdown =
    reportData?.booking_status_breakdown ||
    reportData?.status_breakdown ||
    reportData?.bookings_by_status ||
    {};
  const statusBreakdown = Array.isArray(rawStatusBreakdown)
    ? rawStatusBreakdown.reduce((counts, item) => {
        const status = String(item.status || '').toLowerCase();
        if (status) counts[status] = Number(item.count) || 0;
        return counts;
      }, {})
    : rawStatusBreakdown;

  const statsCards = [
    {
      title: 'Gross Revenue',
      value: `$${Number(
        summary.total_gross_revenue || summary.gross_revenue || summary.total_revenue || 0
      ).toLocaleString()}`,
      subtext: 'Completed & confirmed reservations',
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      title: 'Total Bookings',
      value: (summary.total_bookings || 0).toLocaleString(),
      subtext: 'Across selected timeframe',
      icon: CalendarCheck,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      title: 'Guests Served',
      value: (summary.guests_served || summary.total_guests || summary.visitors || 0).toLocaleString(),
      subtext: 'Unique party participants',
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
    },
    {
      title: 'Avg Booking Value',
      value: `$${Number(summary.average_booking_value || summary.avg_value || 0).toFixed(2)}`,
      subtext: 'Revenue per confirmed reservation',
      icon: TrendingUp,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header Section (matching tourism-admin) */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Sales & Performance Reports
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Track gross revenue, confirmed bookings, average ticket values, and download verified statements.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* Timeframe Selector */}
            <div className="relative">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 border border-gray-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs sm:text-sm font-medium shadow-xs focus:outline-none focus:ring-1 focus:ring-[#003E83] cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="this_year">This Year</option>
                <option value="all_time">All Time</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-medium shadow-xs transition-colors cursor-pointer"
            >
              {isExporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16">
          <LoadingSpinner text="Compiling financial report data..." />
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {statsCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-zinc-900 rounded-md p-4 shadow-xs border border-gray-200 dark:border-zinc-800 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium truncate">
                        {stat.title}
                      </p>
                      <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-2 rounded-md shrink-0 ${stat.bg}`}>
                      <Icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">
                      {stat.subtext}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Breakdown & Popular Services Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Booking Status Breakdown */}
            <div className="bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 shadow-xs p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-zinc-800">
                <PieChart size={16} className="text-[#003E83] dark:text-blue-400" />
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  Reservation Status Breakdown
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Confirmed', count: statusBreakdown.confirmed || 0, color: 'bg-emerald-500' },
                  { label: 'Completed', count: statusBreakdown.completed || 0, color: 'bg-blue-500' },
                  { label: 'Pending Action', count: statusBreakdown.pending || 0, color: 'bg-amber-500' },
                  { label: 'Cancelled', count: statusBreakdown.cancelled || 0, color: 'bg-rose-500' },
                  { label: 'Rejected', count: statusBreakdown.rejected || 0, color: 'bg-red-500' },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700 dark:text-zinc-300">{item.label}</span>
                      <span className="font-bold text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{
                          width: `${Math.min(
                            100,
                            summary.total_bookings ? (item.count / summary.total_bookings) * 100 : 0
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Services */}
            <div className="bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 shadow-xs p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-zinc-800">
                <BarChart3 size={16} className="text-[#003E83] dark:text-blue-400" />
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  Top Services & Revenue Share
                </h3>
              </div>

              {topServices.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 dark:text-zinc-500">
                  No service breakdown available for this timeframe.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {topServices.map((svc, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-3">
                        <div className="font-semibold text-gray-900 dark:text-white truncate">
                          {svc.name || svc.service_name || `Service #${idx + 1}`}
                        </div>
                        <div className="text-[11px] text-gray-400 dark:text-zinc-500">
                          {svc.bookings_count || svc.bookings || 0} reservations
                        </div>
                      </div>
                      <div className="text-right font-bold text-gray-900 dark:text-white">
                        ${Number(svc.revenue || 0).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
