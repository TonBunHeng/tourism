// src/utils/exportReports.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Export report dataset to a stylized PDF file
 * @param {Object} options 
 * @param {string} options.title - Title of the report
 * @param {string} options.subtitle - Subtitle or scope description
 * @param {Array<string>} options.headers - Column titles for PDF table
 * @param {Array<Array<any>>} options.rows - Row data matching headers
 * @param {string} options.filename - File name for PDF download
 * @param {Array<Object>} [options.columnStyles] - Optional column-specific styles
 * @returns {{ success: boolean, filename: string, error?: any }}
 */
export const exportToPDF = ({ title, subtitle, headers, rows, filename, columnStyles }) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Header Background Accent Banner
    doc.setFillColor(0, 62, 131); // #003E83 Primary Blue
    doc.rect(0, 0, 297, 24, 'F');

    // Header Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('SMART TOURISM ADMIN - REPORT SYSTEM', 14, 13);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 205, 13);

    // Section Subtitle / Metadata
    doc.setTextColor(30, 41, 59); // Dark slate
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 14, 34);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle || `Report dataset containing ${rows.length} records.`, 14, 40);

    // Data Table
    autoTable(doc, {
      startY: 46,
      head: [headers],
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 62, 131],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9.5,
        halign: 'left',
        valign: 'middle',
        cellPadding: 3
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [51, 65, 85],
        cellPadding: 2.8,
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: columnStyles || {},
      margin: { top: 46, left: 14, right: 14, bottom: 20 },
      didDrawPage: (data) => {
        // Footer Page Numbering
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
          'AngkorVerses Management System - Confidential Comprehensive Report',
          14,
          200
        );
      }
    });

    const safeFilename = filename
      ? (filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
      : `Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    
    doc.save(safeFilename);
    return { success: true, filename: safeFilename };
  } catch (error) {
    console.error('Error generating PDF report:', error);
    return { success: false, error };
  }
};

/**
 * Export dataset to Excel file (.xlsx) with multi-sheet support
 * @param {Object} options
 * @param {Array<Object>} [options.data] - Flat JSON object array for single-sheet export
 * @param {Array<{ name: string, data: Array<Object> }>} [options.sheets] - Multiple sheets for master export
 * @param {string} [options.sheetName] - Sheet tab name for single-sheet
 * @param {string} options.filename - File name for Excel download
 * @returns {{ success: boolean, filename: string, error?: any }}
 */
export const exportToExcel = ({ data, sheets, sheetName = 'Report Data', filename }) => {
  try {
    const workbook = XLSX.utils.book_new();

    if (Array.isArray(sheets) && sheets.length > 0) {
      sheets.forEach(({ name, data: sheetData }) => {
        const cleanData = sheetData || [];
        const worksheet = XLSX.utils.json_to_sheet(cleanData);

        // Auto-fit column widths
        if (cleanData.length > 0) {
          const keys = Object.keys(cleanData[0]);
          const colWidths = keys.map(key => {
            const maxLen = Math.max(
              key.length,
              ...cleanData.map(row => (row[key] !== null && row[key] !== undefined ? String(row[key]).length : 0))
            );
            return { wch: Math.min(Math.max(maxLen + 3, 10), 45) };
          });
          worksheet['!cols'] = colWidths;
        }

        const validName = (name || 'Sheet').replace(/[:\\/?*[\]]/g, '').slice(0, 31);
        XLSX.utils.book_append_sheet(workbook, worksheet, validName);
      });
    } else {
      const cleanData = data || [];
      const worksheet = XLSX.utils.json_to_sheet(cleanData);

      if (cleanData.length > 0) {
        const keys = Object.keys(cleanData[0]);
        const colWidths = keys.map(key => {
          const maxLen = Math.max(
            key.length,
            ...cleanData.map(row => (row[key] !== null && row[key] !== undefined ? String(row[key]).length : 0))
          );
          return { wch: Math.min(Math.max(maxLen + 3, 10), 45) };
        });
        worksheet['!cols'] = colWidths;
      }

      const validName = (sheetName || 'Report Data').replace(/[:\\/?*[\]]/g, '').slice(0, 31);
      XLSX.utils.book_append_sheet(workbook, worksheet, validName);
    }

    const safeFilename = filename
      ? (filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)
      : `Report_${new Date().toISOString().slice(0, 10)}.xlsx`;

    XLSX.writeFile(workbook, safeFilename);
    return { success: true, filename: safeFilename };
  } catch (error) {
    console.error('Error exporting Excel file:', error);
    return { success: false, error };
  }
};
