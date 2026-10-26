import { X, Smartphone, QrCode, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AppDownloadModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden zoom-in">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-500 dark:text-zinc-400 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#003E83] to-[#287dfa] p-6 text-white text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3 backdrop-blur-xs">
            <Sparkles size={13} className="text-amber-300" />
            <span>Trip.com Mobile App</span>
          </div>
          <h3 className="text-2xl font-black tracking-tight leading-tight">
            Travel Smarter with the Trip App
          </h3>
          <p className="text-xs text-blue-100 mt-1">
            Exclusive app-only discounts, offline e-tickets, and instant trip updates.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-blue-50/60 dark:bg-zinc-800/60 p-4 rounded-2xl border border-blue-100 dark:border-zinc-700/60">
            {/* Simulated QR Code */}
            <div className="w-32 h-32 bg-white p-2.5 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center shrink-0">
              <QrCode size={96} className="text-[#0f294d]" />
              <span className="text-[9px] font-bold text-gray-500 mt-1 uppercase tracking-wider">Scan to install</span>
            </div>

            <div className="space-y-2.5 text-xs text-left">
              <div className="flex items-center gap-2 text-gray-700 dark:text-zinc-200">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Up to <strong>20% OFF</strong> exclusive mobile hotel deals</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-zinc-200">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Offline temple pass and tour ticket barcodes</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-zinc-200">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Live flight and bus tracking alerts</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-zinc-200">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Instant 24/7 in-app chat support with TripGenie</span>
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <span className="text-xs text-gray-400">Available on iOS & Android</span>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#0f294d] hover:bg-[#1a3860] text-white text-xs font-bold transition-all shadow-xs"
              >
                App Store (iOS)
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#287dfa] hover:bg-[#1f6bd9] text-white text-xs font-bold transition-all shadow-xs"
              >
                Google Play (Android)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
