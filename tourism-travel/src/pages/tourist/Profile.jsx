import { useState, useEffect } from 'react';
import { 
  Lock, 
  ShieldAlert, 
  Save, 
  Camera, 
  Loader2, 
  LogOut,
  CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import authService from '../../services/authService';
import travelService from '../../services/travelService';
import GoogleButton, { GoogleIcon } from '../../components/common/GoogleButton';

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const { showSuccess, showError, showConfirm } = useAlert();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'privacy'

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || 'Siem Reap');
  const [bio, setBio] = useState(user?.bio || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Deletion request
  const [deletionReason, setDeletionReason] = useState('');
  const [isSubmittingDeletion, setIsSubmittingDeletion] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setLocation(user.location || 'Siem Reap');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await authService.updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      if (res?.success) {
        showSuccess('Your profile details have been saved successfully.');
        refreshUser();
      }
    } catch (err) {
      showError(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      showError('New password must be at least 8 characters.');
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
      message: 'Are you sure you wish to disconnect your Google account? You will need your email and password to log in.',
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

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('Image file size must be less than 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await authService.uploadAvatar(formData);
      if (res?.success) {
        showSuccess('Profile photo updated.');
        refreshUser();
      }
    } catch (err) {
      showError(err.message || 'Failed to upload profile photo.');
    }
  };

  const handleDeleteAccountRequest = async (e) => {
    e.preventDefault();
    const confirmed = await showConfirm({
      title: 'Submit Account Deletion Request',
      message: 'Are you sure you wish to submit an official account erasure request to the Ministry Super Administrator?',
      confirmText: 'Submit Request',
      type: 'danger',
    });

    if (!confirmed) return;

    setIsSubmittingDeletion(true);
    try {
      const res = await travelService.createDeletionRequest({
        request_type: 'account',
        reason: deletionReason.trim() || 'User requested GDPR/account erasure',
      });
      if (res?.success) {
        showSuccess('Your deletion request has been submitted to system administration for review.', 'Request Submitted');
        setDeletionReason('');
      }
    } catch (err) {
      showError(err.message || 'Failed to submit deletion request.');
    } finally {
      setIsSubmittingDeletion(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="text-xs font-semibold text-[#003E83] dark:text-blue-400 uppercase tracking-wider mb-1">
          Account Management
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Personal Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Update your contact details, security credentials, and travel preferences.
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center gap-5">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#003E83] to-blue-600 text-white flex items-center justify-center text-2xl font-black ring-4 ring-blue-500/20 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name ? user.name.charAt(0).toUpperCase() : 'U'
            )}
          </div>
          <label 
            htmlFor="avatar-upload" 
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#003E83] text-white shadow-md cursor-pointer hover:bg-[#002e62] transition"
            title="Upload new photo"
          >
            <Camera size={14} />
            <input 
              id="avatar-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleAvatarChange} 
              className="hidden" 
            />
          </label>
        </div>

        <div className="text-center sm:text-left flex-1">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            {user?.name || 'Explorer'}
          </h2>
          <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {user?.email}
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#003E83] dark:text-blue-300 text-[11px] font-bold">
              Role: {user?.role || 'Tourist'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
              Status: {user?.status || 'Active'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3 border-b-2 transition cursor-pointer ${
            activeTab === 'profile'
              ? 'border-[#003E83] text-[#003E83] dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
          }`}
        >
          Profile Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-3 border-b-2 transition cursor-pointer ${
            activeTab === 'security'
              ? 'border-[#003E83] text-[#003E83] dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
          }`}
        >
          Password & Security
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('privacy')}
          className={`pb-3 px-3 border-b-2 transition cursor-pointer ${
            activeTab === 'privacy'
              ? 'border-[#003E83] text-[#003E83] dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
          }`}
        >
          Privacy & Account Erasure
        </button>
      </div>

      {/* Tab 1: Profile Details */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+855 12 345 678"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Current Location / Province
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
              >
                <option value="Siem Reap">Siem Reap</option>
                <option value="Phnom Penh">Phnom Penh</option>
                <option value="Battambang">Battambang</option>
                <option value="Kampot">Kampot</option>
                <option value="Kep">Kep</option>
                <option value="Preah Sihanouk">Preah Sihanouk (Kompong Som)</option>
                <option value="Koh Kong">Koh Kong</option>
                <option value="Mondulkiri">Mondulkiri</option>
                <option value="Ratanakiri">Ratanakiri</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Preferred Interface Language
              </label>
              <select
                defaultValue="en"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
              >
                <option value="en">English (Official)</option>
                <option value="km">ខ្មែរ (Khmer)</option>
                <option value="fr">Français (French)</option>
                <option value="zh">中文 (Chinese)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Travel Interests & Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Passionate travel photographer fascinated by ancient Khmer temple carvings and street cuisine."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-6 py-2.5 rounded-xl bg-[#003E83] hover:bg-[#002e62] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              {isUpdatingProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-lg">
          {/* Google Account Connection Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                  <GoogleIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Google Account</span>
                    {user?.provider === 'google' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        Connected
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-[10px] font-bold">
                        Not Connected
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    {user?.provider === 'google'
                      ? `Linked with ${user?.provider_email || user?.email}`
                      : 'Connect your Google account for single-click sign-in and avatar sync.'}
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
              <div className="pt-2">
                <GoogleButton
                  text="Connect with Google Account"
                  role="user"
                />
              </div>
            )}
          </div>

          <form onSubmit={handlePasswordSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock size={16} className="text-[#003E83] dark:text-blue-400" />
              <span>Change Account Password</span>
            </h3>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white"
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
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white"
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
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-6 py-2.5 rounded-xl bg-[#003E83] hover:bg-[#002e62] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              {isUpdatingPassword ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>
      )}

      {/* Tab 3: Privacy & Account Erasure */}
      {activeTab === 'privacy' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4 max-w-lg">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 leading-relaxed">
            <strong className="block mb-1">GDPR & Right to Erasure:</strong>
            You may request permanent deletion of your profile, bookings history, and personal identifiable information. Submissions are reviewed and processed by the Ministry Super Administrator.
          </div>

          <form onSubmit={handleDeleteAccountRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Reason for Account Erasure
              </label>
              <textarea
                rows={3}
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="Please state why you want to delete your AngkorVerses tourist account..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingDeletion}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <ShieldAlert size={15} />
              <span>{isSubmittingDeletion ? 'Submitting...' : 'Submit Deletion Request'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
