import { useEffect } from 'react';
import { X, User, Check, Edit, MapPin } from "lucide-react";
import { getUserStatusColor as getStatusColor, getRoleColor } from '../../utils/StatusUtils';
import { normalizeRole } from '../../services/authService';
import { useLanguage } from '../../i18n';

export default function UserDetailsModal({ isOpen, user, onClose, onEdit, onEditUser }) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen && user) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, user, onClose]);

  if (!isOpen && !user) return null;
  if (isOpen === false) return null;
  if (!user) return null;

  const handleEditClick = onEdit || onEditUser || (() => {});

  const getRoleText = (role) => {
    const norm = normalizeRole(role);
    switch (norm) {
      case 'super_admin': return t('users.roleSuperAdmin', 'Super Admin');
      case 'admin': return t('users.roleAdmin', 'Admin');
      case 'guide_editor':
      case 'tourism_content_editor': return t('users.roleGuideEditor', 'Tourism Content Editor');
      case 'business_owner': return t('users.roleBusinessOwner', 'Business Owner');
      default: return t('users.roleUser', 'User');
    }
  };

  const getStatusText = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'suspended') return t('users.statusSuspended', 'Suspended');
    if (s === 'inactive') return t('users.statusInactive', 'Inactive');
    if (s === 'active') return t('users.statusActive', 'Active');
    return status || t('users.statusActive', 'Active');
  };

  const getSubscriptionText = (sub) => {
    const s = String(sub || '').toLowerCase();
    if (s === 'premium') return t('users.subPremium', 'Premium');
    if (s === 'basic') return t('users.subBasic', 'Basic');
    return t('users.subFree', 'Free');
  };

  const lastActiveTime = user.lastActive || '—';

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark-modal)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] rounded-md max-w-lg w-full shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden animate-alert-popup flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)]">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] flex items-center justify-center shrink-0 border border-[var(--color-info-border)] overflow-hidden">
              {typeof user.avatar === "string" ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-wide">
                {t('users.detailsModalTitle', 'User Account Details')}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:text-[var(--color-text-primary-light)] dark:hover:text-[var(--color-white)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {t('users.labelFullName', 'Full Name')}
            </span>
            <p className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 flex items-center gap-2">
              {user.name}
              {user.verified && (
                <span className="text-xs px-2 py-0.5 bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] rounded-md border border-[var(--color-info-border)] dark:border-[var(--color-info-dark-border)] inline-flex items-center gap-1">
                  <Check className="w-3 h-3" /> {t('users.badgeVerified', 'Verified')}
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-input-dark-bg)]/50 p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                {t('users.labelEmail', 'Email')}
              </span>
              <p className="text-sm font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 truncate">{user.email}</p>
            </div>
            <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-input-dark-bg)]/50 p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                {t('users.labelPhone', 'Phone')}
              </span>
              <p className="text-sm font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 truncate">{user.phone || "—"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-input-dark-bg)]/50 p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                {t('users.labelRoleStatus', 'Role & Status')}
              </span>
              <p className="text-sm font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 flex items-center gap-1.5 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getRoleColor(user.role)}`}>{getRoleText(user.role)}</span> · 
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getStatusColor(user.status, Boolean(user.is_online || user.onlineStatus === 'Online'))}`}>
                  <span className={`w-1.5 h-1.5 rounded-md ${Boolean(user.is_online || user.onlineStatus === 'Online') ? 'bg-emerald-500 animate-pulse' : (String(user.status || '').toLowerCase() === 'suspended' ? 'bg-rose-500' : 'bg-slate-400 dark:bg-zinc-500')}`} />
                  {getStatusText(user.status)}
                </span>
              </p>
            </div>
            <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-input-dark-bg)]/50 p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                {t('users.labelSubscription', 'Subscription')}
              </span>
              <p className="text-sm font-medium text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)] mt-1">{getSubscriptionText(user.subscription)}</p>
            </div>
          </div>

          <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-input-dark-bg)]/50 p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {t('users.labelLocationActivity', 'Location & Activity')}
            </span>
            <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1 flex items-center justify-between">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]" /> {user.location || "—"}</span>
              <span className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                {t('users.lastActiveLabel', 'Last active: {time}', { time: lastActiveTime })}
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark-modal)]">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] text-xs font-semibold hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] transition-colors cursor-pointer"
          >
            {t('users.btnClose', 'Close')}
          </button>
          <button
            type="button"
            onClick={() => {
              const usr = user;
              onClose();
              handleEditClick(usr);
            }}
            className="py-2 px-4 rounded-md bg-[#003E83] hover:bg-[#002e62] text-white font-medium text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            {t('users.btnEditUser', 'Edit User')}
          </button>
        </div>
      </div>
    </div>
  );
}
