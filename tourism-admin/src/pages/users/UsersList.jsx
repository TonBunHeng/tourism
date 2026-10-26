import { User as UserIcon, Eye, Edit, Trash2, Clock, ShieldAlert } from 'lucide-react';
import authService, { normalizeRole } from '../../services/authService';

export default function UsersList({
  users = [],
  startIndex = 0,
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
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/50';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/50';
      case 'guide_editor':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50';
      case 'business_owner':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/50';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-300 border-gray-200 dark:border-zinc-700';
    }
  };

  const getStatusColor = (status, isOnline) => {
    const s = String(status || '').toLowerCase();
    if (s === 'suspended') {
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/50';
    }
    if (s === 'inactive') {
      return 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-400 border-gray-200 dark:border-zinc-700';
    }
    if (isOnline) {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50';
    }
    return 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';
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
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--color-border-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-surface-hover-light)]/40 dark:bg-[var(--color-surface-hover-dark)]/30">
            <th className="pl-4 pr-2 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-12 text-center">
              #
            </th>
            <th className="px-4 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
              User
            </th>
            <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-36">
              Role
            </th>
            <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-32">
              Status
            </th>
            <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-36">
              Last Active
            </th>
            <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-36">
              Phone
            </th>
            <th className="pl-3 pr-4 py-3.5 text-right text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-24 whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
          {safeUsers.length > 0 ? (
            safeUsers.map((user, index) => {
              const isActive = String(user.status || '').toLowerCase() === 'active';
              const isOnline = isActive && Boolean(user.is_online || user.onlineStatus === 'Online');
              const isRowSuperAdmin = normalizeRole(user.role) === 'super_admin';
              const canModifyRow = isSuperAdmin || !isRowSuperAdmin;

              return (
                <tr
                  key={user.id}
                  className="hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors group"
                >
                  <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                    {startIndex + index + 1}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700 overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-4 h-4 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]" />
                        )}
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-md border-2 border-white dark:border-zinc-900 ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                            {user.name}
                          </p>
                          {user.verified && (
                            <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 px-1 rounded-md">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getRoleColor(user.role)}`}>
                      {formatRoleLabel(user.role)}
                    </span>
                  </td>

                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getStatusColor(user.status, isOnline)}`}>
                      <span className={`w-1.5 h-1.5 rounded-md ${isOnline ? 'bg-emerald-500 animate-pulse' : (String(user.status || '').toLowerCase() === 'suspended' ? 'bg-rose-500' : 'bg-slate-400 dark:bg-zinc-500')}`} />
                      {user.status || 'Active'}
                    </span>
                  </td>

                  <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted-light)] shrink-0" />
                      <span>{user.lastActive || 'Just now'}</span>
                    </div>
                  </td>

                  <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">
                    {user.phone || '—'}
                  </td>

                  <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleView(user)}
                        className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => canModifyRow && handleEdit(user)}
                        disabled={!canModifyRow}
                        className={`p-1.5 rounded-md transition-all cursor-pointer ${
                          canModifyRow 
                            ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 active:scale-90 hover:scale-105' 
                            : 'text-gray-300 dark:text-zinc-600 cursor-not-allowed opacity-50'
                        }`}
                        title={canModifyRow ? "Edit User" : "Only Super Admin can modify Super Admin accounts"}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => canModifyRow && handleDeleteItem(user.id)}
                        disabled={!canModifyRow}
                        className={`p-1.5 rounded-md transition-all cursor-pointer ${
                          canModifyRow 
                            ? 'text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] active:scale-90 hover:scale-105' 
                            : 'text-gray-300 dark:text-zinc-600 cursor-not-allowed opacity-50'
                        }`}
                        title={canModifyRow ? "Delete User" : "Only Super Admin can delete Super Admin accounts"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" className="text-center py-12 px-4">
                <UserIcon className="w-12 h-12 text-blue-500 mx-auto mb-2 opacity-80" />
                <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
                  No users found
                </h3>
                <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                  Try adjusting your search or filter criteria
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
