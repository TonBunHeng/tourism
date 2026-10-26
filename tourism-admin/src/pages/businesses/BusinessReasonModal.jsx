import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';

export default function BusinessReasonModal({
  isOpen,
  onClose,
  onSubmit,
  title = 'Provide Reason',
  subtitle = '',
  actionType = 'reject', // 'reject' | 'suspend'
  businessName = ''
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  // Handle ESC key and prevent body scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose?.();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setReason(
        actionType === 'reject'
          ? 'Documentation requirements incomplete or invalid license verification details provided.'
          : 'Profile flagged for review due to policy non-compliance.'
      );
      setError('');
    }
  }, [isOpen, actionType]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please enter a valid explanation reason before continuing.');
      return;
    }
    onSubmit(reason.trim());
    onClose();
  };

  const isReject = actionType === 'reject';

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-reason-title"
    >
      <div
        className="bg-white dark:bg-[#18181b] rounded-md shadow-2xl max-w-md w-full mx-4 p-6 relative border border-gray-200 dark:border-zinc-800 animate-alert-popup overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4 animate-alert-icon">
          {isReject ? (
            <div className="w-14 h-14 rounded-md bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 id="alert-reason-title" className="text-lg font-bold text-gray-900 dark:text-white text-center mb-1 tracking-tight">
          {title}
        </h3>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 dark:text-zinc-400 text-center mb-5 leading-relaxed px-1">
          {subtitle || (isReject ? `Please state the reason for rejecting "${businessName}".` : `Provide operational justification for suspending "${businessName}".`)}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider text-left">
              {isReject ? 'Rejection Reason' : 'Suspension Justification'} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter explanation details for the business owner..."
              className="w-full p-3 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all resize-none"
            />
            {error && <p className="text-xs text-red-500 font-medium mt-1 text-left">{error}</p>}
          </div>

          <div className="bg-gray-50 dark:bg-zinc-800/40 p-3 rounded-md border border-gray-100 dark:border-zinc-800 text-[11px] text-gray-500 dark:text-zinc-400 text-left">
            <span className="font-semibold text-gray-700 dark:text-zinc-300">Note: </span>
            This message will be sent to the business owner&apos;s registered email address and updated in administrative audit logs.
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-zinc-800 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800/80 text-gray-700 dark:text-zinc-300 font-medium rounded-md transition-colors cursor-pointer text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 px-4 font-medium rounded-md transition-colors cursor-pointer text-sm flex items-center justify-center gap-1.5 text-white ${
                isReject
                  ? 'bg-red-500 hover:bg-red-600 active:scale-[0.98]'
                  : 'bg-amber-500 hover:bg-amber-600 active:scale-[0.98]'
              }`}
            >
              Confirm {isReject ? 'Rejection' : 'Suspension'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
