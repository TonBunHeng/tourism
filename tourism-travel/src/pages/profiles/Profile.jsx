import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Lock, 
  Trash2, 
  Upload, 
  Loader2,
  Compass,
  CalendarCheck,
  Heart,
  ShieldCheck,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTravel } from '../../context/TravelContext';
import { useAlert } from '../../context/AlertContext';
import { authService } from '../../services/authService';
import ProfileHeader from './ProfileHeader';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, uploadAvatar, deleteAvatar, openAuthModal, isAuthenticated, logout } = useAuth();
  const { showToast, wishlistCount } = useTravel();
  const { showSuccess, showError, showWarning, showConfirm } = useAlert();

  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setBio(user.bio || '');
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-zinc-800 text-[#003E83] dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Sign in to View Profile</h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
          Please sign in to your tourist or partner account to access your profile, saved trips, and booking history.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-bold rounded-2xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const handleLogout = async () => {
    const confirmed = await showConfirm({
      title: 'Logout Confirmation',
      message: 'Are you sure you want to sign out of your account?',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      type: 'logout'
    });

    if (confirmed) {
      await logout();
      showToast('Signed out successfully', 'info');
      navigate('/');
    }
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file (PNG, JPG, JPEG, WEBP).', 'Invalid File');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('Profile image file size must be less than 5MB.', 'File Too Large');
      return;
    }

    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      showToast('Profile photo updated!', 'success');
      showSuccess('Your profile photo has been updated successfully.', 'Photo Updated');
    } catch (err) {
      showError(err.message || 'Failed to upload profile photo.', 'Upload Failed');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    const confirmed = await showConfirm({
      title: 'Remove Profile Photo',
      message: 'Are you sure you want to remove your profile photo? Your avatar will revert to your name initial.',
      confirmText: 'Remove Photo',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    setUploadingAvatar(true);
    try {
      await deleteAvatar();
      showToast('Profile photo removed.', 'info');
      showSuccess('Your profile photo has been removed.', 'Photo Removed');
    } catch (err) {
      showError(err.message || 'Failed to remove profile photo.', 'Error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    setProfileMessage('');

    try {
      await updateProfile({ name, phone, location, bio });
      showToast('Profile updated successfully!', 'success');
      showSuccess('Your personal profile details have been saved successfully.', 'Profile Saved');
      setProfileMessage('Your profile changes have been saved.');
    } catch (err) {
      showError(err.message || 'Failed to update profile details.', 'Update Failed');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      showWarning('New password and confirmation password do not match.', 'Password Mismatch');
      return;
    }

    setLoadingPassword(true);
    try {
      await authService.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      showToast('Password changed successfully!', 'success');
      showSuccess('Your account password has been updated successfully.', 'Password Updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password');
      showError(err.message || 'Current password was incorrect.', 'Password Update Failed');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <Breadcrumb items={[{ label: 'My Profile' }]} />
      <ProfileHeader onLogout={handleLogout} />

      {/* Hidden file input for avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleAvatarSelect}
        className="hidden"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Avatar & Quick Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center space-y-4 shadow-sm transition-all">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#003E83] to-blue-600 text-white flex items-center justify-center text-4xl font-extrabold ring-4 ring-blue-100 dark:ring-blue-950/60 shadow-lg overflow-hidden relative">
                {uploadingAvatar ? (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                ) : user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user?.name?.charAt(0) || 'U'}</span>
                )}
              </div>

              {/* Camera Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-1 right-1 p-2 rounded-full bg-[#003E83] hover:bg-[#002e62] text-white shadow-md ring-2 ring-white dark:ring-zinc-900 transition-transform hover:scale-110 cursor-pointer disabled:opacity-50"
                title="Upload / Change profile photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 w-full">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white truncate">
                {user?.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 truncate flex items-center justify-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>{user?.email}</span>
              </p>
            </div>

            {/* Photo Actions: Upload / Change / Delete */}
            <div className="flex flex-col gap-2 w-full pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="w-full py-2 px-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#003E83] dark:text-blue-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{user?.avatar ? 'Change Profile Photo' : 'Upload Profile Photo'}</span>
              </button>

              {user?.avatar && (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  disabled={uploadingAvatar}
                  className="w-full py-2 px-3 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>

            {/* Role & Status Capsules */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800 w-full justify-center">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-[#003E83] dark:bg-blue-950 dark:text-blue-300 uppercase tracking-wider">
                {(user?.role || 'Traveler').replace('_', ' ')}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>{user?.status || 'Active'}</span>
              </span>
            </div>
          </div>

          {/* Quick Travel Center */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-3">
            <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
              Travel Shortcuts
            </h4>
            <div className="space-y-2">
              <Link
                to="/trips"
                className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all font-bold text-xs text-gray-800 dark:text-zinc-200"
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
                  <span>My Trips & Itineraries</span>
                </div>
                <span className="text-gray-400">→</span>
              </Link>
              <Link
                to="/bookings"
                className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all font-bold text-xs text-gray-800 dark:text-zinc-200"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>My Bookings</span>
                </div>
                <span className="text-gray-400">→</span>
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all font-bold text-xs text-gray-800 dark:text-zinc-200"
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Saved Wishlist ({wishlistCount})</span>
                </div>
                <span className="text-gray-400">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile & Password Cards */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Edit Profile Form Card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm transition-all">
            <div className="border-b border-gray-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
                  <span>Personal Details</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                  Update your contact info and personal travel biography
                </p>
              </div>
            </div>

            {profileMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-bold">{profileMessage}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/70 text-gray-900 dark:text-white text-xs rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Email Address (Read Only)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-gray-100/80 dark:bg-zinc-800/40 text-gray-500 dark:text-zinc-400 text-xs rounded-2xl border border-gray-200 dark:border-zinc-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="+855 12 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/70 text-gray-900 dark:text-white text-xs rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Current Province / City
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Siem Reap, Cambodia"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/70 text-gray-900 dark:text-white text-xs rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                  Travel Biography
                </label>
                <textarea
                  rows={3}
                  placeholder="Share a short bio, your favorite Angkor temples, or travel interests across Cambodia..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800/70 text-gray-900 dark:text-white text-xs rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={loadingProfile}
                  className="px-5 py-2.5 bg-[#003E83] hover:bg-[#002e62] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-extrabold rounded-2xl shadow-md transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {loadingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm transition-all">
            <div className="border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Security & Credentials</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Update your account password to ensure your account remains safe
              </p>
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/80 rounded-2xl text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="font-bold">{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                  Current Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/70 text-gray-900 dark:text-white text-xs rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/70 text-gray-900 dark:text-white text-xs rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/70 text-gray-900 dark:text-white text-xs rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-[#003E83] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={loadingPassword}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-extrabold rounded-2xl shadow-md transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {loadingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
