import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Building2, User, Mail, Phone, MapPin, FileCheck, CheckCircle2,
  AlertCircle, XCircle, ShieldAlert, Star, Calendar, Globe, FileText,
  Edit, RefreshCw, AlertTriangle, ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../i18n';

export default function BusinessDetailsModal({
  business,
  onClose,
  onApprove,
  onReject,
  onSuspend,
  onActivate,
  onEdit
}) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (business) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose?.();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [business, onClose]);

  if (!business) return null;

  const status = String(business.verification_status || business.status || 'pending').toLowerCase();
  const defaultFallbackImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800';
  const businessImage =
    business.image ||
    business.image_url ||
    business.cover_image ||
    business.photo ||
    business.thumbnail ||
    (Array.isArray(business.images) ? business.images[0] : null) ||
    defaultFallbackImage;

  const getStatusBadge = () => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={14} /> {t('businesses.statusApprovedActive', 'Approved & Active')}
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle size={14} /> {t('businesses.statusSuspended', 'Suspended')}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
            <XCircle size={14} /> {t('businesses.statusRejected', 'Rejected')}
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <AlertCircle size={14} /> {t('businesses.statusPending', 'Pending Review')}
          </span>
        );
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-modal-overlay)] backdrop-blur-xs p-4 animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col relative border border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] animate-alert-popup overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/30 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-12 h-12 rounded-md bg-[#003E83] text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-xs overflow-hidden border border-slate-200 dark:border-zinc-700">
              <img
                src={business.logo || businessImage}
                alt={business.name}
                className="w-full h-full object-cover rounded-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultFallbackImage;
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                  {business.name}
                </h2>
                {getStatusBadge()}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                <span className="flex items-center gap-1 font-medium text-[#003E83] dark:text-blue-400">
                  <Building2 size={14} />
                  {business.category?.name || business.category_name || business.category || t('businesses.defaultCategory', 'Hospitality')}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {business.province?.name || business.province || business.address || 'Siem Reap, Cambodia'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pt-3">
            {[
              { id: 'overview', label: t('businesses.tabOverview', 'Business Profile') },
              { id: 'owner', label: t('businesses.tabOwner', 'Owner & Contact') },
              { id: 'verification', label: t('businesses.tabVerification', 'Verification & License') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#003E83] text-white'
                    : 'text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="rounded-md overflow-hidden border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] h-48 w-full bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)] relative group shadow-xs">
                <img
                  src={businessImage}
                  alt={business.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultFallbackImage;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 pointer-events-none" />
                <div className="absolute bottom-2.5 left-3 text-white">
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md text-white/90">
                    {t('businesses.coverPicture', 'Cover Picture')}
                  </span>
                </div>
              </div>

              <div className="bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 p-4 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                <h4 className="font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] uppercase tracking-wider text-[11px] mb-1.5">
                  {t('businesses.aboutBusiness', 'About Business Profile')}
                </h4>
                <p className="text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] leading-relaxed">
                  {business.description || t('businesses.noDescription', 'No detailed business description available for this profile.')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] space-y-1">
                  <span className="text-[var(--color-text-muted-light)] text-[10px] uppercase font-semibold">{t('businesses.addressLocation', 'Address / Location')}</span>
                  <p className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{business.address || 'National Road 6, Siem Reap'}</p>
                </div>

                <div className="p-3 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] space-y-1">
                  <span className="text-[var(--color-text-muted-light)] text-[10px] uppercase font-semibold">{t('businesses.provinceRegion', 'Province / Region')}</span>
                  <p className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{business.province?.name || business.province || 'Siem Reap'}</p>
                </div>

                {business.price_tier && (
                  <div className="p-3 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] space-y-1">
                    <span className="text-[var(--color-text-muted-light)] text-[10px] uppercase font-semibold">{t('businesses.priceTier', 'Price Tier')}</span>
                    <p className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                      {business.price_tier}
                    </p>
                  </div>
                )}

                {(business.latitude || business.longitude) && (
                  <div className="p-3 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] space-y-1">
                    <span className="text-[var(--color-text-muted-light)] text-[10px] uppercase font-semibold">{t('businesses.geoCoordinates', 'Geo Coordinates')}</span>
                    <p className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                      {business.latitude || '0'}, {business.longitude || '0'}
                    </p>
                  </div>
                )}

                <div className="p-3 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] space-y-1">
                  <span className="text-[var(--color-text-muted-light)] text-[10px] uppercase font-semibold">{t('businesses.operatingHours', 'Operating Hours')}</span>
                  <p className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{business.operating_hours || '8:00 AM - 10:00 PM Daily'}</p>
                </div>

                <div className="p-3 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] space-y-1">
                  <span className="text-[var(--color-text-muted-light)] text-[10px] uppercase font-semibold">{t('businesses.websiteLink', 'Website / Link')}</span>
                  <p className="font-semibold text-[#003E83] dark:text-blue-400 flex items-center gap-1 truncate">
                    <Globe size={13} />
                    {business.website ? (
                      <a href={business.website} target="_blank" rel="noreferrer" className="hover:underline truncate">
                        {business.website}
                      </a>
                    ) : (
                      'https://angkorverses.com'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'owner' && (
            <div className="space-y-3">
              <div className="bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] p-4 rounded-md border border-blue-100 dark:border-blue-900/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-[#003E83] text-white font-bold text-base flex items-center justify-center shrink-0">
                  {business.owner?.name ? business.owner.name.charAt(0).toUpperCase() : 'O'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                    {business.owner?.name || business.owner_name || t('businesses.defaultOwner', 'Business Owner')}
                  </h4>
                  <p className="text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] text-xs">{t('businesses.registeredCommercialOwner', 'Registered Commercial Owner')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#003E83] dark:text-blue-400 shrink-0" />
                  <div>
                    <span className="text-[var(--color-text-muted-light)] text-[10px] uppercase font-semibold block">{t('businesses.emailAddress', 'Email Address')}</span>
                    <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{business.owner?.email || business.email || 'owner@business.com'}</span>
                  </div>
                </div>

                <div className="p-3 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex items-center gap-3">
                  <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[var(--color-text-muted-light)] text-[10px] uppercase font-semibold block">{t('businesses.phoneContact', 'Phone Contact')}</span>
                    <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{business.owner?.phone || business.phone || '+855 12 345 678'}</span>
                  </div>
                </div>

                <div className="p-3 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <div>
                    <span className="text-[var(--color-text-muted-light)] text-[10px] uppercase font-semibold block">{t('businesses.registrationDate', 'Registration Date')}</span>
                    <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                      {business.created_at ? business.created_at.split('T')[0] : '2024-03-15'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex items-center gap-3">
                  <FileCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <div>
                    <span className="text-[var(--color-text-muted-light)] text-[10px] uppercase font-semibold block">{t('businesses.taxIdentification', 'Tax Identification')}</span>
                    <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{business.tax_id || business.license_number || 'MOT-2024-REG'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-3">
              <div className="p-4 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#003E83]" /> {t('businesses.ministryTourismLicense', 'Ministry Tourism Operating License')}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-md font-semibold">
                    {t('businesses.attached', 'Attached')}
                  </span>
                </div>
                <p className="text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] text-[11px]">
                  {t('businesses.commercialLicenseNumber', 'Commercial License Number:')} <strong className="text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{business.license_number || 'MOT-2024-REG'}</strong>
                </p>
              </div>

              {business.rejection_reason && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-md border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300">
                  <h5 className="font-bold mb-1 flex items-center gap-1.5">
                    <XCircle size={15} /> {t('businesses.rejectionActionNote', 'Rejection / Action Note')}
                  </h5>
                  <p className="text-xs">{business.rejection_reason}</p>
                </div>
              )}

              {business.suspension_reason && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300">
                  <h5 className="font-bold mb-1 flex items-center gap-1.5">
                    <AlertTriangle size={15} /> {t('businesses.suspensionJustification', 'Suspension Justification')}
                  </h5>
                  <p className="text-xs">{business.suspension_reason}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-[var(--color-surface-hover-light)]/40 dark:bg-[var(--color-surface-hover-dark)]/20 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] font-medium text-xs sm:text-sm transition-colors text-center cursor-pointer"
            >
              {t('common.close', 'Close')}
            </button>
            <button
              type="button"
              onClick={() => onEdit?.(business)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] transition-colors cursor-pointer"
            >
              <Edit size={14} /> {t('businesses.editProfile', 'Edit Profile')}
            </button>
            <a
              href={(() => {
                const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
                const travelBase = isLocal ? 'http://localhost:5175' : '';
                return `${travelBase}/businesses/${business.id || ''}`;
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] text-[#003E83] dark:text-blue-400 transition-colors cursor-pointer"
            >
              <ExternalLink size={14} />
              <span>{t('businesses.visitPage', 'Visit Page')}</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {status !== 'approved' && (
              <button
                type="button"
                onClick={() => onApprove(business)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 size={14} /> {t('businesses.approveProfile', 'Approve Profile')}
              </button>
            )}

            {status === 'approved' && (
              <button
                type="button"
                onClick={() => onSuspend(business)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                <AlertTriangle size={14} /> {t('businesses.suspend', 'Suspend')}
              </button>
            )}

            {status !== 'rejected' && (
              <button
                type="button"
                onClick={() => onReject(business)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                <XCircle size={14} /> {t('businesses.reject', 'Reject')}
              </button>
            )}

            {status === 'suspended' && (
              <button
                type="button"
                onClick={() => onActivate(business)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium bg-[#003E83] hover:bg-[#002e62] text-white shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw size={14} /> {t('businesses.reactivate', 'Reactivate')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
