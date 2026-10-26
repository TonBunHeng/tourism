import { useEffect, useState } from 'react';
import {
  X,
  FileText,
  Download,
  FileSpreadsheet,
  Code,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { exportToPDF, exportToExcel } from '../../utils/exportReports';
import { useAlert } from '../../context/AlertContext';

export default function SecurityExportModal({ isOpen, onClose, alerts = [], meta = {} }) {
  const { showSuccess, showError } = useAlert();
  const [downloading, setDownloading] = useState(false);
  const [downloadType, setDownloadType] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 1. Download PDF Document using jsPDF / exportToPDF (never blocked by popup blocker)
  const handleDownloadPDF = () => {
    setDownloading(true);
    setDownloadType('pdf');

    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const headers = ['#', 'Target Account', 'Source IP', 'Failed Attempts', 'Type', 'Status', 'Timestamp'];
      const rows = alerts.map((alert, idx) => [
        idx + 1,
        alert.email || 'Unknown',
        alert.ip_address || '127.0.0.1',
        `${alert.attempts || 1} tries`,
        alert.type || 'Alert',
        alert.is_read ? 'Acknowledged' : 'Active Alert',
        alert.created_at ? new Date(alert.created_at).toLocaleString() : 'Recent'
      ]);

      const result = exportToPDF({
        title: 'SECURITY INCIDENT & AUDIT REPORT',
        subtitle: `Generated on ${new Date().toLocaleString()} | Total Incidents: ${alerts.length} | High Risk: ${meta.high_risk_count || 0} | Blocked IPs: ${meta.blocked_ips_count || 0}`,
        headers,
        rows,
        filename: `Security_Audit_Report_${todayStr}.pdf`
      });

      if (result.success) {
        onClose?.();
        showSuccess(
          `The security audit report (${alerts.length} incident records) has been exported to PDF successfully.`,
          'PDF Exported Successfully'
        );
      } else {
        showError(result.error || 'Failed to generate PDF document.', 'Export Failed');
      }
    } catch (err) {
      console.error('PDF Generation Error:', err);
      showError(err.message || 'An error occurred during PDF generation.', 'Export Failed');
    } finally {
      setDownloading(false);
      setDownloadType(null);
    }
  };

  // 2. Download Excel / Spreadsheet Document
  const handleDownloadExcel = () => {
    setDownloading(true);
    setDownloadType('excel');

    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const excelData = alerts.map((alert, idx) => ({
        '#': idx + 1,
        'Target Account': alert.email || 'Unknown',
        'Source IP': alert.ip_address || '127.0.0.1',
        'Failed Attempts': alert.attempts || 1,
        'Alert Type': alert.type || 'Alert',
        'Incident Status': alert.is_read ? 'Acknowledged' : 'Active Alert',
        'Message': alert.message || '',
        'Timestamp': alert.created_at || ''
      }));

      const result = exportToExcel({
        data: excelData,
        sheetName: 'Security Incidents',
        filename: `Security_Audit_Report_${todayStr}.xlsx`
      });

      if (result.success) {
        onClose?.();
        showSuccess(
          `The security audit report (${alerts.length} incident records) has been exported to Excel successfully.`,
          'Excel Exported Successfully'
        );
      } else {
        showError(result.error || 'Failed to generate Excel file.', 'Export Failed');
      }
    } catch (err) {
      console.error('Excel Export Error:', err);
      showError(err.message || 'An error occurred during Excel export.', 'Export Failed');
    } finally {
      setDownloading(false);
      setDownloadType(null);
    }
  };

  // 3. Download JSON Audit File
  const handleDownloadJSON = () => {
    setDownloading(true);
    setDownloadType('json');

    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const jsonContent = JSON.stringify({
        report: 'AngkorVerses Security Audit Report',
        generated_at: new Date().toISOString(),
        total_incidents: alerts.length,
        meta,
        alerts
      }, null, 2);

      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Security_Audit_Log_${todayStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onClose?.();
      showSuccess(
        `Security audit logs (${alerts.length} records) have been exported to JSON successfully.`,
        'JSON Exported Successfully'
      );
    } catch (err) {
      console.error('JSON Export Error:', err);
      showError(err.message || 'An error occurred during JSON export.', 'Export Failed');
    } finally {
      setDownloading(false);
      setDownloadType(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-150 animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="security-export-modal-title"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#18181b] border border-gray-200 dark:border-zinc-800 rounded-md shadow-2xl overflow-hidden animate-alert-popup"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-blue-500/10 text-[#003E83] dark:text-blue-400 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 id="security-export-modal-title" className="text-base font-bold text-gray-900 dark:text-white">
                Download Security Report
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Choose your preferred export document format
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body: Options */}
        <div className="p-5 space-y-3">
          {/* Option 1: PDF Document */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="w-full p-3.5 rounded-md border border-gray-200 dark:border-zinc-800 hover:border-red-400 dark:hover:border-red-500/50 bg-gray-50/70 dark:bg-zinc-900/60 hover:bg-red-50/20 dark:hover:bg-zinc-800/80 transition-all flex items-start gap-3.5 text-left cursor-pointer group disabled:opacity-60"
          >
            <div className="w-10 h-10 rounded-md bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center shrink-0">
              {downloading && downloadType === 'pdf' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-900 dark:text-zinc-100 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
                  PDF Security Audit Report
                </h4>
                <span className="text-[10px] uppercase font-semibold text-red-500 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                  PDF
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Formatted executive document with KPIs, incident tables, and system defense summary.
              </p>
            </div>
          </button>

          {/* Option 2: Excel / CSV Spreadsheet */}
          <button
            type="button"
            onClick={handleDownloadExcel}
            disabled={downloading}
            className="w-full p-3.5 rounded-md border border-gray-200 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 bg-gray-50/70 dark:bg-zinc-900/60 hover:bg-emerald-50/20 dark:hover:bg-zinc-800/80 transition-all flex items-start gap-3.5 text-left cursor-pointer group disabled:opacity-60"
          >
            <div className="w-10 h-10 rounded-md bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0">
              {downloading && downloadType === 'excel' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-900 dark:text-zinc-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                  CSV / Excel Spreadsheet
                </h4>
                <span className="text-[10px] uppercase font-semibold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Excel
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Spreadsheet data with raw timestamps, source IPs, target emails, and failure counters.
              </p>
            </div>
          </button>

          {/* Option 3: JSON Audit Log */}
          <button
            type="button"
            onClick={handleDownloadJSON}
            disabled={downloading}
            className="w-full p-3.5 rounded-md border border-gray-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 bg-gray-50/70 dark:bg-zinc-900/60 hover:bg-indigo-50/20 dark:hover:bg-zinc-800/80 transition-all flex items-start gap-3.5 text-left cursor-pointer group disabled:opacity-60"
          >
            <div className="w-10 h-10 rounded-md bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0">
              {downloading && downloadType === 'json' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Code className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-900 dark:text-zinc-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                  JSON Security Audit Log
                </h4>
                <span className="text-[10px] uppercase font-semibold text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  JSON
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Structured machine-readable logs for SIEM and security analysis tools.
              </p>
            </div>
          </button>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-zinc-400">
            {alerts.length} incident records ready to export
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-md border border-gray-300 dark:border-zinc-800 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
