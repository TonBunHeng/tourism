import { useState } from 'react';
import { Eye, EyeOff, Trash2, AlertTriangle } from 'lucide-react';
import deletionRequestService from '../../services/deletionRequestService';
import { useAlert } from '../../context/AlertContext';

export default function SecurityTab({
  userData = {},
  setUserData = () => {},
  showPassword = false,
  setShowPassword = () => {},
  showNewPassword = false,
  setShowNewPassword = () => {},
  showConfirmPassword = false,
  setShowConfirmPassword = () => {}
}) {
  const { showWarning, showSuccess, showError } = useAlert();
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleRequestAccountDeletion = async (e) => {
    e.preventDefault();
    if (!deleteReason.trim()) {
      showWarning('Please provide a reason for your deletion request.', 'Reason Required');
      return;
    }

    setIsDeleting(true);
    try {
      await deletionRequestService.createRequest({
        request_type: 'account',
        reason: deleteReason.trim(),
        urgency: 'high',
        items: [{
          item_type: 'user',
          item_id: userData.id || undefined,
          item_name: userData.name || 'User Account',
          category: userData.role || 'User'
        }]
      });
      showSuccess('Your account deletion request has been submitted to Deletion Requests for review and approval.', 'Request Submitted');
      setShowDeleteModal(false);
      setDeleteReason('');
    } catch (err) {
      showError(err.message || 'Failed to submit account deletion request.', 'Submission Failed');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 md:p-5 shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
        <h3 className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-4">Password Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter current password"
                className="w-full px-4 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted-light)] hover:text-[var(--color-text-secondary-light)] dark:hover:text-[var(--color-text-secondary-dark)]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                className="w-full px-4 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted-light)] hover:text-[var(--color-text-secondary-light)] dark:hover:text-[var(--color-text-secondary-dark)]"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                className="w-full px-4 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted-light)] hover:text-[var(--color-text-secondary-light)] dark:hover:text-[var(--color-text-secondary-dark)]"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button className="w-full sm:w-auto px-4 py-2 bg-[var(--color-primary)] text-[var(--color-white)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors text-sm cursor-pointer">
            Update Password
          </button>
        </div>
      </div>

      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 md:p-5 shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
        <h3 className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-4">Two-Factor Authentication</h3>
        <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md">
          <div className="min-w-0">
            <p className="font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">2FA Status</p>
            <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Add an extra layer of security to your account</p>
          </div>
          <button
            type="button"
            onClick={() => setUserData({ ...userData, twoFactorAuth: !userData.twoFactorAuth })}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-md transition-colors ${
              userData.twoFactorAuth ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border-subtle-light)] dark:bg-[var(--color-surface-hover-dark)]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-md bg-[var(--color-white)] transition-transform ${
                userData.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 md:p-5 shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
        <h3 className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-4">Sessions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 p-3 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">Current Session</p>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Chrome • Phnom Penh, Cambodia</p>
              <p className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">Last active: 2 minutes ago</p>
            </div>
            <span className="text-xs px-2 py-0.5 bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)] text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] rounded-md flex-shrink-0">Active</span>
          </div>
          <div className="flex items-center justify-between gap-4 p-3 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">Mobile Session</p>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Safari • Siem Reap, Cambodia</p>
              <p className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">Last active: 2 days ago</p>
            </div>
            <button className="text-xs text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:text-[var(--color-danger-text)]/80 font-medium flex-shrink-0 cursor-pointer">Revoke</button>
          </div>
        </div>
      </div>

      {/* Danger Zone: Account Deletion Request */}
      <div className="bg-red-50/60 dark:bg-red-950/20 rounded-md p-4 md:p-5 shadow-sm border border-red-200 dark:border-red-900/50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800 dark:text-red-300 text-sm">Danger Zone: Request Account Deletion</h3>
            <p className="text-xs text-red-700/80 dark:text-red-400/80 mt-1">
              Submitting an account deletion request will send a review ticket to the Deletion Requests queue. Once approved by an administrator, your account and associated data will be permanently removed.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Request Account Deletion
            </button>
          </div>
        </div>
      </div>

      {/* Account Deletion Request Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-150">
          <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark-modal)] rounded-md max-w-md w-full shadow-lg border border-gray-200 dark:border-zinc-800 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-lg font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                Request Account Deletion
              </h3>
            </div>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] leading-relaxed">
              Are you sure you want to request deletion of your account (<strong>{userData.email || userData.name}</strong>)? This request will be sent to Deletion Requests for review.
            </p>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                Reason for Deletion *
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Please tell us why you want to delete your account..."
                rows="3"
                className="w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md px-3.5 py-2.5 text-xs text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all resize-none"
                required
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestAccountDeletion}
                disabled={isDeleting || !deleteReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
