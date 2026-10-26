import { useState, useEffect } from 'react';
import { ShieldAlert, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { deletionRequestService } from '../../services/deletionRequestService';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import DeletionHeader from './DeletionHeader';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function DeletionRequests() {
  const { user } = useAuth();
  const { showConfirm, showSuccess, showError } = useAlert();
  const [email, setEmail] = useState(user?.email || '');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const userName = user?.name || 'Account';

  useEffect(() => {
    if (user?.email && !email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(user.email);
    }
  }, [user, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('Please specify a reason for deletion');
      return;
    }

    const confirmed = await showConfirm({
      title: `Warning: Delete Account "${userName}"`,
      message: `Are you sure you want to permanently delete account "${userName}" (${email || user?.email})?\n\nWarning: This action is permanent and cannot be undone. All your saved wishlist destinations, badges, earned achievements, community reviews, and travel activity will be permanently erased from AngkorVerses.`,
      confirmText: 'Delete Account',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await deletionRequestService.createDeletionRequest({
        request_type: "account",
        email: email.trim(),
        reason: reason.trim(),
      });
      const msg = `Your account deletion request for "${userName}" has been submitted. Our administration team will process it within 30 days.`;
      setSuccessMsg(msg);
      showSuccess(msg, 'Deletion Request Submitted');
      setReason('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit deletion request.');
      showError(err.message || 'Failed to submit deletion request.', 'Submission Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb items={[{ label: 'Data Privacy' }]} />
      <DeletionHeader />

      <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs transition-colors">
        <div className="p-4 sm:p-5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl text-amber-800 dark:text-amber-300 text-xs sm:text-sm leading-relaxed space-y-1.5 shadow-2xs">
          <p className="font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            Important Notice Regarding Account Deletion
          </p>
          <p>
            Submitting this request initiates the permanent erasure of your account <span className="font-bold text-red-600 dark:text-red-400">&quot;{userName}&quot;</span>, saved wishlist, earned badges/achievements, and review logs from the AngkorVerses database.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm rounded-2xl flex items-center gap-2 font-medium shadow-2xs">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs sm:text-sm rounded-2xl flex items-center gap-2 font-medium shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
              Account Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
              Reason for Deletion <span className="font-bold text-red-600 dark:text-red-400">&quot;Delete Account {userName}&quot;</span> *
            </label>
            <textarea
              rows={4}
              required
              placeholder={`Please describe why you would like account "${userName}" and travel logs deleted...`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-2xl border border-gray-200 dark:border-zinc-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <ShieldAlert className="w-4 h-4" />
              {loading ? 'Submitting Request...' : 'Submit Deletion Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
