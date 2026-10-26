// src/utils/exportReports.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Export report dataset to a stylized PDF file matching the Admin Reports layout
 * @param {Object} options 
 * @param {string} options.title - Title of the report
 * @param {string} options.subtitle - Subtitle or scope description
 * @param {Array<string>} options.headers - Column titles for PDF table
 * @param {Array<Array<any>>} options.rows - Row data matching headers
 * @param {Object} [options.summary] - Optional KPI summary metrics
 * @param {string} [options.filename] - File name for PDF download
 * @returns {{ success: boolean, filename: string, error?: any }}
 */
export const exportToPDF = ({ title, subtitle, headers, rows, summary, filename }) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // 1. Header Background Accent Banner (Primary Royal Blue #003E83)
    doc.setFillColor(0, 62, 131);
    doc.rect(0, 0, 297, 24, 'F');

    // 2. Header Title & Timestamp
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('SMART TOURISM BUSINESS PORTAL - REPORT', 14, 12);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 200, 12);

    // 3. Section Title / Metadata
    doc.setTextColor(30, 41, 59); // Dark slate
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text((title || 'BUSINESS PERFORMANCE REPORT').toUpperCase(), 14, 34);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle || `Report dataset containing ${rows.length} records.`, 14, 40);

    let startY = 46;

    // 4. Executive Summary KPI Blocks (if provided)
    if (summary) {
      const kpis = [
        { label: 'Gross Revenue', val: `$${Number(summary.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
        { label: 'Completed Revenue', val: `$${Number(summary.completed_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
        { label: 'Total Bookings', val: `${summary.total_bookings || 0} (${summary.completion_rate || 0}% Done)` },
        { label: 'Pending Action', val: `${summary.pending_bookings || 0} ($${Number(summary.pending_revenue || 0).toFixed(2)})` },
        { label: 'Guests Hosted', val: `${summary.total_guests || 0} (Avg ${summary.average_party_size || 0}/party)` },
        { label: 'Avg Booking Value', val: `$${Number(summary.average_booking_value || 0).toFixed(2)}` },
      ];

      const blockWidth = 43;
      const blockHeight = 14;
      const startX = 14;

      kpis.forEach((kpi, idx) => {
        const x = startX + idx * (blockWidth + 2);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(x, 44, blockWidth, blockHeight, 1.5, 1.5, 'FD');

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(kpi.label.toUpperCase(), x + 3, 49);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(kpi.val, x + 3, 55);
      });

      startY = 63;
    }

    // 5. Data Table matching exact Admin style
    autoTable(doc, {
      startY: startY,
      head: [headers],
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 62, 131],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { top: startY, left: 14, right: 14, bottom: 20 },
      didDrawPage: (data) => {
        // Footer Page Numbering & Confidential watermark
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          280,
          200,
          { align: 'right' }
        );
        doc.text(
          'AngkorVerses Management System - Confidential Business Report',
          14,
          200
        );
      }
    });

    const safeFilename = filename
      ? (filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
      : `Business_Report_${new Date().toISOString().slice(0, 10)}.pdf`;

    doc.save(safeFilename);
    return { success: true, filename: safeFilename };
  } catch (error) {
    console.error('Error generating PDF report:', error);
    return { success: false, error };
  }
};

/**
 * Export dataset to Excel file (.xlsx) matching Admin Reports layout
 * @param {Object} options
 * @param {Array<Object>} options.data - Flat JSON object array for spreadsheet
 * @param {string} [options.sheetName] - Sheet tab name
 * @param {string} [options.filename] - File name for Excel download
 * @returns {{ success: boolean, filename: string, error?: any }}
 */
export const exportToExcel = ({ data, sheetName = 'Report Data', filename }) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Auto-fit column widths
    if (data.length > 0) {
      const keys = Object.keys(data[0]);
      const colWidths = keys.map((key) => {
        const maxLen = Math.max(
          key.length,
          ...data.map((row) => (row[key] ? String(row[key]).length : 0))
        );
        return { wch: Math.min(Math.max(maxLen + 3, 10), 40) };
      });
      worksheet['!cols'] = colWidths;
    }

    const safeFilename = filename
      ? (filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)
      : `Business_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;

    XLSX.writeFile(workbook, safeFilename);
    return { success: true, filename: safeFilename };
  } catch (error) {
    console.error('Error exporting Excel file:', error);
    return { success: false, error };
  }
};
