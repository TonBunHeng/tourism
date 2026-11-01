import XLSX from 'xlsx-js-style';

/**
 * Enterprise Palette & Typography Constants
 */
const COLORS = {
  NAVY_PRIMARY: '003E83',
  NAVY_DARK: '0B2545',
  ICE_BLUE: 'EBF4FF',
  ZEBRA_BG: 'F8FAFC',
  WHITE: 'FFFFFF',
  BORDER_GRAY: 'E2E8F0',
  BORDER_DARK: 'CBD5E1',
  TEXT_MAIN: '0F172A',
  TEXT_MUTED: '475569',
  SUCCESS_GREEN: '059669',
  SUCCESS_BG: 'ECFDF5',
  AMBER_TEXT: 'D97706',
  AMBER_BG: 'FFFBEB',
  ROSE_TEXT: 'E11D48',
  ROSE_BG: 'FFF1F2',
  TOTAL_BG: 'F1F5F9',
};

const BORDER_THIN = {
  top: { style: 'thin', color: { rgb: COLORS.BORDER_GRAY } },
  bottom: { style: 'thin', color: { rgb: COLORS.BORDER_GRAY } },
  left: { style: 'thin', color: { rgb: COLORS.BORDER_GRAY } },
  right: { style: 'thin', color: { rgb: COLORS.BORDER_GRAY } },
};

const BORDER_TOTAL = {
  top: { style: 'thin', color: { rgb: COLORS.BORDER_DARK } },
  bottom: { style: 'double', color: { rgb: COLORS.NAVY_PRIMARY } },
  left: { style: 'thin', color: { rgb: COLORS.BORDER_GRAY } },
  right: { style: 'thin', color: { rgb: COLORS.BORDER_GRAY } },
};

/**
 * Format timeframe key to human-readable string
 */
const formatTimeframe = (tf) => {
  switch (tf) {
    case 'today':
      return 'Today';
    case 'this_week':
      return 'This Week';
    case 'this_month':
      return 'This Month';
    case 'this_year':
      return 'This Year';
    case 'all_time':
      return 'All Time';
    default:
      return String(tf || 'Custom Period').replace('_', ' ').toUpperCase();
  }
};

/**
 * Formatted date string
 */
const formatTimestamp = () => {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Helper to build an Excel coordinate string like "A1"
 */
const getCellAddress = (colIdx, rowIdx) => {
  let colLetter = '';
  let temp = colIdx;
  while (temp >= 0) {
    colLetter = String.fromCharCode((temp % 26) + 65) + colLetter;
    temp = Math.floor(temp / 26) - 1;
  }
  return `${colLetter}${rowIdx + 1}`;
};

/**
 * Add an executive top title banner to a worksheet
 */
const addExecutiveBanner = (ws, title, subtitle, maxCols, merges, rows) => {
  // Row 1: Primary Title Banner
  for (let c = 0; c < maxCols; c++) {
    const addr = getCellAddress(c, 0);
    ws[addr] = {
      v: c === 0 ? title : '',
      t: 's',
      s: {
        font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: COLORS.WHITE } },
        fill: { fgColor: { rgb: COLORS.NAVY_PRIMARY } },
        alignment: { horizontal: 'center', vertical: 'center' },
      },
    };
  }
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: maxCols - 1 } });
  rows[0] = { hpt: 28 };

  // Row 2: Subtitle Banner
  for (let c = 0; c < maxCols; c++) {
    const addr = getCellAddress(c, 1);
    ws[addr] = {
      v: c === 0 ? subtitle : '',
      t: 's',
      s: {
        font: { name: 'Calibri', sz: 9.5, italic: true, color: { rgb: COLORS.WHITE } },
        fill: { fgColor: { rgb: COLORS.NAVY_DARK } },
        alignment: { horizontal: 'center', vertical: 'center' },
      },
    };
  }
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: maxCols - 1 } });
  rows[1] = { hpt: 18 };

  // Row 3: Blank separator
  for (let c = 0; c < maxCols; c++) {
    ws[getCellAddress(c, 2)] = { v: '', t: 's' };
  }
  rows[2] = { hpt: 10 };
};

/**
 * Export Business Sales & Performance Report to Excel (.xlsx)
 * Generates an executive, beautifully styled workbook with 5 dedicated sheets.
 */
export function exportBusinessReportToExcel({ reportData, businessName = 'AngkorVerses Business', timeframe = 'this_month' }) {
  try {
    const summary = reportData?.summary || {};
    const trends = Array.isArray(reportData?.trends) ? reportData.trends : [];
    const topServices = Array.isArray(reportData?.top_services) ? reportData.top_services : [];
    const recentBookings = Array.isArray(reportData?.recent_bookings) ? reportData.recent_bookings : [];
    const ratings = reportData?.ratings_breakdown || {};

    const rawStatus = reportData?.booking_status_breakdown || reportData?.status_breakdown || [];
    const statusList = Array.isArray(rawStatus)
      ? rawStatus
      : Object.entries(rawStatus).map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          count: Number(count) || 0,
        }));

    const workbook = XLSX.utils.book_new();

    // =========================================================================
    // SHEET 1: Summary KPIs & Performance Statement
    // =========================================================================
    const wsOverview = {};
    const overviewMerges = [];
    const overviewRows = [];
    const maxCols1 = 2;

    addExecutiveBanner(
      wsOverview,
      'ANGKORVERSES • EXECUTIVE FINANCIAL STATEMENT',
      `Audit Statement for ${businessName} • Period: ${formatTimeframe(timeframe)}`,
      maxCols1,
      overviewMerges,
      overviewRows
    );

    let currentRow = 3;

    // Helper to write a clean section banner
    const writeSectionBanner = (sectionTitle) => {
      for (let c = 0; c < maxCols1; c++) {
        wsOverview[getCellAddress(c, currentRow)] = {
          v: c === 0 ? sectionTitle : '',
          t: 's',
          s: {
            font: { name: 'Calibri', sz: 10.5, bold: true, color: { rgb: COLORS.NAVY_PRIMARY } },
            fill: { fgColor: { rgb: COLORS.ICE_BLUE } },
            alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
            border: {
              top: { style: 'thin', color: { rgb: 'BFDBFE' } },
              bottom: { style: 'thin', color: { rgb: 'BFDBFE' } },
            },
          },
        };
      }
      overviewMerges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: maxCols1 - 1 } });
      overviewRows[currentRow] = { hpt: 22 };
      currentRow++;
    };

    // Helper to write key-value metrics
    const writeMetricRow = (label, val, type = 'text', isZebra = false) => {
      const bgColor = isZebra ? COLORS.ZEBRA_BG : COLORS.WHITE;

      // Column A: Label
      wsOverview[getCellAddress(0, currentRow)] = {
        v: label,
        t: 's',
        s: {
          font: { name: 'Calibri', sz: 10, bold: false, color: { rgb: COLORS.TEXT_MUTED } },
          fill: { fgColor: { rgb: bgColor } },
          alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
          border: BORDER_THIN,
        },
      };

      // Column B: Value
      let cellObj = {
        v: val,
        t: 's',
        s: {
          font: { name: 'Calibri', sz: 10.5, bold: true, color: { rgb: COLORS.TEXT_MAIN } },
          fill: { fgColor: { rgb: bgColor } },
          alignment: { horizontal: 'left', vertical: 'center' },
          border: BORDER_THIN,
        },
      };

      if (type === 'currency') {
        cellObj = {
          v: Number(val || 0),
          t: 'n',
          z: '$#,##0.00',
          s: {
            font: { name: 'Calibri', sz: 10.5, bold: true, color: { rgb: COLORS.SUCCESS_GREEN } },
            fill: { fgColor: { rgb: bgColor } },
            alignment: { horizontal: 'right', vertical: 'center' },
            border: BORDER_THIN,
          },
        };
      } else if (type === 'number') {
        cellObj = {
          v: Number(val || 0),
          t: 'n',
          z: '#,##0',
          s: {
            font: { name: 'Calibri', sz: 10.5, bold: true, color: { rgb: COLORS.NAVY_PRIMARY } },
            fill: { fgColor: { rgb: bgColor } },
            alignment: { horizontal: 'right', vertical: 'center' },
            border: BORDER_THIN,
          },
        };
      } else if (type === 'percentage') {
        cellObj = {
          v: `${Number(val || 0).toFixed(1)}%`,
          t: 's',
          s: {
            font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: COLORS.TEXT_MAIN } },
            fill: { fgColor: { rgb: bgColor } },
            alignment: { horizontal: 'right', vertical: 'center' },
            border: BORDER_THIN,
          },
        };
      }

      wsOverview[getCellAddress(1, currentRow)] = cellObj;
      overviewRows[currentRow] = { hpt: 20 };
      currentRow++;
    };

    // 1. Establishment Profile Section
    writeSectionBanner('ESTABLISHMENT & AUDIT PROFILE');
    writeMetricRow('Establishment Name', businessName, 'text', false);
    writeMetricRow('Selected Timeframe', formatTimeframe(timeframe), 'text', true);
    writeMetricRow('Audit Generated At', formatTimestamp(), 'text', false);
    writeMetricRow('Reporting Currency', summary.currency || 'USD ($)', 'text', true);
    writeMetricRow('Operational Standing', 'Verified Partner Business', 'text', false);

    // Spacer row
    wsOverview[getCellAddress(0, currentRow)] = { v: '', t: 's' };
    overviewRows[currentRow] = { hpt: 8 };
    currentRow++;

    // 2. Financial Revenue Performance Section
    writeSectionBanner('FINANCIAL REVENUE PERFORMANCE');
    writeMetricRow('Gross Total Revenue', Number(summary.total_gross_revenue || summary.total_revenue || 0), 'currency', false);
    writeMetricRow('Completed Revenue (Fulfilled)', Number(summary.completed_revenue || 0), 'currency', true);
    writeMetricRow('Confirmed / Paid Revenue', Number(summary.paid_revenue || summary.total_revenue || 0), 'currency', false);
    writeMetricRow('Pending Settlements', Number(summary.pending_revenue || 0), 'currency', true);
    writeMetricRow('Average Ticket Value (ATV)', Number(summary.average_booking_value || 0), 'currency', false);

    // Spacer row
    wsOverview[getCellAddress(0, currentRow)] = { v: '', t: 's' };
    overviewRows[currentRow] = { hpt: 8 };
    currentRow++;

    // 3. Reservations & Volume Section
    writeSectionBanner('RESERVATION & VOLUME INTAKE');
    writeMetricRow('Total Reservations Ingested', Number(summary.total_bookings || 0), 'number', false);
    writeMetricRow('Confirmed Reservations', Number(summary.confirmed_bookings || 0), 'number', true);
    writeMetricRow('Completed Reservations', Number(summary.completed_bookings || 0), 'number', false);
    writeMetricRow('Pending Action Reservations', Number(summary.pending_bookings || 0), 'number', true);
    writeMetricRow('Cancelled / Rejected Reservations', Number((summary.cancelled_bookings || 0) + (summary.rejected_bookings || 0)), 'number', false);
    writeMetricRow('Total Guests & Visitors Served', Number(summary.total_guests || summary.guests_served || 0), 'number', true);

    // Spacer row
    wsOverview[getCellAddress(0, currentRow)] = { v: '', t: 's' };
    overviewRows[currentRow] = { hpt: 8 };
    currentRow++;

    // 4. Performance Ratios Section
    writeSectionBanner('OPERATIONAL PERFORMANCE RATIOS');
    writeMetricRow('Fulfillment / Completion Rate', Number(summary.completion_rate || 0), 'percentage', false);
    writeMetricRow('Cancellation / Attrition Rate', Number(summary.cancellation_rate || 0), 'percentage', true);
    writeMetricRow('Verified Customer Rating', ratings.average_rating ? `${Number(ratings.average_rating).toFixed(1)} / 5.0 ★` : '5.0 / 5.0 ★', 'text', false);

    wsOverview['!merges'] = overviewMerges;
    wsOverview['!rows'] = overviewRows;
    wsOverview['!cols'] = [{ wch: 38 }, { wch: 32 }];
    wsOverview['!ref'] = `A1:${getCellAddress(maxCols1 - 1, currentRow - 1)}`;
    XLSX.utils.book_append_sheet(workbook, wsOverview, 'Summary KPIs');

    // =========================================================================
    // SHEET 2: Periodic Trends
    // =========================================================================
    if (trends.length > 0) {
      const wsTrends = {};
      const trendsMerges = [];
      const trendsRows = [];
      const maxCols2 = 7;

      addExecutiveBanner(
        wsTrends,
        'ANGKORVERSES • PERIODIC INGESTION & REVENUE TRENDS',
        `Chronological breakdown of reservations intake, revenue trajectory, and party sizes`,
        maxCols2,
        trendsMerges,
        trendsRows
      );

      const headers2 = [
        'Period Label',
        'Date / Interval',
        'Gross Revenue ($)',
        'Reservations Count',
        'Guests Served',
        'Completed',
        'Cancelled',
      ];

      // Table Header Row (Row 4)
      headers2.forEach((h, c) => {
        wsTrends[getCellAddress(c, 3)] = {
          v: h,
          t: 's',
          s: {
            font: { name: 'Calibri', sz: 10.5, bold: true, color: { rgb: COLORS.WHITE } },
            fill: { fgColor: { rgb: COLORS.NAVY_PRIMARY } },
            alignment: { horizontal: c >= 2 ? 'right' : 'center', vertical: 'center' },
            border: BORDER_THIN,
          },
        };
      });
      trendsRows[3] = { hpt: 24 };

      let r2 = 4;
      let sumRev = 0;
      let sumBookings = 0;
      let sumGuests = 0;
      let sumCompleted = 0;
      let sumCancelled = 0;

      trends.forEach((t, i) => {
        const isZebra = i % 2 === 1;
        const bg = isZebra ? COLORS.ZEBRA_BG : COLORS.WHITE;
        const rev = Number(t.revenue || 0);
        const bCount = Number(t.bookings || 0);
        const gCount = Number(t.guests || 0);
        const cCount = Number(t.completed || 0);
        const canCount = Number(t.cancelled || 0);

        sumRev += rev;
        sumBookings += bCount;
        sumGuests += gCount;
        sumCompleted += cCount;
        sumCancelled += canCount;

        const rowValues = [
          { v: t.label || `P${i + 1}`, t: 's', align: 'center' },
          { v: t.date || '—', t: 's', align: 'center' },
          { v: rev, t: 'n', z: '$#,##0.00', align: 'right', bold: true, color: COLORS.SUCCESS_GREEN },
          { v: bCount, t: 'n', z: '#,##0', align: 'right' },
          { v: gCount, t: 'n', z: '#,##0', align: 'right' },
          { v: cCount, t: 'n', z: '#,##0', align: 'right' },
          { v: canCount, t: 'n', z: '#,##0', align: 'right' },
        ];

        rowValues.forEach((cell, c) => {
          wsTrends[getCellAddress(c, r2)] = {
            v: cell.v,
            t: cell.t,
            z: cell.z,
            s: {
              font: { name: 'Calibri', sz: 10, bold: cell.bold || false, color: { rgb: cell.color || COLORS.TEXT_MAIN } },
              fill: { fgColor: { rgb: bg } },
              alignment: { horizontal: cell.align, vertical: 'center' },
              border: BORDER_THIN,
            },
          };
        });

        trendsRows[r2] = { hpt: 19 };
        r2++;
      });

      // Total Aggregate Row
      const totalValues2 = [
        { v: 'TOTAL / AGGREGATE', t: 's', align: 'center', bold: true },
        { v: `${trends.length} periods`, t: 's', align: 'center', bold: true },
        { v: sumRev, t: 'n', z: '$#,##0.00', align: 'right', bold: true, color: COLORS.SUCCESS_GREEN },
        { v: sumBookings, t: 'n', z: '#,##0', align: 'right', bold: true },
        { v: sumGuests, t: 'n', z: '#,##0', align: 'right', bold: true },
        { v: sumCompleted, t: 'n', z: '#,##0', align: 'right', bold: true },
        { v: sumCancelled, t: 'n', z: '#,##0', align: 'right', bold: true },
      ];

      totalValues2.forEach((cell, c) => {
        wsTrends[getCellAddress(c, r2)] = {
          v: cell.v,
          t: cell.t,
          z: cell.z,
          s: {
            font: { name: 'Calibri', sz: 10.5, bold: true, color: { rgb: cell.color || COLORS.TEXT_MAIN } },
            fill: { fgColor: { rgb: COLORS.TOTAL_BG } },
            alignment: { horizontal: cell.align, vertical: 'center' },
            border: BORDER_TOTAL,
          },
        };
      });
      trendsRows[r2] = { hpt: 22 };

      wsTrends['!merges'] = trendsMerges;
      wsTrends['!rows'] = trendsRows;
      wsTrends['!cols'] = [
        { wch: 18 },
        { wch: 16 },
        { wch: 22 },
        { wch: 20 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
      ];
      wsTrends['!ref'] = `A1:${getCellAddress(maxCols2 - 1, r2)}`;
      XLSX.utils.book_append_sheet(workbook, wsTrends, 'Revenue & Booking Trends');
    }

    // =========================================================================
    // SHEET 3: Top Performing Services
    // =========================================================================
    if (topServices.length > 0) {
      const wsServices = {};
      const sMerges = [];
      const sRows = [];
      const maxCols3 = 5;

      addExecutiveBanner(
        wsServices,
        'ANGKORVERSES • TOP SERVICES & EXPERIENCES CATALOG',
        `Ranked performance by reservation volume, gross revenue contribution, and popularity`,
        maxCols3,
        sMerges,
        sRows
      );

      const headers3 = [
        'Rank',
        'Service / Experience Name',
        'Bookings Volume',
        'Revenue Generated ($)',
        'Revenue Share (%)',
      ];

      headers3.forEach((h, c) => {
        wsServices[getCellAddress(c, 3)] = {
          v: h,
          t: 's',
          s: {
            font: { name: 'Calibri', sz: 10.5, bold: true, color: { rgb: COLORS.WHITE } },
            fill: { fgColor: { rgb: COLORS.NAVY_PRIMARY } },
            alignment: { horizontal: c === 0 ? 'center' : c >= 2 ? 'right' : 'left', vertical: 'center' },
            border: BORDER_THIN,
          },
        };
      });
      sRows[3] = { hpt: 24 };

      let r3 = 4;
      let totServiceVol = 0;
      let totServiceRev = 0;

      topServices.forEach((s, idx) => {
        const isZebra = idx % 2 === 1;
        const bg = isZebra ? COLORS.ZEBRA_BG : COLORS.WHITE;
        const vol = Number(s.bookings_count || s.bookings || 0);
        const rev = Number(s.revenue || 0);
        totServiceVol += vol;
        totServiceRev += rev;

        const rowValues = [
          { v: `#${idx + 1}`, t: 's', align: 'center', bold: true },
          { v: s.name || s.service_name || `Service #${idx + 1}`, t: 's', align: 'left', bold: true },
          { v: vol, t: 'n', z: '#,##0', align: 'right' },
          { v: rev, t: 'n', z: '$#,##0.00', align: 'right', bold: true, color: COLORS.SUCCESS_GREEN },
          { v: s.percentage ? `${s.percentage}%` : '—', t: 's', align: 'right' },
        ];

        rowValues.forEach((cell, c) => {
          wsServices[getCellAddress(c, r3)] = {
            v: cell.v,
            t: cell.t,
            z: cell.z,
            s: {
              font: { name: 'Calibri', sz: 10, bold: cell.bold || false, color: { rgb: cell.color || COLORS.TEXT_MAIN } },
              fill: { fgColor: { rgb: bg } },
              alignment: { horizontal: cell.align, vertical: 'center' },
              border: BORDER_THIN,
            },
          };
        });

        sRows[r3] = { hpt: 20 };
        r3++;
      });

      // Total row
      const totalValues3 = [
        { v: 'TOTAL', t: 's', align: 'center', bold: true },
        { v: `${topServices.length} Services`, t: 's', align: 'left', bold: true },
        { v: totServiceVol, t: 'n', z: '#,##0', align: 'right', bold: true },
        { v: totServiceRev, t: 'n', z: '$#,##0.00', align: 'right', bold: true, color: COLORS.SUCCESS_GREEN },
        { v: '100.0%', t: 's', align: 'right', bold: true },
      ];

      totalValues3.forEach((cell, c) => {
        wsServices[getCellAddress(c, r3)] = {
          v: cell.v,
          t: cell.t,
          z: cell.z,
          s: {
            font: { name: 'Calibri', sz: 10.5, bold: true, color: { rgb: cell.color || COLORS.TEXT_MAIN } },
            fill: { fgColor: { rgb: COLORS.TOTAL_BG } },
            alignment: { horizontal: cell.align, vertical: 'center' },
            border: BORDER_TOTAL,
          },
        };
      });
      sRows[r3] = { hpt: 22 };

      wsServices['!merges'] = sMerges;
      wsServices['!rows'] = sRows;
      wsServices['!cols'] = [
        { wch: 10 },
        { wch: 38 },
        { wch: 20 },
        { wch: 24 },
        { wch: 22 },
      ];
      wsServices['!ref'] = `A1:${getCellAddress(maxCols3 - 1, r3)}`;
      XLSX.utils.book_append_sheet(workbook, wsServices, 'Top Services');
    }

    // =========================================================================
    // SHEET 4: Reservation Status Distribution
    // =========================================================================
    if (statusList.length > 0) {
      const wsStatus = {};
      const stMerges = [];
      const stRows = [];
      const maxCols4 = 3;

      addExecutiveBanner(
        wsStatus,
        'ANGKORVERSES • RESERVATION STATUS BREAKDOWN',
        `Operational distribution of bookings across confirmed, completed, pending, and cancelled stages`,
        maxCols4,
        stMerges,
        stRows
      );

      const headers4 = ['Reservation Status', 'Reservations Count', 'Percentage Share (%)'];

      headers4.forEach((h, c) => {
        wsStatus[getCellAddress(c, 3)] = {
          v: h,
          t: 's',
          s: {
            font: { name: 'Calibri', sz: 10.5, bold: true, color: { rgb: COLORS.WHITE } },
            fill: { fgColor: { rgb: COLORS.NAVY_PRIMARY } },
            alignment: { horizontal: c === 0 ? 'left' : 'right', vertical: 'center' },
            border: BORDER_THIN,
          },
        };
      });
      stRows[3] = { hpt: 24 };

      let r4 = 4;
      const totalBookingsCount = statusList.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0) || 1;

      statusList.forEach((st, idx) => {
        const isZebra = idx % 2 === 1;
        const bg = isZebra ? COLORS.ZEBRA_BG : COLORS.WHITE;
        const cnt = Number(st.count || 0);
        const pct = Math.round((cnt / totalBookingsCount) * 100);

        const statusName = st.name || st.label || st.status || 'Unknown';

        const rowValues = [
          { v: statusName, t: 's', align: 'left', bold: true },
          { v: cnt, t: 'n', z: '#,##0', align: 'right' },
          { v: `${pct}%`, t: 's', align: 'right' },
        ];

        rowValues.forEach((cell, c) => {
          wsStatus[getCellAddress(c, r4)] = {
            v: cell.v,
            t: cell.t,
            z: cell.z,
            s: {
              font: { name: 'Calibri', sz: 10, bold: cell.bold || false, color: { rgb: COLORS.TEXT_MAIN } },
              fill: { fgColor: { rgb: bg } },
              alignment: { horizontal: cell.align, vertical: 'center' },
              border: BORDER_THIN,
            },
          };
        });

        stRows[r4] = { hpt: 20 };
        r4++;
      });

      // Total row
      const totalValues4 = [
        { v: 'TOTAL RESERVATIONS', t: 's', align: 'left', bold: true },
        { v: totalBookingsCount, t: 'n', z: '#,##0', align: 'right', bold: true },
        { v: '100%', t: 's', align: 'right', bold: true },
      ];

      totalValues4.forEach((cell, c) => {
        wsStatus[getCellAddress(c, r4)] = {
          v: cell.v,
          t: cell.t,
          z: cell.z,
          s: {
            font: { name: 'Calibri', sz: 10.5, bold: true, color: { rgb: COLORS.TEXT_MAIN } },
            fill: { fgColor: { rgb: COLORS.TOTAL_BG } },
            alignment: { horizontal: cell.align, vertical: 'center' },
            border: BORDER_TOTAL,
          },
        };
      });
      stRows[r4] = { hpt: 22 };

      wsStatus['!merges'] = stMerges;
      wsStatus['!rows'] = stRows;
      wsStatus['!cols'] = [{ wch: 28 }, { wch: 22 }, { wch: 24 }];
      wsStatus['!ref'] = `A1:${getCellAddress(maxCols4 - 1, r4)}`;
      XLSX.utils.book_append_sheet(workbook, wsStatus, 'Status Breakdown');
    }

    // =========================================================================
    // SHEET 5: Detailed Bookings Ledger
    // =========================================================================
    if (recentBookings.length > 0) {
      const wsBookings = {};
      const bMerges = [];
      const bRows = [];
      const maxCols5 = 10;

      addExecutiveBanner(
        wsBookings,
        'ANGKORVERSES • DETAILED RESERVATIONS LEDGER',
        `Itemized transaction record of client reservations, timestamps, and payment standing`,
        maxCols5,
        bMerges,
        bRows
      );

      const headers5 = [
        'Booking Ref',
        'Customer Name',
        'Customer Email',
        'Service / Offering',
        'Booking Date',
        'Time',
        'Guests',
        'Total Price ($)',
        'Booking Status',
        'Payment Status',
      ];

      headers5.forEach((h, c) => {
        wsBookings[getCellAddress(c, 3)] = {
          v: h,
          t: 's',
          s: {
            font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: COLORS.WHITE } },
            fill: { fgColor: { rgb: COLORS.NAVY_PRIMARY } },
            alignment: { horizontal: c >= 6 && c <= 7 ? 'right' : 'center', vertical: 'center' },
            border: BORDER_THIN,
          },
        };
      });
      bRows[3] = { hpt: 24 };

      let r5 = 4;
      recentBookings.forEach((b, idx) => {
        const isZebra = idx % 2 === 1;
        const bg = isZebra ? COLORS.ZEBRA_BG : COLORS.WHITE;

        const rowValues = [
          { v: b.booking_reference || `#${b.id}`, t: 's', align: 'center', bold: true },
          { v: b.customer_name || 'N/A', t: 's', align: 'left', bold: true },
          { v: b.customer_email || '—', t: 's', align: 'left' },
          { v: b.service_name || 'General Booking', t: 's', align: 'left' },
          { v: b.booking_date || '—', t: 's', align: 'center' },
          { v: b.booking_time || '—', t: 's', align: 'center' },
          { v: Number(b.total_guests || 1), t: 'n', z: '#,##0', align: 'right' },
          { v: Number(b.total_price || 0), t: 'n', z: '$#,##0.00', align: 'right', bold: true, color: COLORS.SUCCESS_GREEN },
          { v: (b.status || 'pending').toUpperCase(), t: 's', align: 'center', bold: true },
          { v: (b.payment_status || 'unpaid').toUpperCase(), t: 's', align: 'center', bold: true },
        ];

        rowValues.forEach((cell, c) => {
          wsBookings[getCellAddress(c, r5)] = {
            v: cell.v,
            t: cell.t,
            z: cell.z,
            s: {
              font: { name: 'Calibri', sz: 9.5, bold: cell.bold || false, color: { rgb: cell.color || COLORS.TEXT_MAIN } },
              fill: { fgColor: { rgb: bg } },
              alignment: { horizontal: cell.align, vertical: 'center' },
              border: BORDER_THIN,
            },
          };
        });

        bRows[r5] = { hpt: 20 };
        r5++;
      });

      wsBookings['!merges'] = bMerges;
      wsBookings['!rows'] = bRows;
      wsBookings['!cols'] = [
        { wch: 18 },
        { wch: 24 },
        { wch: 28 },
        { wch: 28 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
      ];
      wsBookings['!ref'] = `A1:${getCellAddress(maxCols5 - 1, r5 - 1)}`;
      XLSX.utils.book_append_sheet(workbook, wsBookings, 'Recent Bookings');
    }

    // Dynamic file name
    const cleanBizName = (businessName || 'Business')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 24);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `${cleanBizName}_Report_${timeframe}_${dateStr}.xlsx`;

    XLSX.writeFile(workbook, filename);
    return { success: true, filename };
  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw new Error(error.message || 'Failed to generate Excel file.');
  }
}
