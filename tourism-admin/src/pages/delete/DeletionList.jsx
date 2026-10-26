import React from 'react';
import { User, AlertCircle, Clock, Check, X, Eye, UserX, Trash2, ShieldAlert } from 'lucide-react';

const getStatusBadge = (status) => {
  const colors = {
    pending: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)] dark:bg-[var(--color-warning-dark-bg)] dark:text-[var(--color-warning-dark-text)] dark:border-[var(--color-warning-dark-border)]',
    approved: 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)] dark:bg-[var(--color-success-dark-bg)] dark:text-[var(--color-success-dark-text)] dark:border-[var(--color-success-dark-border)]',
    rejected: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border-[var(--color-danger-border)] dark:bg-[var(--color-danger-dark-bg)] dark:text-[var(--color-danger-dark-text)] dark:border-[var(--color-danger-dark-border)]',
    archived: 'bg-[var(--color-neutral-badge-bg)] text-[var(--color-neutral-badge-text)] border-[var(--color-border-subtle-light)] dark:bg-[var(--color-neutral-badge-dark-bg)] dark:text-[var(--color-neutral-badge-dark-text)] dark:border-[var(--color-border-dark)]'
  };
  return colors[status] || colors.pending;
};

const getUrgencyBadge = (urgency) => {
  const colors = {
    critical: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border-[var(--color-danger-border)] dark:bg-[var(--color-danger-dark-bg)] dark:text-[var(--color-danger-dark-text)] dark:border-[var(--color-danger-dark-border)]',
    high: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)] dark:bg-[var(--color-warning-dark-bg)] dark:text-[var(--color-warning-dark-text)] dark:border-[var(--color-warning-dark-border)]',
    medium: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)] dark:bg-[var(--color-warning-dark-bg)] dark:text-[var(--color-warning-dark-text)] dark:border-[var(--color-warning-dark-border)]',
    low: 'bg-[var(--color-info-bg)] text-[var(--color-info-text)] border-[var(--color-info-border)] dark:bg-[var(--color-info-dark-bg)] dark:text-[var(--color-info-dark-text)] dark:border-[var(--color-info-dark-border)]'
  };
  return colors[urgency] || colors.low;
};

const getTypeLabel = (type) => {
  return type === 'account' ? 'Account Deletion' : 'Item Deletion';
};

const getTypeIcon = (type) => {
  return type === 'account' ? UserX : Trash2;
};

const getTypeBadge = (type) => {
  return type === 'account'
    ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border-[var(--color-danger-border)] dark:bg-[var(--color-danger-dark-bg)] dark:text-[var(--color-danger-dark-text)] dark:border-[var(--color-danger-dark-border)]'
    : 'bg-[var(--color-purple-badge-bg)] text-[var(--color-purple-badge-text)] border-[var(--color-purple-badge-border)] dark:bg-[var(--color-purple-badge-dark-bg)] dark:text-[var(--color-purple-badge-dark-text)] dark:border-[var(--color-purple-badge-dark-border)]';
};

export default function DeletionList({
  requests = [],
  onViewDetails,
  onApprove,
  onReject,
  onClearFilters,
  hasActiveFilters,
  startIndex = 0
}) {
  const safeRequests = requests || [];

  return (
    <>
      {/* Mobile Card List View */}
      <div className="sm:hidden divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)]">
        {safeRequests.length > 0 ? (
          safeRequests.map((request) => {
            const TypeIcon = getTypeIcon(request.type);
            return (
              <div
                key={request.id}
                onClick={() => onViewDetails(request)}
                className="p-4 hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-[var(--color-rose-badge-bg)] dark:bg-[var(--color-rose-badge-dark-bg)] flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700">
                    <User className="w-5 h-5 text-[var(--color-rose-badge-text)] dark:text-[var(--color-rose-badge-dark-text)]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                        {request.user?.name || 'User'}
                      </p>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border shrink-0 ${getStatusBadge(request.status)}`}>
                        {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                      {request.user?.email}
                    </p>

                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md border ${getTypeBadge(request.type)}`}>
                        <TypeIcon className="w-3 h-3" />
                        {getTypeLabel(request.type)}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md border ${getUrgencyBadge(request.urgency)}`}>
                        <AlertCircle className="w-3 h-3" />
                        {request.urgency?.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1.5 line-clamp-2">
                      {request.reason}
                    </p>

                    <div
                      className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onViewDetails(request)}
                        className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onApprove(request)}
                            className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(request)}
                            className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 px-4">
            <ShieldAlert className="w-12 h-12 text-blue-500 mx-auto mb-2 opacity-80" />
            <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
              No requests found
            </h3>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Desktop Responsive Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)] table-auto">
          <thead className="bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/50">
            <tr>
              <th className="pl-4 pr-2 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-10 text-center">
                #
              </th>
              <th className="px-4 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
                User & Account
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-36">
                Type
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-28">
                Urgency
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
                Reason
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-32">
                Status
              </th>
              <th className="pl-3 pr-4 py-3.5 text-right text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-24 whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
            {safeRequests.length > 0 ? (
              safeRequests.map((request, index) => {
                const TypeIcon = getTypeIcon(request.type);
                return (
                  <tr
                    key={request.id}
                    className="hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors group"
                  >
                    <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                      {startIndex + index + 1}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-[var(--color-rose-badge-bg)] dark:bg-[var(--color-rose-badge-dark-bg)] flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700">
                          <User className="w-4 h-4 text-[var(--color-rose-badge-text)] dark:text-[var(--color-rose-badge-dark-text)]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                            {request.user?.name || 'User'}
                          </p>
                          <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                            {request.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getTypeBadge(request.type)}`}>
                        <TypeIcon className="w-3 h-3" />
                        {getTypeLabel(request.type)}
                      </span>
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getUrgencyBadge(request.urgency)}`}>
                        <AlertCircle className="w-3 h-3" />
                        {request.urgency?.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-3 py-3.5 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] max-w-xs truncate">
                      <p className="truncate">{request.reason}</p>
                      <span className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] font-mono block mt-0.5">
                        {request.requestedDate || request.requestDate}
                      </span>
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getStatusBadge(request.status)}`}>
                        {request.status === 'pending' && <Clock className="w-3 h-3" />}
                        {request.status === 'approved' && <Check className="w-3 h-3" />}
                        {request.status === 'rejected' && <X className="w-3 h-3" />}
                        {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                      </span>
                    </td>

                    <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onViewDetails(request)}
                          className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onApprove(request)}
                              className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onReject(request)}
                              className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-12 px-4">
                  <ShieldAlert className="w-12 h-12 text-blue-500 mx-auto mb-2 opacity-80" />
                  <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
                    No requests found
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    Try adjusting your search or filter criteria
                  </p>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={onClearFilters}
                      className="mt-3 px-4 py-2 text-xs font-semibold text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-colors cursor-pointer"
                    >
                      Clear all filters
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
