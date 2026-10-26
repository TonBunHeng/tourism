import { useState } from 'react';
import { Gift, Hotel, Train, Ticket, Sparkles, Check, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TripCoupons() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [claimed, setClaimed] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  const handleClaim = (id, title) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setClaimed((prev) => ({ ...prev, [id]: true }));
    setToastMessage(`Coupon claimed! "${title}" is ready in your account.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleClaimAll = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setClaimed({
      hotel: true,
      train: true,
      tour: true
    });
    setToastMessage('All welcome vouchers claimed! Applied automatically at checkout.');
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#0f294d] text-white text-xs font-bold shadow-xl animate-in fade-in slide-in-from-top-3 border border-blue-500/30">
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-black text-[#0f294d] dark:text-white tracking-tight">
          New user exclusive
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Ticket 1: Call to Action Welcome Box */}
        <div className="relative rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/70 dark:from-zinc-900 dark:to-zinc-800 border border-blue-100 dark:border-zinc-800 p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#0f294d] dark:text-white leading-tight">
                New users get more discounts on travel!
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                Instant savings on your first Cambodia trip booking
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-400 text-white flex items-center justify-center shrink-0 shadow-sm ml-2">
              <Gift size={22} />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleClaimAll}
              className="w-full py-2.5 px-4 bg-[#287dfa] hover:bg-[#1a6de8] text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              {isAuthenticated ? 'Claim all vouchers' : 'Sign in & claim all'}
            </button>
          </div>
        </div>

        {/* Ticket 2: 10% Off Hotels & Homes */}
        <div className="relative rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 flex overflow-hidden shadow-2xs hover:border-blue-300 dark:hover:border-blue-500/50 transition-all">
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-[#0f294d] dark:text-white">10% off</span>
                <span title="Valid for all hotels in Siem Reap, Phnom Penh & Sihanoukville">
                  <Info size={13} className="text-gray-400 cursor-help" />
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-zinc-400 font-medium mt-0.5">
                Hotels & Homes
              </p>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => handleClaim('hotel', '10% off Hotels & Homes')}
                disabled={claimed.hotel}
                className={`w-full py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  claimed.hotel
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-[#287dfa] hover:bg-[#1a6de8] text-white shadow-2xs active:scale-95'
                }`}
              >
                {claimed.hotel ? 'Claimed ✓' : 'Claim'}
              </button>
            </div>
          </div>

          {/* Perforated Divider & Notches */}
          <div className="relative flex flex-col items-center justify-center px-4 bg-gray-50/60 dark:bg-zinc-800/40 border-l border-dashed border-gray-200 dark:border-zinc-700">
            {/* Top Cutout */}
            <div className="absolute -top-2.5 left-[-9px] w-4 h-4 rounded-full bg-[#f8fafc] dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800" />
            {/* Bottom Cutout */}
            <div className="absolute -bottom-2.5 left-[-9px] w-4 h-4 rounded-full bg-[#f8fafc] dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800" />
            
            <Hotel size={24} className="text-[#287dfa]" />
          </div>
        </div>

        {/* Ticket 3: 5% Off Express & Shuttles */}
        <div className="relative rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 flex overflow-hidden shadow-2xs hover:border-blue-300 dark:hover:border-blue-500/50 transition-all">
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-[#0f294d] dark:text-white">5% off</span>
                <span title="Valid on Express VIP Vans, Speed Ferries & Shuttles">
                  <Info size={13} className="text-gray-400 cursor-help" />
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-zinc-400 font-medium mt-0.5">
                Trains & Shuttles
              </p>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => handleClaim('train', '5% off Trains & Shuttles')}
                disabled={claimed.train}
                className={`w-full py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  claimed.train
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-[#287dfa] hover:bg-[#1a6de8] text-white shadow-2xs active:scale-95'
                }`}
              >
                {claimed.train ? 'Claimed ✓' : 'Claim'}
              </button>
            </div>
          </div>

          {/* Perforated Divider & Notches */}
          <div className="relative flex flex-col items-center justify-center px-4 bg-gray-50/60 dark:bg-zinc-800/40 border-l border-dashed border-gray-200 dark:border-zinc-700">
            <div className="absolute -top-2.5 left-[-9px] w-4 h-4 rounded-full bg-[#f8fafc] dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800" />
            <div className="absolute -bottom-2.5 left-[-9px] w-4 h-4 rounded-full bg-[#f8fafc] dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800" />
            <Train size={24} className="text-rose-500" />
          </div>
        </div>

        {/* Ticket 4: 10% Off Attractions & Tours */}
        <div className="relative rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 flex overflow-hidden shadow-2xs hover:border-blue-300 dark:hover:border-blue-500/50 transition-all">
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-[#0f294d] dark:text-white">10% off</span>
                <span title="Valid for Angkor sunrise tours, Kulen waterfalls, and island cruises">
                  <Info size={13} className="text-gray-400 cursor-help" />
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-zinc-400 font-medium mt-0.5">
                Attractions & Tours
              </p>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => handleClaim('tour', '10% off Attractions & Tours')}
                disabled={claimed.tour}
                className={`w-full py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  claimed.tour
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-[#287dfa] hover:bg-[#1a6de8] text-white shadow-2xs active:scale-95'
                }`}
              >
                {claimed.tour ? 'Claimed ✓' : 'Claim'}
              </button>
            </div>
          </div>

          {/* Perforated Divider & Notches */}
          <div className="relative flex flex-col items-center justify-center px-4 bg-gray-50/60 dark:bg-zinc-800/40 border-l border-dashed border-gray-200 dark:border-zinc-700">
            <div className="absolute -top-2.5 left-[-9px] w-4 h-4 rounded-full bg-[#f8fafc] dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800" />
            <div className="absolute -bottom-2.5 left-[-9px] w-4 h-4 rounded-full bg-[#f8fafc] dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800" />
            <Ticket size={24} className="text-amber-500" />
          </div>
        </div>

      </div>
    </section>
  );
}
