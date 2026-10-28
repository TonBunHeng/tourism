import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Plus, Edit2 } from 'lucide-react';
import { useLanguage } from '../../i18n';

export default function TrackingModal({
  isOpen,
  onClose,
  onSubmit,
  editingLog = null,
  loading = false,
}) {
  const { t } = useLanguage();
  const isEditing = Boolean(editingLog);

  const [formData, setFormData] = useState({
    action: 'item_updated',
    entity_type: 'Place',
    entity_id: '',
    description: '',
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (editingLog) {
      setFormData({
        action: editingLog.action || 'item_updated',
        entity_type: editingLog.entity_type || 'Place',
        entity_id: editingLog.entity_id ? String(editingLog.entity_id) : '',
        description: editingLog.description || '',
      });
    } else {
      setFormData({
        action: 'item_updated',
        entity_type: 'Place',
        entity_id: '',
        description: '',
      });
    }
  }, [editingLog, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description.trim()) return;

    const payload = {
      action: formData.action,
      entity_type: formData.entity_type,
      entity_id: formData.entity_id ? parseInt(formData.entity_id, 10) : null,
      description: formData.description.trim(),
    };

    onSubmit(payload);
  };

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
            <div className="w-10 h-10 rounded-md bg-[#003E83]/10 dark:bg-blue-500/20 text-[#003E83] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/50">
              {isEditing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] tracking-wide">
                {isEditing ? t('tracking.modalEditTitle', 'Edit Activity Note') : t('tracking.modalCreateTitle', 'Log Super Admin Action')}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                {isEditing 
                  ? t('tracking.modalEditSubtitle', 'Update the description or note for this record') 
                  : t('tracking.modalCreateSubtitle', 'Manually record a privileged administrator action')}
              </p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Action Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              {t('tracking.labelActionName', 'Action Name / Key *')}
            </label>
            <select
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              className="w-full px-3 py-2 text-xs md:text-sm bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83] focus:border-transparent cursor-pointer"
            >
              <optgroup label="Item Updates & Deletes (Admin / Super Admin)">
                <option value="item_updated">item_updated (Item / Content Modified)</option>
                <option value="item_deleted">item_deleted (Item / Content Removed)</option>
                <option value="item_approved">item_approved (Item Verified & Published)</option>
                <option value="item_rejected">item_rejected (Item Rejected)</option>
              </optgroup>
              <optgroup label="Content Editor Operations">
                <option value="place_created">place_created (Heritage Site Created)</option>
                <option value="place_updated">place_updated (Place Info Updated)</option>
                <option value="place_deleted">place_deleted (Place Removed)</option>
                <option value="event_created">event_created (Festival/Event Created)</option>
              </optgroup>
              <optgroup label="Business & Tourist History">
                <option value="business_profile_updated">business_profile_updated (Business Profile)</option>
                <option value="booking_confirmed">booking_confirmed (Booking Confirmed)</option>
                <option value="review_posted">review_posted (Tourist Review)</option>
                <option value="user_login">user_login (Authentication / Session)</option>
              </optgroup>
            </select>
          </div>

          {/* Entity Type & Entity ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                {t('tracking.labelTargetEntityType', 'Target Entity Type')}
              </label>
              <select
                value={formData.entity_type}
                onChange={(e) => setFormData({ ...formData, entity_type: e.target.value })}
                className="w-full px-3 py-2 text-xs md:text-sm bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83] focus:border-transparent cursor-pointer"
              >
                <option value="Place">Place / Attraction</option>
                <option value="Event">Event / Festival</option>
                <option value="User">User Account</option>
                <option value="Business">Business Profile</option>
                <option value="Gallery">Gallery Media</option>
                <option value="Review">Review / Rating</option>
                <option value="Booking">Tour Booking</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                {t('tracking.labelTargetItemId', 'Target Item ID (Optional)')}
              </label>
              <input
                type="number"
                value={formData.entity_id}
                onChange={(e) => setFormData({ ...formData, entity_id: e.target.value })}
                placeholder="e.g. 10"
                className="w-full px-3 py-2 text-xs md:text-sm bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83] focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              {t('tracking.labelDescriptionNote', 'Description / Action Note *')}
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('tracking.placeholderDescription', 'Describe the action or item modification details...')}
              className="w-full px-3 py-2 text-xs md:text-sm bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003E83] focus:border-transparent resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs md:text-sm font-medium rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 transition-colors cursor-pointer"
            >
              {t('tracking.btnCancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !formData.description.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-medium text-white bg-[#003E83] hover:bg-[#002e62] rounded-md transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <Save className="w-3.5 h-3.5" />
              <span>{isEditing ? t('tracking.btnSaveChanges', 'Save Changes') : t('tracking.btnRecordAction', 'Record Action')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
