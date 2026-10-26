import { X, Headphones, Phone, ShieldCheck, MessageSquare, Clock, Globe, Award } from 'lucide-react';
import { useTravel } from '../../context/TravelContext';

export default function SupportModal({ isOpen, onClose }) {
  const { toggleChat } = useTravel();

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
        <div className="bg-gradient-to-r from-[#0f294d] to-[#287dfa] p-6 text-white text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3 backdrop-blur-xs">
            <Clock size={13} className="text-amber-300" />
            <span>24/7 Global Customer Care</span>
          </div>
          <h3 className="text-2xl font-black tracking-tight leading-tight">
            How can we help your journey?
          </h3>
          <p className="text-xs text-blue-100 mt-1">
            Awarded Global Support Services 2026. Available in English, Khmer, French & Chinese.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-left">
          {/* Quick Chat with TripGenie */}
          <div
            onClick={() => {
              onClose();
              toggleChat();
            }}
            className="group flex items-center justify-between p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 hover:border-[#287dfa] transition-all cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#287dfa] text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <MessageSquare size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0f294d] dark:text-white group-hover:text-[#287dfa] transition-colors">
                  Instant Chat with TripGenie AI
                </h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Instant answers on bookings, temple passes, weather & guides
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#287dfa] shrink-0">Chat Now →</span>
          </div>

          {/* Emergency Telephone Support */}
          <div className="border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 space-y-3 bg-gray-50/50 dark:bg-zinc-800/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Emergency Hotlines in Cambodia
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a
                href="tel:117"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-blue-400 font-bold text-gray-800 dark:text-zinc-200 transition-colors"
              >
                <Phone size={14} className="text-rose-500 shrink-0" />
                <span>Police: 117</span>
              </a>
              <a
                href="tel:+855313222117"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-blue-400 font-bold text-gray-800 dark:text-zinc-200 transition-colors"
              >
                <Phone size={14} className="text-[#287dfa] shrink-0" />
                <span>Tourist Police: +855 31 322 2117</span>
              </a>
              <a
                href="tel:119"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-blue-400 font-bold text-gray-800 dark:text-zinc-200 transition-colors"
              >
                <Phone size={14} className="text-emerald-500 shrink-0" />
                <span>Medical / Ambulance: 119</span>
              </a>
              <a
                href="mailto:support@tourism.gov.kh"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-blue-400 font-bold text-gray-800 dark:text-zinc-200 transition-colors"
              >
                <Globe size={14} className="text-blue-500 shrink-0" />
                <span>support@tourism.gov.kh</span>
              </a>
            </div>
          </div>

          {/* Guarantees */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs">
            <Award size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-amber-900 dark:text-amber-200 text-[11px] leading-tight">
              <strong>Trip.com Booking Guarantee:</strong> Every paid booking is verified with certified local Cambodian operators. If issues arise, we rebook or provide 100% refund.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
