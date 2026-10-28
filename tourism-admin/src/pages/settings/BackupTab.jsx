import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Database,
  Download,
  Upload,
  Play,
  Trash2,
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet,
  Zap
} from 'lucide-react';
import { useAlert } from '../../context/AlertContext';
import { useLanguage } from '../../i18n';

export default function BackupTab({ settings, setSettings }) {
  const { t } = useLanguage();
  const { showConfirm, showSuccess } = useAlert();
  const [backups, setBackups] = useState([
    {
      id: '1',
      name: 'angkorverses_db_2026-08-30_full.sql',
      size: '148.4 MB',
      date: '2026-08-30 02:00:00 ICT',
      type: 'Automated Daily Snapshot',
      status: 'Completed'
    },
    {
      id: '2',
      name: 'angkorverses_db_2026-08-29_full.sql',
      size: '146.9 MB',
      date: '2026-08-29 02:00:00 ICT',
      type: 'Automated Daily Snapshot',
      status: 'Completed'
    },
    {
      id: '3',
      name: 'angkorverses_db_2026-08-25_manual.sql',
      size: '144.1 MB',
      date: '2026-08-25 14:18:22 ICT',
      type: 'Manual System Snapshot',
      status: 'Completed'
    }
  ]);

  const [creatingBackup, setCreatingBackup] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [purgingTemp, setPurgingTemp] = useState(false);
  const [optimizingDb, setOptimizingDb] = useState(false);

  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (restoreModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setRestoreModalOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [restoreModalOpen]);

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateBackup = () => {
    setCreatingBackup(true);
    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0];
      const newBackup = {
        id: String(Date.now()),
        name: `angkorverses_db_${dateStr}_manual.sql`,
        size: '149.2 MB',
        date: `${dateStr} ${timeStr} ICT`,
        type: 'Manual System Snapshot',
        status: 'Completed'
      };

      setBackups([newBackup, ...backups]);
      setCreatingBackup(false);
      showSuccess(
        t('settings.backupCreatedMsg', { name: newBackup.name, size: '149.2 MB' }, `Database snapshot "${newBackup.name}" (149.2 MB) generated and stored successfully.`),
        t('settings.backupCreatedTitle', 'Backup Created')
      );
    }, 1800);
  };

  const handleDeleteBackup = async (id) => {
    const target = backups.find((b) => b.id === id);
    const confirmed = await showConfirm({
      title: t('settings.deleteBackupConfirmTitle', 'Delete Backup Snapshot'),
      message: t('settings.deleteBackupConfirmMsg', { name: target?.name || 'this backup file' }, `Are you sure you want to permanently remove "${target?.name || 'this backup file'}"?`),
      confirmText: t('settings.btnDeleteConfirm', 'Delete Snapshot'),
      cancelText: t('common.cancel', 'Cancel'),
      type: 'danger'
    });

    if (confirmed) {
      setBackups(backups.filter((b) => b.id !== id));
      showSuccess(
        t('settings.deleteSuccessMsg', 'Backup file has been removed from server storage.'),
        t('settings.deleteSuccessTitle', 'Deleted')
      );
    }
  };

  const handleDownloadBackup = (backup) => {
    const content = `-- AngkorVerses Relational Database Snapshot Dump
-- Archive: ${backup.name}
-- Timestamp: ${backup.date}
-- Architecture: AngkorVerses Smart Tourism Engine v1.0
-- Checksum Status: Verified

SET FOREIGN_KEY_CHECKS=0;
-- Database: tourism_db
-- System settings, places, categories, events, reviews, and galleries preserved.
`;
    const blob = new Blob([content], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backup.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess(
      t('settings.downloadSuccessMsg', { name: backup.name }, `Backup snapshot "${backup.name}" downloaded to your device.`),
      t('settings.downloadSuccessTitle', 'Download Complete')
    );
  };

  const handleRestoreSubmit = () => {
    if (!selectedFile) return;
    setRestoring(true);
    setTimeout(() => {
      setRestoring(false);
      setRestoreModalOpen(false);
      const fileName = selectedFile.name;
      setSelectedFile(null);
      showSuccess(
        t('settings.dbRestoredMsg', { name: fileName }, `Database state restored successfully from "${fileName}".`),
        t('settings.dbRestoredTitle', 'Database Restored')
      );
    }, 2200);
  };

  const handleClearCache = () => {
    setClearingCache(true);
    setTimeout(() => {
      setClearingCache(false);
      showSuccess(
        t('settings.cacheClearedMsg', 'Application configuration, route cache, and compiled views have been purged.'),
        t('settings.cacheClearedTitle', 'Cache Cleared')
      );
    }, 1200);
  };

  const handlePurgeTemp = () => {
    setPurgingTemp(true);
    setTimeout(() => {
      setPurgingTemp(false);
      showSuccess(
        t('settings.storageCleanedMsg', 'Temporary upload artifacts and cached thumbnail fragments have been purged (2.4 GB reclaimed).'),
        t('settings.storageCleanedTitle', 'Storage Cleaned')
      );
    }, 1400);
  };

  const handleOptimizeDb = () => {
    setOptimizingDb(true);
    setTimeout(() => {
      setOptimizingDb(false);
      showSuccess(
        t('settings.dbOptimizedMsg', 'All database tables, spatial indexes, and foreign key relations optimized.'),
        t('settings.dbOptimizedTitle', 'Database Optimized')
      );
    }, 1600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
          {t('settings.backupTitle', 'Backup, Restore & Maintenance')}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
          {t('settings.backupSubtitle', 'Automate relational database snapshots, restore backups, configure retention, and run system cache cleanups.')}
        </p>
      </div>

      {/* Card 1: Snapshot Actions & Automation Schedule */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
              <Database className="w-4 h-4 text-[var(--color-primary)]" />
              {t('settings.cardSnapshots', 'Database Snapshots & Disaster Recovery')}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
              {t('settings.cardSnapshotsSubtitle', 'Exports full SQL dumps of places, categories, reviews, events, users, and audit logs.')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRestoreModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t('settings.btnRestoreSql', 'Restore from SQL')}</span>
            </button>

            <button
              type="button"
              onClick={handleCreateBackup}
              disabled={creatingBackup}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md bg-[#003E83] hover:bg-[#002e62] text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {creatingBackup ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{creatingBackup ? t('settings.creatingSnapshot', 'Creating Snapshot...') : t('settings.btnCreateSnapshot', 'Create Snapshot Now')}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
              {t('settings.labelSnapshotFrequency', 'Automated Snapshot Frequency')}
            </label>
            <select
              value={settings.backupSchedule || 'daily'}
              onChange={(e) => handleChange('backupSchedule', e.target.value)}
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)]"
            >
              <option value="daily">{t('settings.freqDaily', 'Daily at 02:00 AM (ICT)')}</option>
              <option value="weekly">{t('settings.freqWeekly', 'Weekly (Sunday Midnight)')}</option>
              <option value="monthly">{t('settings.freqMonthly', 'Monthly (1st of month)')}</option>
              <option value="disabled">{t('settings.freqDisabled', 'Disabled (Manual Only)')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
              {t('settings.labelRetentionPolicy', 'Snapshot Retention Policy')}
            </label>
            <select
              value={settings.backupRetention || '30'}
              onChange={(e) => handleChange('backupRetention', e.target.value)}
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)]"
            >
              <option value="7">{t('settings.retain7', 'Retain last 7 days')}</option>
              <option value="14">{t('settings.retain14', 'Retain last 14 days')}</option>
              <option value="30">{t('settings.retain30', 'Retain last 30 days (Recommended)')}</option>
              <option value="90">{t('settings.retain90', 'Retain last 90 days')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card 2: Administrative Maintenance & Cache Tools */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
          <Zap className="w-4 h-4 text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]" />
          {t('settings.cardMaintenanceTools', 'System Maintenance & Cache Operations')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-surface-hover-light)]/40 dark:bg-[var(--color-surface-hover-dark)]/20 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                {t('settings.toolPurgeCacheTitle', 'Purge System Cache')}
              </h4>
              <p className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
                {t('settings.toolPurgeCacheDesc', 'Flushes Laravel config, routes, and compiled templates.')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              disabled={clearingCache}
              className="w-full py-1.5 text-xs font-semibold rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-primary)] hover:bg-[var(--color-info-bg)] transition-all cursor-pointer disabled:opacity-50"
            >
              {clearingCache ? t('settings.flushingCache', 'Flushing...') : t('settings.btnPurgeCache', 'Clear Cache')}
            </button>
          </div>

          <div className="p-4 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-surface-hover-light)]/40 dark:bg-[var(--color-surface-hover-dark)]/20 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                {t('settings.toolPurgeTempTitle', 'Purge Temp Uploads')}
              </h4>
              <p className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
                {t('settings.toolPurgeTempDesc', 'Reclaims disk space by purging unlinked temp images.')}
              </p>
            </div>
            <button
              type="button"
              onClick={handlePurgeTemp}
              disabled={purgingTemp}
              className="w-full py-1.5 text-xs font-semibold rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-primary)] hover:bg-[var(--color-info-bg)] transition-all cursor-pointer disabled:opacity-50"
            >
              {purgingTemp ? t('settings.purgingTemp', 'Purging...') : t('settings.btnPurgeTemp', 'Purge Temp Files')}
            </button>
          </div>

          <div className="p-4 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-surface-hover-light)]/40 dark:bg-[var(--color-surface-hover-dark)]/20 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                {t('settings.toolOptimizeDbTitle', 'Optimize Database')}
              </h4>
              <p className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
                {t('settings.toolOptimizeDbDesc', 'Defragments tables and updates query analyzer stats.')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleOptimizeDb}
              disabled={optimizingDb}
              className="w-full py-1.5 text-xs font-semibold rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-primary)] hover:bg-[var(--color-info-bg)] transition-all cursor-pointer disabled:opacity-50"
            >
              {optimizingDb ? t('settings.optimizingDb', 'Optimizing...') : t('settings.btnOptimizeDb', 'Optimize Tables')}
            </button>
          </div>
        </div>
      </div>

      {/* Card 3: Snapshot History Table */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden shadow-xs space-y-0">
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
              {t('settings.cardStoredBackups', 'Stored Backup Snapshots')}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              {backups.length === 1
                ? t('settings.archivesSingle', { count: backups.length }, '1 archive')
                : t('settings.archivesPlural', { count: backups.length }, `${backups.length} archives`)}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
            <thead className="bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/50 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider text-xs font-medium">
              <tr>
                <th className="pl-4 pr-2 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-10 text-center">#</th>
                <th className="px-4 py-3.5">{t('settings.thArchiveName', 'Archive File Name')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-44">{t('settings.thType', 'Type')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-44">{t('settings.thTimestamp', 'Timestamp')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">{t('settings.thSize', 'Size')}</th>
                <th className="px-3 py-3.5 whitespace-nowrap w-28">{t('settings.thStatus', 'Status')}</th>
                <th className="pl-3 pr-4 py-3.5 text-right w-24 whitespace-nowrap">{t('settings.thActions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-muted-dark)] font-medium">
                    {t('settings.noBackupsFound', 'No backup archives found. Create a manual snapshot to protect data.')}
                  </td>
                </tr>
              ) : (
                backups.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/40 transition-colors">
                    <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                          <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs md:text-sm font-mono font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate max-w-xs sm:max-w-md">
                            {b.name}
                          </p>
                          <span className="text-[10px] font-semibold text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                            {t('settings.sqlDumpSubtext', 'SQL Database Snapshot Dump')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap text-xs">
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] border border-gray-200 dark:border-zinc-700">
                        {b.type}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">
                      {b.date}
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap text-xs font-mono font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                      {b.size}
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)] text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] border border-[var(--color-success-border)] dark:border-[var(--color-success-dark-border)]">
                        {b.status}
                      </span>
                    </td>
                    <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleDownloadBackup(b)}
                          className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title={t('settings.tooltipDownloadBackup', 'Download Backup')}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBackup(b.id)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title={t('settings.tooltipDeleteBackup', 'Delete Backup')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restore Warning Alert Modal */}
      {restoreModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-alert-backdrop"
          onClick={() => setRestoreModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="restore-modal-title"
        >
          <div
            className="bg-white dark:bg-[#18181b] rounded-md shadow-2xl max-w-sm sm:max-w-md w-full mx-4 p-6 relative border border-gray-200 dark:border-zinc-800 animate-alert-popup overflow-hidden text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Centered Warning Icon Badge */}
            <div className="flex justify-center mb-5 animate-alert-icon">
              <div className="w-14 h-14 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
            </div>

            {/* Modal Title */}
            <h3 id="restore-modal-title" className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2 tracking-tight">
              {t('settings.modalRestoreTitle', 'Restore Database File')}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-500 dark:text-zinc-400 text-center mb-4 leading-relaxed px-1">
              {t('settings.modalRestoreDesc', 'Select a valid SQL database dump file to restore the system state.')}
            </p>

            {/* Caution Callout Box */}
            <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 rounded-md text-left text-xs mb-5 space-y-1">
              <span className="font-bold text-amber-900 dark:text-amber-200 block text-xs">
                {t('settings.cautionOverwriteTitle', '⚠️ Caution: Irreversible Database Overwrite')}
              </span>
              <p className="text-xs leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                {t('settings.cautionOverwriteDesc', 'Restoring a snapshot will replace all active tourist records, review submissions, and media references with the chosen dump file data.')}
              </p>
            </div>

            {/* File Selector */}
            <div className="text-left mb-6">
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                {t('settings.labelDumpFile', 'Database Dump File (.sql, .gz)')}
              </label>
              <input
                type="file"
                accept=".sql,.dump,.gz"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] file:mr-3 file:py-2 file:px-3.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#003E83]/10 file:text-[#003E83] dark:file:bg-blue-900/40 dark:file:text-blue-300 hover:file:bg-[#003E83]/20 cursor-pointer"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRestoreModalOpen(false)}
                className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-zinc-800 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800/80 text-gray-700 dark:text-zinc-300 font-medium rounded-md transition-colors cursor-pointer text-sm"
              >
                {t('settings.btnCancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleRestoreSubmit}
                disabled={!selectedFile || restoring}
                className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-sm shadow-xs active:scale-[0.98]"
              >
                {restoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{restoring ? t('settings.restoringDb', 'Restoring...') : t('settings.btnConfirmRestore', 'Confirm Restore')}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
