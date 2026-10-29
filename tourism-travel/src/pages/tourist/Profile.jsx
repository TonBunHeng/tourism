import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User,
  Lock, 
  ShieldAlert, 
  Save, 
  Camera, 
  Loader2, 
  LogOut,
  CheckCircle2,
  CalendarCheck,
  Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import authService from '../../services/authService';
import travelService from '../../services/travelService';
import GoogleButton, { GoogleIcon } from '../../components/common/GoogleButton';

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const { showSuccess, showError, showConfirm } = useAlert();

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">
            Account Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Personal Profile & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Update your contact details, security credentials, and travel preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Profile Overview Card (Hero Banner) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#002D62] to-blue-600 text-white flex items-center justify-center text-2xl font-black ring-4 ring-blue-500/20 overflow-hidden shadow-md">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <label 
              htmlFor="avatar-upload" 
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#002D62] text-white shadow-md cursor-pointer hover:bg-[#001f44] transition"
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

          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {user?.name || 'Explorer'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#002D62] dark:text-blue-300 text-[11px] font-bold">
                Role: {user?.role || 'Tourist'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                Status: {user?.status || 'Active'}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400">
              {user?.email}
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1 flex items-center justify-center sm:justify-start gap-2">
              <span>Location: <strong className="text-slate-700 dark:text-zinc-200">{location || 'Cambodia'}</strong></span>
              <span>•</span>
              <span>Account ID: <code className="font-mono text-[11px] text-slate-600 dark:text-zinc-300">#{user?.id || '—'}</code></span>
            </div>
          </div>
        </div>

        {/* Quick Travel Shortcuts */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-center">
          <Link
            to="/bookings"
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <CalendarCheck size={14} className="text-[#002D62] dark:text-blue-400" />
            <span>My Bookings</span>
          </Link>
          <Link
            to="/favorites"
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Heart size={14} className="text-rose-500" />
            <span>Saved Wishlist</span>
          </Link>
        </div>
      </div>

      {/* 3 Main Settings Cards (Top 3 Grid matching Festivals & Events / Destinations) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Card 1: Profile Details & Preferences */}
        <div className="flex flex-col justify-between rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all overflow-hidden">
          <form onSubmit={handleProfileSubmit} className="flex flex-col h-full justify-between">
            <div>
              {/* Card Header */}
              <div className="p-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-bold text-[#002D62] dark:text-blue-400 uppercase tracking-wider">
                  <User size={14} />
                  <span>Personal Info</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  Profile Details & Bio
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Update your contact details and regional language.
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+855 12 345 678"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Current Location / Province
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
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
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Preferred Language
                  </label>
                  <select
                    defaultValue="en"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  >
                    <option value="en">English (Official)</option>
                    <option value="km">ខ្មែរ (Khmer)</option>
                    <option value="fr">Français (French)</option>
                    <option value="zh">中文 (Chinese)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Travel Interests & Bio
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="e.g. Passionate explorer fascinated by ancient Khmer temples..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>
              </div>
            </div>

            {/* Card Footer with Action Button */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-800/30 flex items-center justify-end">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#002D62] hover:bg-[#001f44] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isUpdatingProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Password & Security */}
        <div className="flex flex-col justify-between rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all overflow-hidden">
          <form onSubmit={handlePasswordSubmit} className="flex flex-col h-full justify-between">
            <div>
              {/* Card Header */}
              <div className="p-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-bold text-[#002D62] dark:text-blue-400 uppercase tracking-wider">
                  <Lock size={14} />
                  <span>Security & Login</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  Password & OAuth
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Manage your credentials and federated sign-in.
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                {/* Google OAuth Section */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shadow-xs">
                        <GoogleIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Google OAuth</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                          {user?.provider === 'google' ? 'Connected' : 'Not linked'}
                        </div>
                      </div>
                    </div>

                    {user?.provider === 'google' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                        <CheckCircle2 size={10} /> Linked
                      </span>
                    ) : null}
                  </div>

                  {user?.provider === 'google' ? (
                    <button
                      type="button"
                      onClick={handleDisconnectGoogle}
                      className="w-full py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[11px] font-bold transition cursor-pointer"
                    >
                      Disconnect Google
                    </button>
                  ) : (
                    <GoogleButton
                      text="Connect Google"
                      role="user"
                    />
                  )}
                </div>

                {/* Password fields */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002D62] transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer with Action Button */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-800/30 flex items-center justify-end">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#002D62] hover:bg-[#001f44] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isUpdatingPassword ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>

        {/* Card 3: Privacy & Erasure */}
        <div className="flex flex-col justify-between rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all overflow-hidden">
          <form onSubmit={handleDeleteAccountRequest} className="flex flex-col h-full justify-between">
            <div>
              {/* Card Header */}
              <div className="p-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  <ShieldAlert size={14} />
                  <span>Data Governance</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  Privacy & Erasure (GDPR)
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Submit an official request to permanently delete records.
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200 leading-relaxed">
                  <strong className="block mb-1 font-bold">Important Notice:</strong>
                  Account deletion requests are reviewed and fulfilled by the Ministry Super Administrator. Upon processing, all your personal details, tour bookings history, reviews, and activity records will be irreversibly removed.
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Reason for Account Erasure
                  </label>
                  <textarea
                    rows={4}
                    value={deletionReason}
                    onChange={(e) => setDeletionReason(e.target.value)}
                    placeholder="Please specify why you want to delete your account (e.g. data privacy preference, travel completed)..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Card Footer with Action Button */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-800/30 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmittingDeletion}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmittingDeletion ? <Loader2 size={15} className="animate-spin" /> : <ShieldAlert size={15} />}
                <span>{isSubmittingDeletion ? 'Submitting...' : 'Submit Request'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
