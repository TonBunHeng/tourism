import React from 'react';
import { Eye, Trash2, Clock, Activity, PlusCircle, CheckCircle2, AlertCircle, RefreshCw, LogIn } from 'lucide-react';
import { getRoleColor, formatRoleLabel } from '../../utils/StatusUtils';
import { useLanguage } from '../../i18n';

export default function TrackingList({
  logs = [],
  startIndex = 0,
  loading = false,
  isSuperAdmin = false,
  onViewDetails,
  onDeleteLog,
}) {
  const { t } = useLanguage();

  const getActionBadge = (action) => {
    const act = (action || '').toLowerCase();
    if (act.includes('create') || act.includes('store')) {
      return {
        label: action.replace(/_/g, ' ').toUpperCase(),
        style: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
        icon: PlusCircle,
      };
    }
    if (act.includes('approve') || act.includes('verify') || act.includes('activate')) {
      return {
        label: action.replace(/_/g, ' ').toUpperCase(),
        style: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
        icon: CheckCircle2,
      };
    }
    if (act.includes('reject') || act.includes('suspend') || act.includes('block')) {
      return {
        label: action.replace(/_/g, ' ').toUpperCase(),
        style: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/50',
        icon: AlertCircle,
      };
    }
    if (act.includes('delete') || act.includes('destroy') || act.includes('clear')) {
      return {
        label: action.replace(/_/g, ' ').toUpperCase(),
        style: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800/50',
        icon: Trash2,
      };
    }
    if (act.includes('login') || act.includes('auth')) {
      return {
        label: action.replace(/_/g, ' ').toUpperCase(),
        style: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/50',
        icon: LogIn,
      };
    }
    return {
      label: action.replace(/_/g, ' ').toUpperCase(),
      style: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800/50',
      icon: RefreshCw,
    };
  };

  const formatRoleText = (role) => {
    const r = String(role || '').toLowerCase();
    if (r === 'super_admin' || r === 'super admin') return t('users.roleSuperAdmin', 'Super Admin');
    if (r === 'admin') return t('tracking.roleAdmin', 'Admin Staff');
    if (r === 'guide_editor' || r === 'tourism_content_editor') return t('tracking.roleGuideEditor', 'Content Editors');
    if (r === 'business_owner') return t('tracking.roleBusinessOwner', 'Business Owners');
    if (r === 'user' || r === 'tourist') return t('users.roleUser', 'User');
    return formatRoleLabel(role);
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return { relative: 'N/A', full: '' };
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    let relative = '';
    if (diffSec < 60) relative = t('tracking.timeJustNow', 'Just now');
    else if (diffMin < 60) relative = t('tracking.timeMinAgo', '{min}m ago', { min: diffMin });
    else if (diffHr < 24) relative = t('tracking.timeHrAgo', '{hr}h ago', { hr: diffHr });
    else if (diffDays === 1) relative = t('tracking.timeYesterday', 'Yesterday');
    else if (diffDays < 7) relative = t('tracking.timeDaysAgo', '{days}d ago', { days: diffDays });
    else relative = date.toLocaleDateString();

    const full = date.toLocaleString();
    return { relative, full };
  };

  const safeLogs = Array.isArray(logs) ? logs : [];

  return (
    <div className="w-full">
      {/* 1. Mobile Card / List View (Visible on < sm, zero horizontal scrolling) */}
      <div className="block sm:hidden divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)]">
        {safeLogs.length > 0 ? (
          safeLogs.map((log) => {
            const role = log.user_role || log.user?.role || 'admin';
            const actionInfo = getActionBadge(log.action);
            const ActionIcon = actionInfo.icon;
            const timeData = formatTimestamp(log.created_at);
            const userName = log.user_name || log.user?.name || t('tracking.staffUser', 'Staff User');
            const userEmail = log.user?.email || (log.ip_address ? `IP: ${log.ip_address}` : 'N/A');

            return (
              <div
                key={log.id}
                onClick={() => onViewDetails(log)}
                className="p-3.5 hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700 overflow-hidden font-bold text-xs text-[#003E83] dark:text-blue-400">
                    {log.user?.avatar ? (
                      <img src={log.user.avatar} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{userName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                        {userName}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-md border shrink-0 ${getRoleColor(role)}`}>
                        {formatRoleText(role)}
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate mt-0.5">
                      {userEmail}
                    </p>

                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md border ${actionInfo.style}`}>
                        <ActionIcon className="w-3 h-3 shrink-0" />
                        <span>{actionInfo.label}</span>
                      </span>

                      {log.entity_type && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700">
                          <span>{log.entity_type}</span>
                          {log.entity_id && (
                            <span className="text-gray-400 dark:text-zinc-500 font-mono">#{log.entity_id}</span>
                          )}
                        </span>
                      )}
                    </div>

                    {log.description && (
                      <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1.5 line-clamp-2">
                        {log.description}
                      </p>
                    )}

                    <div
                      className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{timeData.relative}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onViewDetails(log)}
                          className="p-1 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-colors cursor-pointer"
                          title={t('tracking.tooltipViewDetails', 'View Details')}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {isSuperAdmin && onDeleteLog && (
                          <button
                            type="button"
                            onClick={() => onDeleteLog(log)}
                            className="p-1 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-colors cursor-pointer"
                            title={t('tracking.tooltipDeleteRecord', 'Delete Activity Record')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 px-4">
            <Activity className="w-10 h-10 text-[#003E83] dark:text-blue-500 mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
              {t('tracking.noActivitiesFound', 'No activities found')}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {t('tracking.tryAdjustingFilter', 'Try adjusting your search or role filter criteria')}
            </p>
          </div>
        )}
      </div>

      {/* 2. Desktop Table View (Visible on sm: and up, table-fixed so it stays strictly 100% width) */}
      <div className="hidden sm:block w-full overflow-hidden">
        <table className="w-full text-left divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)] table-fixed">
          <thead className="bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/50 border-b border-[var(--color-border-light)] dark:border-[var(--color-border-dark)]">
            <tr>
              <th className="hidden md:table-cell w-10 pl-3 pr-1 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider text-center font-mono">
                {t('tracking.thIndex', '#')}
              </th>
              <th className="w-[20%] lg:w-[19%] px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
                {t('tracking.thUser', 'USER')}
              </th>
              <th className="w-[12%] lg:w-[11%] px-2.5 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
                {t('tracking.thRole', 'ROLE')}
              </th>
              <th className="w-[14%] lg:w-[13%] px-2.5 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
                {t('tracking.thAction', 'ACTION')}
              </th>
              <th className="w-[13%] lg:w-[12%] px-2.5 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
                {t('tracking.thTargetItem', 'TARGET ITEM')}
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
                {t('tracking.thDescription', 'DESCRIPTION')}
              </th>
              <th className="w-[13%] lg:w-[12%] px-2.5 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
                {t('tracking.thDateTime', 'DATE & TIME')}
              </th>
              <th className="w-16 lg:w-20 pl-1 pr-4 py-3.5 text-right text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
                {t('tracking.thActions', 'ACTIONS')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
            {safeLogs.length > 0 ? (
              safeLogs.map((log, index) => {
                const role = log.user_role || log.user?.role || 'admin';
                const actionInfo = getActionBadge(log.action);
                const ActionIcon = actionInfo.icon;
                const timeData = formatTimestamp(log.created_at);
                const userName = log.user_name || log.user?.name || t('tracking.staffUser', 'Staff User');
                const userEmail = log.user?.email || (log.ip_address ? `IP: ${log.ip_address}` : 'staff@angkorverses.com');

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors group"
                  >
                    {/* Row Index # */}
                    <td className="hidden md:table-cell pl-3 pr-1 py-3 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                      {startIndex + index + 1}
                    </td>

                    {/* User info: Avatar + Name + Email */}
                    <td className="px-3 py-3 min-w-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700 overflow-hidden font-bold text-xs text-[#003E83] dark:text-blue-400">
                          {log.user?.avatar ? (
                            <img src={log.user.avatar} alt={userName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{userName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate"
                            title={userName}
                          >
                            {userName}
                          </p>
                          <p
                            className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate"
                            title={userEmail}
                          >
                            {userEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role Column */}
                    <td className="px-2.5 py-3 min-w-0">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border truncate max-w-full ${getRoleColor(role)}`}
                        title={formatRoleText(role)}
                      >
                        <span className="truncate">{formatRoleText(role)}</span>
                      </span>
                    </td>

                    {/* Action Column */}
                    <td className="px-2.5 py-3 min-w-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-md border truncate max-w-full ${actionInfo.style}`}
                        title={actionInfo.label}
                      >
                        <ActionIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{actionInfo.label}</span>
                      </span>
                    </td>

                    {/* Target Resource */}
                    <td className="px-2.5 py-3 min-w-0">
                      {log.entity_type ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 truncate max-w-full"
                          title={`${log.entity_type}${log.entity_id ? ` #${log.entity_id}` : ''}`}
                        >
                          <span className="truncate">{log.entity_type}</span>
                          {log.entity_id && (
                            <span className="text-gray-400 dark:text-zinc-500 font-mono shrink-0">#{log.entity_id}</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-xs">—</span>
                      )}
                    </td>

                    {/* Description: Automatically truncated with full text on hover tooltip */}
                    <td className="px-3 py-3 min-w-0">
                      <p
                        className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] truncate"
                        title={log.description}
                      >
                        {log.description || '—'}
                      </p>
                    </td>

                    {/* Date & Time */}
                    <td className="px-2.5 py-3 min-w-0 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]" title={timeData.full}>
                      <div className="flex items-center gap-1 font-mono truncate">
                        <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted-light)] shrink-0" />
                        <span className="truncate">{timeData.relative}</span>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="pl-1 pr-4 py-3 text-right text-xs">
                      <div className="flex items-center justify-end gap-1">
                        {/* View details */}
                        <button
                          type="button"
                          onClick={() => onViewDetails(log)}
                          className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title={t('tracking.tooltipViewDetails', 'View Details')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Super Admin Delete record if permitted */}
                        {isSuperAdmin && onDeleteLog && (
                          <button
                            type="button"
                            onClick={() => onDeleteLog(log)}
                            className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title={t('tracking.tooltipDeleteRecord', 'Delete Activity Record')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-12 px-4">
                  <Activity className="w-12 h-12 text-[#003E83] dark:text-blue-500 mx-auto mb-2 opacity-80" />
                  <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
                    {t('tracking.noActivitiesFound', 'No activities found')}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    {t('tracking.tryAdjustingFilter', 'Try adjusting your search or role filter criteria')}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
