import { Link } from 'react-router-dom';
import { Phone, ShieldAlert, Compass, CalendarCheck } from 'lucide-react';
import logoImg from '../../assets/tourism_logo.png';

export default function Footer() {
  return (
    <footer className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-t border-gray-200/80 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 pt-12 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Emergency Assistance Bar */}
        <div className="bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/60 dark:from-zinc-800/60 dark:via-zinc-800/40 dark:to-zinc-900 border border-blue-100 dark:border-zinc-700/60 rounded-3xl p-4 sm:p-5 mb-10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#003E83] dark:bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">24/7 Cambodia Tourist Emergency Hotlines</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Official nationwide tourist police and medical dispatch services</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="tel:117"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-bold text-gray-800 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 shadow-2xs transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-[#003E83] dark:text-blue-400" />
              <span>Police: 117</span>
            </a>
            <a
              href="tel:+855313222117"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-bold shadow-xs transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Tourist Police: +855 31 322 2117</span>
            </a>
            <a
              href="tel:119"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-gray-50 dark:hover:bg-zinc-700 shadow-2xs transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Ambulance: 119</span>
            </a>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-200/80 dark:border-zinc-800 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden bg-[#003E83]/10 dark:bg-blue-900/30 flex items-center justify-center p-1 border border-blue-200/60 dark:border-blue-900/50">
                <img
                  src={logoImg}
                  alt="AngkorVerses"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-extrabold text-gray-900 dark:text-white text-base">AngkorVerses</span>
            </div>
            <p className="text-gray-500 dark:text-zinc-400 text-xs leading-relaxed">
              Official smart tourism platform for discovering attractions, booking authentic experiences, and exploring cultural heritage across Cambodia.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 text-xs">Explore</h4>
            <ul className="space-y-2 text-gray-600 dark:text-zinc-400 text-xs">
              <li><Link to="/places" className="hover:text-[#003E83] dark:hover:text-blue-400 transition-colors">Destinations & Temples</Link></li>
              <li><Link to="/tours" className="hover:text-[#003E83] dark:hover:text-blue-400 transition-colors">Recommended Tours & Packages</Link></li>
              <li><Link to="/guides" className="hover:text-[#003E83] dark:hover:text-blue-400 transition-colors">Tour Guides</Link></li>
              <li><Link to="/reviews" className="hover:text-[#003E83] dark:hover:text-blue-400 transition-colors">Traveler Reviews</Link></li>
              <li><Link to="/gallery" className="hover:text-[#003E83] dark:hover:text-blue-400 transition-colors">Photo Gallery</Link></li>
              <li><Link to="/events" className="hover:text-[#003E83] dark:hover:text-blue-400 transition-colors">Events & Festivals</Link></li>
              <li><Link to="/provinces" className="hover:text-[#003E83] dark:hover:text-blue-400 transition-colors">25 Provinces</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 text-xs">Travel Planner</h4>
            <ul className="space-y-2 text-gray-600 dark:text-zinc-400 text-xs">
              <li><Link to="/trips" className="hover:text-[#003E83] dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"><Compass size={13} /> My Travel Plans</Link></li>
              <li><Link to="/bookings" className="hover:text-[#003E83] dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"><CalendarCheck size={13} /> My Bookings</Link></li>
              <li><Link to="/wishlist" className="hover:text-[#003E83] dark:hover:text-blue-400 transition-colors">Saved Wishlist</Link></li>
              <li><Link to="/achievements" className="hover:text-[#003E83] dark:hover:text-blue-400 transition-colors">Badges & Milestones</Link></li>
              <li><Link to="/profile" className="hover:text-[#003E83] dark:hover:text-blue-400 transition-colors">Tourist Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 text-xs">About & Support</h4>
            <ul className="space-y-2 text-gray-600 dark:text-zinc-400 text-xs mb-3">
              <li><Link to="/about" className="hover:text-[#003E83] dark:hover:text-blue-400 transition-colors">About AngkorVerses</Link></li>
              <li><Link to="/contact" className="hover:text-[#003E83] dark:hover:text-blue-400 transition-colors">Contact Support</Link></li>
            </ul>
            <p className="text-gray-500 dark:text-zinc-400 text-xs leading-relaxed mb-2">
              For visitor inquiries and official tourism support: <br />
              <span className="font-bold text-[#003E83] dark:text-blue-400">support@tourism.gov.kh</span>
            </p>
            <p className="text-gray-400 text-[11px]">
              Ministry of Tourism, Royal Government of Cambodia.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 dark:text-zinc-500 gap-3">
          <p>© {new Date().getFullYear()} AngkorVerses — Kingdom of Wonder, Cambodia.</p>
          <div className="flex items-center gap-5">
            <Link to="/settings" className="hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">Privacy Policy</Link>
            <Link to="/settings" className="hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">Terms of Service</Link>
            <Link to="/deletion-request" className="hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">Data Privacy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
