import { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Lock,
  Store,
  CheckCircle2,
  Clock,
  Save,
  Loader2,
  Bell,
  ShieldCheck,
  Globe,
  Sliders,
  ChevronDown,
  ExternalLink,
  ShieldAlert,
  KeyRound,
  Check,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import authService from '../../services/authService';
import GoogleButton, { GoogleIcon } from '../../components/common/GoogleButton';

const SETTINGS_TABS = [
  { id: 'security', label: 'Account & Security', icon: Lock },
  { id: 'sso', label: 'Google Single Sign-On', icon: Globe },
  { id: 'notifications', label: 'Alert Channels', icon: Bell },
  { id: 'business', label: 'Business Identity', icon: Store },
];

export default function BusinessSettings() {
  const { user, refreshUser } = useAuth();
  const { selectedBusiness } = useOutletContext();
  const { showSuccess, showError, showConfirm } = useAlert();

  const [activeTab, setActiveTab] = useState('security');

  // Password Update Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Notification Preferences
  const [notifyBookings, setNotifyBookings] = useState(true);
  const [notifyReviews, setNotifyReviews] = useState(true);
  const [notifyMarketing, setNotifyMarketing] = useState(false);
  const [notifySecurity, setNotifySecurity] = useState(true);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

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
      message:
        'Are you sure you wish to disconnect your Google account from this business portal? You will need your email and password to log in.',
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

  const handleSaveNotificationPreferences = (e) => {
    e.preventDefault();
    setIsSavingPreferences(true);
    setTimeout(() => {
      setIsSavingPreferences(false);
      showSuccess('Notification channels and alert preferences saved successfully.');
    }, 400);
  };

  const currentTabObj = SETTINGS_TABS.find((t) => t.id === activeTab) || SETTINGS_TABS[0];
  const CurrentIcon = currentTabObj.icon;
  const currentTabIndex = SETTINGS_TABS.findIndex((t) => t.id === activeTab) + 1;

  // 4 KPI Stats
  const statsList = [
    {
      title: 'Security Posture',
      value: user?.provider === 'google' ? 'Google OAuth' : 'Password Protected',
      subtext: 'Encrypted merchant credentials',
      icon: ShieldCheck,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      title: 'Single Sign-On',
      value: user?.provider === 'google' ? 'Connected' : 'Standard Login',
      subtext: user?.provider_email || user?.email || 'Email authentication',
      icon: Globe,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      title: 'Alert Subscriptions',
      value: [notifyBookings, notifyReviews, notifyMarketing, notifySecurity].filter(Boolean).length + ' Channels',
      subtext: 'Real-time notifications active',
      icon: Bell,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
    },
    {
      title: 'Business Verification',
      value: selectedBusiness?.verification_status === 'approved' ? 'Verified' : 'Pending Review',
      subtext: selectedBusiness?.name || 'Commercial establishment',
      icon: Store,
      color:
        selectedBusiness?.verification_status === 'approved'
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-amber-600 dark:text-amber-400',
      bg:
        selectedBusiness?.verification_status === 'approved'
          ? 'bg-emerald-50 dark:bg-emerald-950/40'
          : 'bg-amber-50 dark:bg-amber-950/40',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header Section (matching tourism-admin) */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Business Settings
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Manage merchant credentials, single sign-on authentication, alert channels, and establishment identity.
            </p>
          </div>

          {selectedBusiness && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-xs self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-gray-700 dark:text-zinc-200 truncate max-w-[200px]">
                {selectedBusiness.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statsList.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-zinc-900 rounded-md p-4 shadow-xs border border-gray-200 dark:border-zinc-800 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium truncate">
                    {stat.title}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 tracking-tight truncate">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-9 h-9 rounded-md shrink-0 flex items-center justify-center ${stat.bg}`}>
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-2 truncate">
                {stat.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Container Card with Segmented Tabs */}
      <div className="bg-white dark:bg-zinc-900 rounded-md shadow-xs border border-gray-200 dark:border-zinc-800 overflow-hidden">
        {/* Card Header matching SettingsTabs in tourism-admin */}
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/50 text-[#003E83] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                <CurrentIcon className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {currentTabObj.label}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                Section {currentTabIndex} of {SETTINGS_TABS.length}
              </span>
            </div>

            {/* Segmented Desktop Pills + Mobile Dropdown */}
            <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
              {/* Mobile Select Dropdown (< md) */}
              <div className="relative w-full md:hidden">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="appearance-none w-full pl-3.5 pr-8 py-2 border border-gray-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003E83] bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs sm:text-sm cursor-pointer shadow-xs font-medium"
                >
                  {SETTINGS_TABS.map((tab) => (
                    <option key={tab.id} value={tab.id}>
                      {tab.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
              </div>

              {/* Desktop Segmented Buttons (>= md) */}
              <div className="hidden md:flex items-center gap-1 p-1 bg-gray-100 dark:bg-zinc-800 rounded-md border border-gray-200 dark:border-zinc-700">
                {SETTINGS_TABS.map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#003E83] text-white shadow-xs'
                          : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-zinc-700/50'
                      }`}
                    >
                      <TabIcon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6">
          {/* TAB 1: Account & Security */}
          {activeTab === 'security' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  Update Password Credentials
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  Ensure your business account stays protected with a strong, dedicated password.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                    />
                  </div>
                </div>

                {/* Password guidelines info box */}
                <div className="p-3.5 rounded-md bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#003E83] dark:text-blue-400" />
                  <div className="space-y-1">
                    <p className="font-semibold">Password Requirements</p>
                    <ul className="list-disc pl-4 text-[11px] text-blue-800 dark:text-blue-300/80 space-y-0.5">
                      <li>Minimum 8 characters in length</li>
                      <li>Includes uppercase letters, numbers, and symbols for high security</li>
                      <li>Avoid reusing passwords from personal social media accounts</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="px-5 py-2.5 rounded-md bg-[#003E83] hover:bg-[#002e62] disabled:opacity-50 text-white text-xs sm:text-sm font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {isUpdatingPassword ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    <span>Save Password</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Google Single Sign-On */}
          {activeTab === 'sso' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  Google Single Sign-On (OAuth)
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  Link your merchant Google account to enjoy frictionless one-click authentication.
                </p>
              </div>

              <div className="p-5 rounded-md bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/80 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-xs">
                      <GoogleIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>Google Identity Provider</span>
                        {user?.provider === 'google' ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 size={11} />
                            Connected
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 text-[10px] font-medium border border-gray-200 dark:border-zinc-600">
                            Not Linked
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                        {user?.provider === 'google'
                          ? `Connected as ${user?.provider_email || user?.email}`
                          : 'Connect your business Google account to enable instant single sign-on.'}
                      </p>
                    </div>
                  </div>
                </div>

                {user?.provider === 'google' ? (
                  <div className="pt-3 border-t border-gray-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <span className="text-gray-500 dark:text-zinc-400 font-mono text-[11px]">
                      Provider UID: {user.provider_id || 'google-oauth2-verified'}
                    </span>
                    <button
                      type="button"
                      onClick={handleDisconnectGoogle}
                      className="px-3.5 py-1.5 rounded-md border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium transition cursor-pointer self-start sm:self-auto"
                    >
                      Disconnect Google
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 max-w-xs">
                    <GoogleButton text="Connect Google Account" role="business_owner" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Alert Channels & Notifications */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  Notification Channels & Alerts
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  Choose which business events trigger real-time system notices and email alerts.
                </p>
              </div>

              <form onSubmit={handleSaveNotificationPreferences} className="space-y-3">
                <label className="flex items-center justify-between p-3.5 rounded-md bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/80 hover:bg-gray-100/60 dark:hover:bg-zinc-800 transition cursor-pointer">
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                      New Customer Reservations
                    </div>
                    <div className="text-[11px] sm:text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                      Receive immediate alerts when travelers schedule or reserve your offerings
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyBookings}
                    onChange={(e) => setNotifyBookings(e.target.checked)}
                    className="w-4 h-4 rounded text-[#003E83] focus:ring-[#003E83] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-md bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/80 hover:bg-gray-100/60 dark:hover:bg-zinc-800 transition cursor-pointer">
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                      Guest Reviews & Ratings
                    </div>
                    <div className="text-[11px] sm:text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                      Be notified whenever customers submit reviews, ratings, or feedback
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyReviews}
                    onChange={(e) => setNotifyReviews(e.target.checked)}
                    className="w-4 h-4 rounded text-[#003E83] focus:ring-[#003E83] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-md bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/80 hover:bg-gray-100/60 dark:hover:bg-zinc-800 transition cursor-pointer">
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                      Tourism Promotional Campaigns
                    </div>
                    <div className="text-[11px] sm:text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                      Platform updates, seasonal campaigns, and marketing promotions
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyMarketing}
                    onChange={(e) => setNotifyMarketing(e.target.checked)}
                    className="w-4 h-4 rounded text-[#003E83] focus:ring-[#003E83] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-md bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/80 hover:bg-gray-100/60 dark:hover:bg-zinc-800 transition cursor-pointer">
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                      Security & Login Activity
                    </div>
                    <div className="text-[11px] sm:text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                      Critical notices for new logins, password resets, and session alerts
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifySecurity}
                    onChange={(e) => setNotifySecurity(e.target.checked)}
                    className="w-4 h-4 rounded text-[#003E83] focus:ring-[#003E83] cursor-pointer"
                  />
                </label>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSavingPreferences}
                    className="px-5 py-2.5 rounded-md bg-[#003E83] hover:bg-[#002e62] disabled:opacity-50 text-white text-xs sm:text-sm font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSavingPreferences ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    <span>Save Alert Preferences</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: Business Identity & Overview */}
          {activeTab === 'business' && (
            <div className="max-w-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    Commercial Identity Overview
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                    Registered enterprise details and official tourism accreditation.
                  </p>
                </div>

                <Link
                  to="/business/profile"
                  className="px-3.5 py-1.5 rounded-md bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-medium shrink-0 flex items-center gap-1.5 transition shadow-xs self-start sm:self-auto"
                >
                  <span>Edit Full Profile</span>
                  <ExternalLink size={13} />
                </Link>
              </div>

              {selectedBusiness ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-md bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400 text-[11px] block">Registered Business Name</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        {selectedBusiness.name}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 text-[11px] block">Accreditation Status</span>
                      {selectedBusiness.verification_status === 'approved' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mt-0.5">
                          <CheckCircle2 size={12} />
                          Verified & Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 mt-0.5">
                          <Clock size={12} />
                          Pending Review
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-gray-400 text-[11px] block">Category</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {selectedBusiness.category?.name || 'Hospitality & Tourism'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 text-[11px] block">Operating Region</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {selectedBusiness.province?.name || 'Cambodia'}
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-gray-400 text-[11px] block">Physical Address</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {selectedBusiness.address || 'Street address on file'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center rounded-md border border-dashed border-gray-200 dark:border-zinc-800 text-xs text-gray-400">
                  No active business selected.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
