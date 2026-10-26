import { User as UserIcon, Check, Eye, Edit, Trash2, Activity, Calendar } from "lucide-react";
import authService, { normalizeRole } from '../../services/authService';

export default function UsersGrid({
  users = [],
  onViewDetails,
  onEdit,
  onDelete,
  onViewUser,
  onEditUser,
  onDeleteUser
}) {
  const currentUser = authService.getCurrentUser();
  const isSuperAdmin = normalizeRole(currentUser?.role) === 'super_admin';

  const handleView = onViewDetails || onViewUser || (() => {});
  const handleEdit = onEdit || onEditUser || (() => {});
  const handleDeleteItem = onDelete || onDeleteUser || (() => {});

  const getRoleColor = (role) => {
    const norm = normalizeRole(role);
    switch (norm) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/50';
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/50';
      case 'guide_editor': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50';
      case 'business_owner': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/50';
      default: return 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-300 border-gray-200 dark:border-zinc-700';
    }
  };

  const getStatusColor = (status, isOnline) => {
    const s = String(status || '').toLowerCase();
    if (s === 'suspended') return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/50';
    if (s === 'inactive') return 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-400 border-gray-200 dark:border-zinc-700';
    if (isOnline) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50';
    return 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';
  };

  const getSubscriptionColor = (sub) => {
    const s = String(sub || '').toLowerCase();
    if (s === 'premium') return 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/40';
    if (s === 'basic') return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/40';
    return 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 border-gray-200 dark:border-zinc-700';
  };

  const formatRoleLabel = (role) => {
    const norm = normalizeRole(role);
    switch (norm) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'guide_editor':
      case 'tourism_content_editor': return 'Tourism Content Editor';
      case 'business_owner': return 'Business Owner';
      default: return 'User';
    }
  };

  const safeUsers = users || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
      {safeUsers.length > 0 ? (
        safeUsers.map((user) => {
          const isOnline = Boolean(user.is_online || user.onlineStatus === "Online");
          const isRowSuperAdmin = normalizeRole(user.role) === 'super_admin';
          const canModifyRow = isSuperAdmin || !isRowSuperAdmin;

          return (
            <div
              key={user.id}
              onClick={() => handleView(user)}
              className="group relative bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)]/50 border border-gray-200 dark:border-zinc-800 rounded-md p-4 hover:border-gray-400 dark:hover:border-zinc-600 shadow-xs transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] flex items-center justify-center shrink-0 border border-[var(--color-info-border)] overflow-hidden">
                  {typeof user.avatar === 'string' && user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--color-primary)] dark:text-[var(--color-info-dark-text)]" />
                  )}
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-md border-2 border-white dark:border-zinc-900 ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm truncate">{user.name}</h3>
                    {user.verified && (
                      <Check className="w-4 h-4 text-[var(--color-primary)] dark:text-[var(--color-info-dark-text)] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] truncate">{user.email}</p>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getRoleColor(user.role)}`}>
                      {formatRoleLabel(user.role)}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getStatusColor(user.status, isOnline)}`}>
                      <span className={`w-1.5 h-1.5 rounded-md ${isOnline ? 'bg-emerald-500 animate-pulse' : (String(user.status || '').toLowerCase() === 'suspended' ? 'bg-rose-500' : 'bg-slate-400 dark:bg-zinc-500')}`} />
                      {user.status || 'Active'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleView(user); }}
                    className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); canModifyRow && handleEdit(user); }}
                    disabled={!canModifyRow}
                    className={`p-1.5 rounded-md transition-all cursor-pointer ${
                      canModifyRow 
                        ? 'hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] text-blue-600 dark:text-blue-400 active:scale-90 hover:scale-105' 
                        : 'text-gray-300 dark:text-zinc-600 cursor-not-allowed opacity-50'
                    }`}
                    title={canModifyRow ? "Edit User" : "Only Super Admin can modify Super Admin accounts"}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); canModifyRow && handleDeleteItem(user.id); }}
                    disabled={!canModifyRow}
                    className={`p-1.5 rounded-md transition-all cursor-pointer ${
                      canModifyRow 
                        ? 'hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] active:scale-90 hover:scale-105' 
                        : 'text-gray-300 dark:text-zinc-600 cursor-not-allowed opacity-50'
                    }`}
                    title={canModifyRow ? "Delete User" : "Only Super Admin can delete Super Admin accounts"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md">
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Reviews</p>
                  <p className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{user.reviews}</p>
                </div>
                <div className="text-center p-2 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md">
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Favorites</p>
                  <p className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{user.favorites}</p>
                </div>
                <div className="text-center p-2 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md">
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Places</p>
                  <p className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{user.places}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[var(--color-border-light)] dark:border-[var(--color-border-dark)]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-md border ${getSubscriptionColor(user.subscription)}`}>
                    {user.subscription || 'Free'}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {user.activity || 'Medium'}
                  </span>
                </div>
                <span className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {user.joinDate}
                </span>
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full text-center py-12">
          <h3 className="text-lg font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">No users found</h3>
          <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
