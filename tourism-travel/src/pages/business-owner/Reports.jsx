import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Download, 
  DollarSign, 
  CalendarCheck, 
  Users, 
  TrendingUp, 
  Loader2
} from 'lucide-react';
import businessOwnerService from '../../services/businessOwnerService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function BusinessReports() {
  const { selectedBusiness } = useOutletContext();
  const { showSuccess, showError } = useAlert();

  const [timeframe, setTimeframe] = useState('this_month'); // 'today', 'this_week', 'this_month', 'this_year', 'all_time'
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const fetchReports = useCallback(() => {
    setIsLoading(true);
    const params = { timeframe };
    if (selectedBusiness?.id) params.business_id = selectedBusiness.id;

    businessOwnerService.getReports(params)
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
      showSuccess('CSV report downloaded successfully.', 'Export Complete');
    } catch (err) {
      showError(err.message || 'Failed to export report.');
    } finally {
      setIsExporting(false);
    }
  };

  const summary = reportData?.summary || {};
  const topServices = reportData?.top_services || [];
  const statusBreakdown = reportData?.status_breakdown || reportData?.bookings_by_status || {};

  return (
    <div className="space-y-8">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">
            Financial & Operations Audit
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Sales & Performance Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Track gross revenue, confirmed bookings, average ticket values, and download CSV statements.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-slate-800 dark:text-white"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
            <option value="all_time">All Time</option>
          </select>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Compiling financial report data..." />
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-500" />
                <span>Gross Revenue</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                ${Number(summary.total_gross_revenue || summary.gross_revenue || summary.total_revenue || 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Completed & confirmed totals
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
                <CalendarCheck size={14} className="text-[#002D62] dark:text-blue-400" />
                <span>Total Bookings</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {summary.total_bookings || 0}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Across selected timeframe
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
                <Users size={14} className="text-purple-500" />
                <span>Guests Served</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {summary.guests_served || summary.total_guests || summary.visitors || 0}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Unique party participants
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-amber-500" />
                <span>Avg Booking Value</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                ${Number(summary.average_booking_value || summary.avg_value || 0).toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Revenue per confirmed reservation
              </div>
            </div>
          </div>

          {/* Breakdown & Popular Services */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Booking Status Breakdown */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Reservation Status Breakdown
              </h3>

              <div className="space-y-3 pt-2">
                {[
                  { label: 'Confirmed', count: statusBreakdown.confirmed || 0, color: 'bg-emerald-500' },
                  { label: 'Completed', count: statusBreakdown.completed || 0, color: 'bg-blue-500' },
                  { label: 'Pending Action', count: statusBreakdown.pending || 0, color: 'bg-amber-500' },
                  { label: 'Cancelled', count: statusBreakdown.cancelled || 0, color: 'bg-rose-500' },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-zinc-300">{item.label}</span>
                      <span className="font-black text-slate-900 dark:text-white">{item.count}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{
                          width: `${Math.min(100, summary.total_bookings ? (item.count / summary.total_bookings) * 100 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Services */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Top Services & Revenue Share
              </h3>

              {topServices.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No service breakdown available for this timeframe.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {topServices.map((svc, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-3">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {svc.name || svc.service_name || `Service #${idx + 1}`}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {svc.bookings_count || svc.bookings || 0} reservations
                        </div>
                      </div>
                      <div className="text-right font-black text-slate-900 dark:text-white">
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
