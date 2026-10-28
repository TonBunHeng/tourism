import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Shield,
  Clock,
  Smartphone,
  ShieldCheck,
  Monitor,
  Info,
  Trash2
} from 'lucide-react';
import { useAlert } from '../../context/AlertContext';
import { useLanguage } from '../../i18n';

export default function SecurityTab({ settings, setSettings }) {
  const { t } = useLanguage();
  const { showSuccess, showConfirm } = useAlert();
  const [show2FAModal, setShow2FAModal] = useState(false);

  // Active Sessions State
  const [sessions, setSessions] = useState([
    {
      id: 'sess_1',
      device: 'MacBook Pro (Chrome 128.0)',
      location: 'Phnom Penh, Cambodia',
      ip: '103.24.58.12',
      isCurrent: true,
      lastActive: 'Active Now'
    },
    {
      id: 'sess_2',
      device: 'iPad Air (Safari iOS 18)',
      location: 'Siem Reap, Cambodia',
      ip: '119.82.251.44',
      isCurrent: false,
      lastActive: '2 hours ago'
    }
  ]);

  useEffect(() => {
    if (show2FAModal) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setShow2FAModal(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [show2FAModal]);

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRevokeSession = async (sessionId) => {
    const confirmed = await showConfirm({
      title: t('settings.revokeSessionConfirmTitle', 'Revoke Administrator Session'),
      message: t('settings.revokeSessionConfirmMsg', 'Are you sure you want to terminate this remote session? The user will be immediately logged out.'),
      confirmText: t('settings.btnRevokeConfirm', 'Revoke Session'),
      cancelText: t('common.cancel', 'Cancel'),
      type: 'danger'
    });

    if (confirmed) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      showSuccess(
        t('settings.revokeSuccessMsg', 'Remote session revoked successfully.'),
        t('settings.revokeSuccessTitle', 'Session Terminated')
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
          {t('settings.securityTitle', 'Security & Access Policies')}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
          {t('settings.securitySubtitle', 'Enforce authentication standards, session expiration timers, brute force protection, and monitor active sessions.')}
        </p>
      </div>

      {/* Card 1: Two-Factor Authentication (2FA) */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] text-[var(--color-primary)] rounded-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                {t('settings.cardTwoFactor', 'Two-Factor Authentication (2FA) Enforcement')}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                {t('settings.twoFactorSubtitle', 'Mandate one-time TOTP security codes for all administrative accounts upon login.')}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={Boolean(settings.twoFactorAuth)}
              onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-md peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-md after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
            {t('settings.twoFactorPolicyStatus', 'Policy status:')}{' '}
            <strong className="text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
              {settings.twoFactorAuth
                ? t('settings.twoFactorRequired', 'Required for all Admins')
                : t('settings.twoFactorOptional', 'Optional')}
            </strong>
          </span>
          <button
            type="button"
            onClick={() => setShow2FAModal(true)}
            className="text-xs font-semibold text-[var(--color-primary)] hover:underline cursor-pointer"
          >
            {t('settings.btnViewTwoFactorGuide', 'View 2FA Setup Guidelines')}
          </button>
        </div>
      </div>

      {/* Card 2: Session & Password Policies */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
          <Clock className="w-4 h-4 text-[var(--color-primary)]" />
          {t('settings.cardSessionPolicies', 'Session & Password Policies')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
              {t('settings.labelSessionTimeout', 'Admin Session Timeout')}
            </label>
            <select
              value={settings.sessionTimeout || '30'}
              onChange={(e) => handleChange('sessionTimeout', e.target.value)}
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
            >
              <option value="15">{t('settings.timeout15', '15 Minutes (High Security)')}</option>
              <option value="30">{t('settings.timeout30', '30 Minutes (Recommended)')}</option>
              <option value="60">{t('settings.timeout60', '1 Hour')}</option>
              <option value="240">{t('settings.timeout240', '4 Hours')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
              {t('settings.labelPasswordPolicy', 'Password Complexity Level')}
            </label>
            <select
              value={settings.passwordPolicy || 'strong'}
              onChange={(e) => handleChange('passwordPolicy', e.target.value)}
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
            >
              <option value="standard">{t('settings.policyStandard', 'Standard (8+ chars)')}</option>
              <option value="strong">{t('settings.policyStrong', 'Strong (8+ chars, numbers & symbols)')}</option>
              <option value="strict">{t('settings.policyStrict', 'Strict (12+ chars, mixed case, symbols)')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
              {t('settings.labelLoginAttempts', 'Max Failed Logins (Lockout)')}
            </label>
            <select
              value={settings.loginAttempts || '5'}
              onChange={(e) => handleChange('loginAttempts', e.target.value)}
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
            >
              <option value="3">{t('settings.attempts3', '3 Attempts (Strict)')}</option>
              <option value="5">{t('settings.attempts5', '5 Attempts (Standard)')}</option>
              <option value="10">{t('settings.attempts10', '10 Attempts (Relaxed)')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card 3: Active Administrative Sessions */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden shadow-xs space-y-0">
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
              <Monitor className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
              {t('settings.cardActiveSessions', 'Active Administrator Sessions')}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              {t('settings.authorizedDevicesCount', { count: sessions.length }, `${sessions.length} Authorized Devices`)}
            </span>
          </div>
        </div>

        <div className="divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)]">
          {sessions.map((sess) => (
            <div key={sess.id} className="p-4 sm:px-6 sm:py-3.5 flex items-center justify-between gap-4 hover:bg-[var(--color-surface-hover-light)]/40 dark:hover:bg-[var(--color-surface-hover-dark)]/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 border ${
                  sess.isCurrent
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/40 text-[#003E83] dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400'
                }`}>
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
                    <span>{sess.device}</span>
                    {sess.isCurrent && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)] text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] border border-[var(--color-success-border)] dark:border-[var(--color-success-dark-border)]">
                        {t('settings.currentSessionBadge', 'Current Session')}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                    {sess.location} • <span className="font-mono text-[var(--color-text-muted-light)] dark:text-zinc-400">{sess.ip}</span> • {t('settings.lastActiveText', { time: sess.lastActive }, `Last active: ${sess.lastActive}`)}
                  </p>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  type="button"
                  onClick={() => handleRevokeSession(sess.id)}
                  className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                  title={t('settings.tooltipRevokeSession', 'Revoke Session')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2FA Guide Alert Modal */}
      {show2FAModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-alert-backdrop"
          onClick={() => setShow2FAModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="twofa-modal-title"
        >
          <div
            className="bg-white dark:bg-[#18181b] rounded-md shadow-2xl max-w-sm sm:max-w-md w-full mx-4 p-6 relative border border-gray-200 dark:border-zinc-800 animate-alert-popup overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Centered Soft-Tinted Icon Badge */}
            <div className="flex justify-center mb-5 animate-alert-icon">
              <div className="w-14 h-14 rounded-md bg-blue-500/10 text-[#003E83] dark:text-blue-400 flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
            </div>

            {/* Modal Title */}
            <h3 id="twofa-modal-title" className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2 tracking-tight">
              {t('settings.modalTwoFactorTitle', 'Two-Factor Authentication Setup')}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-500 dark:text-zinc-400 text-center mb-5 leading-relaxed px-1">
              {t('settings.modalTwoFactorDesc', 'When 2FA Enforcement is turned on, administrators must scan a QR code using standard authenticator apps (Google Authenticator, Microsoft Authenticator, or 1Password) upon logging in.')}
            </p>

            {/* Security Tip Callout Card */}
            <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 space-y-1 mb-5 text-left">
              <p className="font-semibold flex items-center gap-1.5 text-blue-900 dark:text-blue-200 text-xs">
                <Info className="w-3.5 h-3.5 text-[#003E83] dark:text-blue-400 shrink-0" />
                {t('settings.twoFactorTipTitle', 'Security Tip')}
              </p>
              <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-300/90 pl-5">
                {t('settings.twoFactorTipDesc', 'Ensure emergency backup recovery codes are stored securely offline in case an administrator device is lost or replaced.')}
              </p>
            </div>

            {/* Confirm Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShow2FAModal(false)}
                className="w-full py-2.5 px-4 font-medium rounded-md bg-[#003E83] hover:bg-[#002e62] text-white transition-colors cursor-pointer text-sm shadow-xs"
              >
                {t('settings.btnUnderstood', 'Understood')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
