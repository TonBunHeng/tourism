import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Lock, 
  Store, 
  CheckCircle2, 
  Clock, 
  Save, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import authService from '../../services/authService';
import GoogleButton, { GoogleIcon } from '../../components/common/GoogleButton';

export default function BusinessSettings() {
  const { user, refreshUser } = useAuth();
  const { selectedBusiness } = useOutletContext();
  const { showSuccess, showError, showConfirm } = useAlert();

  // Password Update
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Notification Toggles
  const [notifyBookings, setNotifyBookings] = useState(true);
  const [notifyReviews, setNotifyReviews] = useState(true);
  const [notifyMarketing, setNotifyMarketing] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      showError('Password must be at least 8 characters.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await authService.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      if (res?.success) {
        showSuccess('Your password has been changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      showError(err.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    const confirmed = await showConfirm({
      title: 'Disconnect Google Account',
      message: 'Are you sure you wish to disconnect your Google account from this business portal? You will need your email and password to log in.',
      confirmText: 'Disconnect Google',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      await authService.disconnectGoogle();
      showSuccess('Google account disconnected successfully.');
      refreshUser();
    } catch (err) {
      showError(err.message || 'Failed to disconnect Google account.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <div className="text-xs font-semibold text-[#003E83] dark:text-blue-400 uppercase tracking-wider mb-1">
          Preferences & Security
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Business Owner Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Manage your credentials, business verification state, and notification preferences.
        </p>
      </div>

      {/* Business Verification Summary */}
      {selectedBusiness && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Store size={18} className="text-[#003E83] dark:text-blue-400" />
              <span>Business Registration & Verification</span>
            </h3>

            {selectedBusiness.verification_status === 'approved' ? (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>Verified Business</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold flex items-center gap-1.5">
                <Clock size={13} />
                <span>Pending Ministry Verification</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-zinc-300 pt-2">
            <div><strong>Registered Name:</strong> {selectedBusiness.name}</div>
            <div><strong>Province:</strong> {selectedBusiness.province?.name || 'Cambodia'}</div>
            <div><strong>Category:</strong> {selectedBusiness.category?.name || 'Tourism'}</div>
          </div>
        </div>
      )}

      {/* Google Account Connection Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
              <GoogleIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Google Account Integration</span>
                {user?.provider === 'google' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-[10px] font-bold">
                    Not Connected
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {user?.provider === 'google'
                  ? `Linked with ${user?.provider_email || user?.email}. You can sign in using one-click Google OAuth.`
                  : 'Connect your merchant Google account to enable instant single sign-on.'}
              </p>
            </div>
          </div>
        </div>

        {user?.provider === 'google' ? (
          <div className="pt-2 flex items-center justify-between gap-3 text-xs border-t border-slate-100 dark:border-zinc-800">
            <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
              Google ID: <code className="font-mono text-slate-700 dark:text-zinc-300">{user.provider_id || 'Linked'}</code>
            </span>
            <button
              type="button"
              onClick={handleDisconnectGoogle}
              className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition cursor-pointer"
            >
              Disconnect Google
            </button>
          </div>
        ) : (
          <div className="pt-2 max-w-sm">
            <GoogleButton
              text="Connect with Google Account"
              role="business_owner"
            />
          </div>
        )}
      </div>

      {/* Password Management */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock size={18} className="text-[#003E83] dark:text-blue-400" />
          <span>Change Password</span>
        </h3>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              New Password (min 8 characters)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-6 py-2.5 rounded-xl bg-[#003E83] hover:bg-[#002e62] disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              {isUpdatingPassword ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>Save New Password</span>
            </button>
          </div>
        </form>
      </div>

      {/* Notifications Preferences */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Alert Preferences
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-white">New Booking Notifications</div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400">Receive alerts when travelers reserve your services</div>
            </div>
            <input
              type="checkbox"
              checked={notifyBookings}
              onChange={(e) => setNotifyBookings(e.target.checked)}
              className="w-4 h-4 rounded text-[#003E83] focus:ring-[#003E83]"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-white">Customer Review Alerts</div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400">Be notified when guests submit reviews or ratings</div>
            </div>
            <input
              type="checkbox"
              checked={notifyReviews}
              onChange={(e) => setNotifyReviews(e.target.checked)}
              className="w-4 h-4 rounded text-[#003E83] focus:ring-[#003E83]"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-white">Tourism Campaign & Policy Updates</div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400">Receive announcements from the Ministry of Tourism</div>
            </div>
            <input
              type="checkbox"
              checked={notifyMarketing}
              onChange={(e) => setNotifyMarketing(e.target.checked)}
              className="w-4 h-4 rounded text-[#003E83] focus:ring-[#003E83]"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
