import { useState, useMemo } from 'react';
import {
  Calendar,
  Activity
} from 'lucide-react';

/**
 * Calculates human-friendly integer tick intervals for Y-axis
 */
function getNiceYAxis(maxValue, isCurrency = false) {
  if (maxValue <= 0) {
    return isCurrency
      ? { max: 100, ticks: [0, 25, 50, 75, 100] }
      : { max: 4, ticks: [0, 1, 2, 3, 4] };
  }
  if (!isCurrency && maxValue <= 2) {
    return { max: 4, ticks: [0, 1, 2, 3, 4] };
  }
  if (!isCurrency && maxValue <= 4) {
    return { max: 6, ticks: [0, 2, 4, 6] };
  }

  const targetSteps = 4;
  const rawStep = maxValue / targetSteps;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;
  let niceStep = 1;
  if (normalized > 1) niceStep = 2;
  if (normalized > 2) niceStep = 2.5;
  if (normalized > 2.5) niceStep = 5;
  if (normalized > 5) niceStep = 10;

  let step = niceStep * magnitude;
  if (!isCurrency && step < 1) step = 1;
  const max = Math.ceil(maxValue / step) * step;
  const ticks = [];
  for (let val = 0; val <= max + 0.0001; val += step) {
    ticks.push(Math.round(val * 100) / 100);
  }
  return { max, step, ticks };
}

/**
 * Generates an SVG path for a donut slice arc
 */
function describeArc(cx, cy, innerR, outerR, startAngle, endAngle) {
  const toRad = Math.PI / 180;
  const startRad = (startAngle - 90) * toRad;
  const endRad = (endAngle - 90) * toRad;

  const x1 = cx + outerR * Math.cos(startRad);
  const y1 = cy + outerR * Math.sin(startRad);
  const x2 = cx + outerR * Math.cos(endRad);
  const y2 = cy + outerR * Math.sin(endRad);

  const x3 = cx + innerR * Math.cos(endRad);
  const y3 = cy + innerR * Math.sin(endRad);
  const x4 = cx + innerR * Math.cos(startRad);
  const y4 = cy + innerR * Math.sin(startRad);

  const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
  return [
    'M', x1.toFixed(1), y1.toFixed(1),
    'A', outerR, outerR, 0, largeArc, 1, x2.toFixed(1), y2.toFixed(1),
    'L', x3.toFixed(1), y3.toFixed(1),
    'A', innerR, innerR, 0, largeArc, 0, x4.toFixed(1), y4.toFixed(1),
    'Z'
  ].join(' ');
}

export default function SalesAnalyticsChart({
  trends = [],
  timeframe = 'this_month',
  summary = {},
  topServices = [],
  statusBreakdown = {},
  ratingsBreakdown = {},
  selectedBusiness = null,
  businesses = [],
  onSelectBusiness = null,
}) {
  const [reportsChartTab, setReportsChartTab] = useState('dataset'); // 'dataset' | 'health'
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const [hoveredSliceIndex, setHoveredSliceIndex] = useState(null);

  // Timeframe display label
  const timeframeLabel = useMemo(() => {
    switch (timeframe) {
      case 'today':
        return 'Day';
      case 'this_week':
        return 'Week';
      case 'this_month':
        return 'Month';
      case 'this_year':
        return 'Year';
      case 'all_time':
        return 'All Time';
      default:
        return 'Period';
    }
  }, [timeframe]);

  // Velocity Chart Subtitle matching Admin
  const velocitySubtitle = useMemo(() => {
    switch (timeframe) {
      case 'today':
        return 'Hourly distribution of active/published vs pending records';
      case 'this_week':
        return 'Daily distribution of active/published vs pending records';
      case 'this_month':
        return 'Weekly distribution of active/published vs pending records';
      case 'this_year':
      case 'all_time':
      default:
        return 'Monthly distribution of active/published vs pending records';
    }
  }, [timeframe]);

  // Aggregate monthly/daily trends cleanly (Weeks for Month, Months for Year, Days for Week)
  const monthlyData = useMemo(() => {
    if (!Array.isArray(trends) || trends.length === 0) {
      if (timeframe === 'this_month') {
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w, idx) => ({
          index: idx,
          month: w,
          active: 0,
          other: 0,
          recordsIngested: 0,
          revenue: 0,
          cumulative: 0,
        }));
      }
      const defaultMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return defaultMonths.map((m, idx) => ({
        index: idx,
        month: m,
        active: 0,
        other: 0,
        recordsIngested: 0,
        revenue: 0,
        cumulative: 0,
      }));
    }

    // When timeframe is 'this_month', aggregate 30 days into 4 clean weeks matching Admin
    if (timeframe === 'this_month') {
      const weeks = [
        { month: 'Week 1', active: 0, other: 0, recordsIngested: 0, revenue: 0 },
        { month: 'Week 2', active: 0, other: 0, recordsIngested: 0, revenue: 0 },
        { month: 'Week 3', active: 0, other: 0, recordsIngested: 0, revenue: 0 },
        { month: 'Week 4', active: 0, other: 0, recordsIngested: 0, revenue: 0 },
      ];

      trends.forEach((t, i) => {
        const totalBookings = Number(t.bookings || 0);
        const activeCount = Number(
          t.active !== undefined
            ? t.active
            : (t.confirmed || 0) + (t.completed || 0)
        );
        const pendingCount = Number(
          t.pending !== undefined
            ? t.pending
            : Math.max(0, totalBookings - activeCount)
        );
        const grossRev = Number(t.revenue || 0);

        let dayNum = i + 1;
        if (t.date) {
          const parsed = new Date(t.date);
          if (!isNaN(parsed.getTime())) dayNum = parsed.getDate();
        }
        const wIdx = Math.min(3, Math.max(0, Math.floor((dayNum - 1) / 7)));
        weeks[wIdx].active += activeCount;
        weeks[wIdx].other += pendingCount;
        weeks[wIdx].recordsIngested += totalBookings;
        weeks[wIdx].revenue += grossRev;
      });

      let cum = 0;
      return weeks.map((w, idx) => {
        cum += w.recordsIngested;
        return {
          index: idx,
          ...w,
          cumulative: cum,
        };
      });
    }

    // Default: map incoming trend items (e.g. 12 months for Year or 7 days for Week)
    let runningCum = 0;
    return trends.map((t, idx) => {
      const totalBookings = Number(t.bookings || 0);
      const activeCount = Number(
        t.active !== undefined
          ? t.active
          : (t.confirmed || 0) + (t.completed || 0)
      );
      const pendingCount = Number(
        t.pending !== undefined
          ? t.pending
          : Math.max(0, totalBookings - activeCount)
      );
      const grossRev = Number(t.revenue || 0);
      runningCum += totalBookings;

      return {
        index: idx,
        month: t.label || t.date || `P${idx + 1}`,
        active: activeCount,
        other: pendingCount,
        recordsIngested: totalBookings,
        revenue: Math.round(grossRev),
        cumulative: runningCum,
      };
    });
  }, [trends, timeframe]);

  // Statistics, Peak Month/Period, & Y-Axis Scale
  const { stats, barYAxis, peakPeriod } = useMemo(() => {
    const totalRecords = Number(summary.total_bookings || monthlyData.reduce((acc, d) => acc + d.recordsIngested, 0));
    const grossRevenue = Number(summary.total_revenue || summary.total_gross_revenue || monthlyData.reduce((acc, d) => acc + d.revenue, 0));
    const avgBookingVal = Number(summary.average_booking_value || (totalRecords > 0 ? grossRevenue / totalRecords : 0));

    // Peak Ingestion Period
    const sorted = [...monthlyData].sort((a, b) => b.recordsIngested - a.recordsIngested);
    const peak = sorted[0] && sorted[0].recordsIngested > 0 ? { name: sorted[0].month, count: sorted[0].recordsIngested } : { name: monthlyData[0]?.month || 'N/A', count: 0 };

    const maxBarCount = Math.max(0, ...monthlyData.map((d) => d.recordsIngested));
    const barAxis = getNiceYAxis(maxBarCount, false);

    return {
      stats: {
        totalRecords,
        grossRevenue,
        avgBookingVal,
      },
      barYAxis: barAxis,
      peakPeriod: peak,
    };
  }, [monthlyData, summary]);

  // Dataset Mix Breakdown for Business
  const compositionData = useMemo(() => {
    const fillColors = ['#003E83', '#f43f5e', '#10b981', '#f59e0b', '#a855f7'];

    const placesServices = Math.max(0, Number(topServices?.length || selectedBusiness?.services_count || 1));
    const bookings = Math.max(0, Number(summary?.total_bookings || 0));
    const reviews = Math.max(0, Number(ratingsBreakdown?.total_reviews || selectedBusiness?.reviews_count || 0));
    const guests = Math.max(0, Number(summary?.total_guests || summary?.guests_served || 0));
    const categories = selectedBusiness?.category ? 1 : Math.max(1, businesses.length);

    const raw = [
      { name: 'Places & Services', count: placesServices, fillColor: fillColors[0] },
      { name: 'Bookings & Orders', count: bookings, fillColor: fillColors[1] },
      { name: 'Guests & Accounts', count: guests, fillColor: fillColors[2] },
      { name: 'Ratings & Reviews', count: reviews, fillColor: fillColors[3] },
      { name: 'Categories & Tags', count: categories, fillColor: fillColors[4] },
    ];

    const total = raw.reduce((sum, item) => sum + item.count, 0) || 1;
    return raw.map((item) => ({
      ...item,
      percentage: Math.round((item.count / total) * 100),
    }));
  }, [topServices, selectedBusiness, summary, ratingsBreakdown, businesses]);

  // Operational Health Status Breakdown
  const statusBreakdownData = useMemo(() => {
    const active = Number(statusBreakdown?.confirmed || 0);
    const completed = Number(statusBreakdown?.completed || 0);
    const pending = Number(statusBreakdown?.pending || 0);
    const cancelled = Number(statusBreakdown?.cancelled || 0) + Number(statusBreakdown?.rejected || 0);

    const total = active + completed + pending + cancelled || 1;
    return [
      { name: 'Active / Published', count: active, percentage: Math.round((active / total) * 100), color: '#10b981' },
      { name: 'Completed / Fulfilled', count: completed, percentage: Math.round((completed / total) * 100), color: '#003E83' },
      { name: 'Pending / Review', count: pending, percentage: Math.round((pending / total) * 100), color: '#f59e0b' },
      { name: 'Cancelled / Archived', count: cancelled, percentage: Math.round((cancelled / total) * 100), color: '#f43f5e' },
    ];
  }, [statusBreakdown]);

  // Donut Operational Percentage
  const activePct = useMemo(() => {
    const activeAndComp = Number(statusBreakdown?.confirmed || 0) + Number(statusBreakdown?.completed || 0);
    const total = Number(summary?.total_bookings || 0);
    if (total === 0) return 100;
    return Math.round((activeAndComp / total) * 100);
  }, [statusBreakdown, summary]);

  // Total Donut Dataset Records
  const globalTotalRecords = useMemo(() => {
    return compositionData.reduce((acc, curr) => acc + curr.count, 0);
  }, [compositionData]);

  // Donut Slices Geometry Generator
  const donutSlices = useMemo(() => {
    const items = reportsChartTab === 'dataset'
      ? compositionData.map((d) => ({ name: d.name, count: d.count, percentage: d.percentage, color: d.fillColor }))
      : statusBreakdownData.map((s) => ({ name: s.name, count: s.count, percentage: s.percentage, color: s.color }));

    const total = items.reduce((sum, d) => sum + d.count, 0) || 1;
    const cx = 125;
    const cy = 125;
    const innerR = 65;
    const outerR = 100;
    const paddingAngle = items.filter((d) => d.count > 0).length > 1 ? 3 : 0;
    let currentAngle = 0;

    return items.map((item, idx) => {
      if (item.count <= 0) return null;
      const fraction = item.count / total;
      const angleSpan = fraction * 360;

      // Handle full circle
      if (fraction >= 0.999) {
        const fullPath = `M ${cx} ${cy - outerR} A ${outerR} ${outerR} 0 1 0 ${cx} ${cy + outerR} A ${outerR} ${outerR} 0 1 0 ${cx} ${cy - outerR} M ${cx} ${cy - innerR} A ${innerR} ${innerR} 0 1 1 ${cx} ${cy + innerR} A ${innerR} ${innerR} 0 1 1 ${cx} ${cy - innerR} Z`;
        return { ...item, index: idx, path: fullPath, fraction };
      }

      const startAngle = currentAngle + (angleSpan > paddingAngle ? paddingAngle / 2 : 0);
      const endAngle = currentAngle + angleSpan - (angleSpan > paddingAngle ? paddingAngle / 2 : 0);
      currentAngle += angleSpan;

      const path = describeArc(cx, cy, innerR, outerR, startAngle, endAngle);
      return { ...item, index: idx, path, fraction, startAngle, endAngle };
    }).filter(Boolean);
  }, [reportsChartTab, compositionData, statusBreakdownData]);

  // SVG Geometry Dimensions for Column Chart
  const svgWidth = 560;
  const svgHeight = 220;
  const padLeft = 42;
  const padRight = 16;
  const padTop = 18;
  const padBottom = 30;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;
  const baseY = padTop + plotH;

  const barCount = monthlyData.length;
  const slotW = barCount > 0 ? plotW / barCount : plotW;
  const barW = Math.max(12, Math.min(24, slotW * 0.65));

  // Y coordinate calculation
  const getColY = (val, maxVal) => {
    const safeMax = maxVal > 0 ? maxVal : 1;
    const clamped = Math.min(safeMax, Math.max(0, val));
    return padTop + plotH - (clamped / safeMax) * plotH;
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Balanced Side-by-Side Analytics Charts Grid (Matching Reports Analytics of Admin) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ========================================================================= */}
        {/* CHART 1: Record Ingestion Velocity (Identical to Admin ReportsAnalytics)  */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-zinc-900 rounded-sm shadow-xs border border-gray-200 dark:border-zinc-800 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            {/* Header: Title + Volume Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div>
                <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
                  <span>Record Ingestion Velocity ({timeframeLabel})</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                  {velocitySubtitle}
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-sm border border-blue-100 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 text-[#003E83] dark:text-blue-400 shrink-0 self-start sm:self-center">
                Total: {stats.totalRecords.toLocaleString()} Records
              </span>
            </div>

            {/* Clean Non-Wrapped Legend Under Title */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap mb-3 text-xs text-gray-600 dark:text-zinc-300">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" />
                <span>Active / Published</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#003E83]" />
                <span>Pending / Review</span>
              </span>
            </div>

            {/* SVG Stacked Column Chart */}
            <div className="h-[250px] w-full relative select-none">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                {/* Horizontal Grid Lines */}
                {barYAxis.ticks.map((val, i) => {
                  const y = getColY(val, barYAxis.max);
                  return (
                    <g key={`bary-${i}`}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={svgWidth - padRight}
                        y2={y}
                        stroke="currentColor"
                        strokeDasharray={val === 0 ? 'none' : '3 3'}
                        className={val === 0 ? 'text-gray-300 dark:text-zinc-700' : 'text-gray-200 dark:text-zinc-800'}
                        strokeWidth="1"
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 3.5}
                        textAnchor="end"
                        className="text-[10px] fill-gray-400 dark:fill-zinc-500 font-medium"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Stacked Columns */}
                {monthlyData.map((d, i) => {
                  const colCenter = padLeft + (i + 0.5) * slotW;
                  const barX = colCenter - barW / 2;
                  const isHovered = hoveredBarIndex === i;

                  const activeH = (d.active / barYAxis.max) * plotH;
                  const otherH = (d.other / barYAxis.max) * plotH;
                  const totalH = activeH + otherH;

                  const activeY = baseY - activeH;
                  const otherY = baseY - totalH;

                  return (
                    <g
                      key={`col-${i}`}
                      className="cursor-pointer transition-opacity duration-150"
                      onMouseEnter={() => setHoveredBarIndex(i)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {/* Hover area */}
                      <rect
                        x={colCenter - slotW / 2}
                        y={padTop}
                        width={slotW}
                        height={plotH}
                        fill="transparent"
                      />

                      {/* Active/Published Green Base Bar */}
                      {d.active > 0 && (
                        <rect
                          x={barX}
                          y={activeY}
                          width={barW}
                          height={Math.max(3, activeH)}
                          fill="#10b981"
                          rx={d.other === 0 ? 3 : 0}
                          opacity={hoveredBarIndex !== null && !isHovered ? 0.35 : 1}
                        />
                      )}

                      {/* Pending/Review Navy Stacked Bar on Top */}
                      {d.other > 0 && (
                        <rect
                          x={barX}
                          y={otherY}
                          width={barW}
                          height={Math.max(3, otherH)}
                          fill="#003E83"
                          rx={3}
                          className="dark:fill-blue-500"
                          opacity={hoveredBarIndex !== null && !isHovered ? 0.35 : 1}
                        />
                      )}

                      {/* Column X-Axis Label */}
                      <text
                        x={colCenter}
                        y={svgHeight - 10}
                        textAnchor="middle"
                        className={`text-[11px] transition-colors ${
                          isHovered
                            ? 'fill-[#003E83] dark:fill-blue-400 font-bold'
                            : 'fill-gray-400 dark:fill-zinc-500 font-medium'
                        }`}
                      >
                        {d.month}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip Card for Column Bar */}
              {hoveredBarIndex !== null && monthlyData[hoveredBarIndex] && (
                <div
                  className="absolute z-20 pointer-events-none bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 p-2.5 rounded-sm shadow-md text-xs space-y-1.5 min-w-[170px]"
                  style={{
                    left: `${Math.min(75, Math.max(10, (hoveredBarIndex / barCount) * 100))}%`,
                    top: '15px',
                  }}
                >
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-1">
                    <p className="font-bold text-gray-900 dark:text-zinc-100">
                      {monthlyData[hoveredBarIndex].month}
                    </p>
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400">
                      {monthlyData[hoveredBarIndex].recordsIngested} {monthlyData[hoveredBarIndex].recordsIngested === 1 ? 'record' : 'records'}
                    </span>
                  </div>
                  <div className="space-y-1 text-gray-600 dark:text-zinc-300">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-sm bg-[#10b981]" />
                        <span>Active:</span>
                      </span>
                      <span className="font-bold text-[#10b981]">
                        {monthlyData[hoveredBarIndex].active}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-sm bg-[#003E83]" />
                        <span>Pending / Other:</span>
                      </span>
                      <span className="font-bold text-[#003E83] dark:text-blue-400">
                        {monthlyData[hoveredBarIndex].other}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Symmetrical 3-Card Metrics Footer */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-zinc-800 grid grid-cols-3 gap-2 text-center">
            <div className="p-1.5 sm:p-2 rounded-sm bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800">
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{timeframeLabel}</p>
              <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-zinc-400 truncate">Timeframe</p>
            </div>
            <div className="p-1.5 sm:p-2 rounded-sm bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800">
              <p className="text-xs sm:text-sm font-bold text-[#003E83] dark:text-blue-400">
                {stats.totalRecords.toLocaleString()}
              </p>
              <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-zinc-400 truncate">Total Ingested</p>
            </div>
            <div className="p-1.5 sm:p-2 rounded-sm bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <p className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 truncate">
                {peakPeriod.name} ({peakPeriod.count})
              </p>
              <p className="text-[10px] sm:text-[11px] text-emerald-700/80 dark:text-emerald-400/80 truncate">
                Peak Ingestion
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CHART 2: System Health & Dataset Hub (Identical to Admin ReportsAnalytics)*/}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-zinc-900 rounded-sm shadow-xs border border-gray-200 dark:border-zinc-800 p-4 sm:p-5 flex flex-col justify-between h-full">
          <div>
            {/* Header: Title + Switch Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div>
                <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>System Health & Dataset Hub</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                  Entity operational status and cross-dataset distribution
                </p>
              </div>

              {/* Tab Switcher Pills (Dataset Mix vs Health Status) */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800/80 p-0.5 rounded-sm border border-gray-200/50 dark:border-zinc-700/50 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setReportsChartTab('dataset')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
                    reportsChartTab === 'dataset'
                      ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Dataset Mix
                </button>
                <button
                  type="button"
                  onClick={() => setReportsChartTab('health')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
                    reportsChartTab === 'health'
                      ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Health Status
                </button>
              </div>
            </div>

            {/* Donut Chart Canvas Container */}
            <div className="relative h-[250px] w-full flex items-center justify-center my-1">
              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                <span className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                  {reportsChartTab === 'dataset' ? globalTotalRecords.toLocaleString() : `${activePct}%`}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
                  {reportsChartTab === 'dataset' ? 'Total Records' : 'Operational'}
                </span>
              </div>

              <svg viewBox="0 0 250 250" className="w-[240px] h-[240px] relative z-10 overflow-visible select-none">
                {donutSlices.map((slice, idx) => {
                  const isHovered = hoveredSliceIndex === idx;
                  return (
                    <path
                      key={`slice-${idx}`}
                      d={slice.path}
                      fill={slice.color}
                      className="cursor-pointer transition-all duration-200"
                      transform={isHovered ? 'scale(1.03) translate(-3.75, -3.75)' : 'scale(1)'}
                      opacity={hoveredSliceIndex !== null && !isHovered ? 0.45 : 1}
                      onMouseEnter={() => setHoveredSliceIndex(idx)}
                      onMouseLeave={() => setHoveredSliceIndex(null)}
                    />
                  );
                })}
              </svg>

              {/* Floating Tooltip for Donut Slice */}
              {hoveredSliceIndex !== null && donutSlices[hoveredSliceIndex] && (
                <div className="absolute top-2 right-2 z-20 pointer-events-none bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 p-2.5 rounded-sm shadow-md text-xs space-y-1">
                  <p className="font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: donutSlices[hoveredSliceIndex].color }}
                    />
                    {donutSlices[hoveredSliceIndex].name}
                  </p>
                  <div className="flex items-center gap-3 pt-1 border-t border-gray-100 dark:border-zinc-800">
                    <span className="text-gray-900 dark:text-zinc-100 font-bold">
                      {donutSlices[hoveredSliceIndex].count.toLocaleString()} {donutSlices[hoveredSliceIndex].count === 1 ? 'record' : 'records'}
                    </span>
                    <span className="text-[#003E83] dark:text-blue-400 font-semibold">
                      ({donutSlices[hoveredSliceIndex].percentage}%)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Legend / Breakdown Grid (Modeled identically to CategoryDistribution of Admin) */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
              {reportsChartTab === 'dataset' ? (
                <>
                  {compositionData.slice(0, 6).map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 pr-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.fillColor }}
                        />
                        <span className="text-gray-700 dark:text-zinc-300 font-medium truncate text-[11px]">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-gray-500 dark:text-zinc-400 text-[10px] font-semibold shrink-0">
                        {item.percentage}% <span className="font-normal text-gray-400">({item.count})</span>
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {statusBreakdownData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 pr-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-gray-700 dark:text-zinc-300 font-medium truncate text-[11px]">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-gray-500 dark:text-zinc-400 text-[10px] font-semibold shrink-0">
                        {item.percentage}% <span className="font-normal text-gray-400">({item.count})</span>
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-xs min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 pr-1">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-purple-500" />
                      <span className="text-gray-700 dark:text-zinc-300 font-medium truncate text-[11px]">
                        Total Entities
                      </span>
                    </div>
                    <span className="text-purple-600 dark:text-purple-400 text-[10px] font-semibold shrink-0">
                      {globalTotalRecords.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
