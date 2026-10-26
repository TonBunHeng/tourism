import { Link } from 'react-router-dom';
import { Phone, ShieldAlert, Award, Headphones, Globe, CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-zinc-900 border-t border-gray-200/90 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 pt-12 pb-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Emergency Hotline Bar */}
        <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-indigo-50/70 dark:from-zinc-800/80 dark:to-zinc-800/40 border border-blue-100 dark:border-zinc-700/70 rounded-2xl p-4 sm:p-5 mb-10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-[#287dfa] text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0f294d] dark:text-white">
                24/7 Cambodia Tourist Assistance & Emergency Dispatch
              </h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Official round-the-clock tourist police & certified medical emergency lines
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="tel:117"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-bold text-gray-800 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 shadow-2xs transition-all"
            >
              <Phone size={13} className="text-rose-500" />
              <span>Police: 117</span>
            </a>
            <a
              href="tel:+855313222117"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#287dfa] hover:bg-[#1a6de8] text-white text-xs font-bold shadow-xs transition-all"
            >
              <Phone size={13} />
              <span>Tourist Police: +855 31 322 2117</span>
            </a>
            <a
              href="tel:119"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-gray-50 dark:hover:bg-zinc-700 shadow-2xs transition-all"
            >
              <Phone size={13} />
              <span>Ambulance: 119</span>
            </a>
          </div>
        </div>

        {/* 4 Columns Links Grid matching Trip.com */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-gray-200/80 dark:border-zinc-800 text-xs">
          
          {/* Col 1: Contact Us & Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-[#0f294d] dark:text-white uppercase tracking-wider">
              Contact Us
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/contact" className="hover:text-[#287dfa] transition-colors">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#287dfa] transition-colors">
                  Service Guarantee
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#287dfa] transition-colors">
                  More Service Information
                </Link>
              </li>
              <li>
                <a href="mailto:support@tourism.gov.kh" className="hover:text-[#287dfa] transition-colors font-medium text-gray-700 dark:text-zinc-300">
                  support@tourism.gov.kh
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: About Trip.com */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-[#0f294d] dark:text-white uppercase tracking-wider">
              About
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/about" className="hover:text-[#287dfa] transition-colors">
                  About Trip.com Cambodia
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-[#287dfa] transition-colors">
                  News & Travel Festivals
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#287dfa] transition-colors">
                  Careers & Guides
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-[#287dfa] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-[#287dfa] transition-colors">
                  Privacy Statement
                </Link>
              </li>
              <li>
                <Link to="/deletion-request" className="hover:text-[#287dfa] transition-colors">
                  Data Privacy & Protection
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Other Services */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-[#0f294d] dark:text-white uppercase tracking-wider">
              Other Services
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/achievements" className="hover:text-[#287dfa] transition-colors">
                  Trip.com Rewards (Trip Coins)
                </Link>
              </li>
              <li>
                <Link to="/businesses" className="hover:text-[#287dfa] transition-colors">
                  List Your Property or Hotel
                </Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-[#287dfa] transition-colors">
                  Become a Certified Tour Guide
                </Link>
              </li>
              <li>
                <Link to="/places" className="hover:text-[#287dfa] transition-colors">
                  All Cambodian Cities & Stays
                </Link>
              </li>
              <li>
                <Link to="/trips" className="hover:text-[#287dfa] transition-colors">
                  Trip.Planner Smart Itineraries
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Payment Methods & Security */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-[#0f294d] dark:text-white uppercase tracking-wider">
              Payment Methods
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Safe & secure payments with instant confirmation
            </p>

            <div className="flex flex-wrap gap-2 text-[10px] font-extrabold">
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 border border-gray-200/80 dark:border-zinc-700">
                ABA PAY
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 border border-gray-200/80 dark:border-zinc-700">
                Wing Bank
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 border border-gray-200/80 dark:border-zinc-700">
                ACLEDA KHQR
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 border border-gray-200/80 dark:border-zinc-700">
                Visa
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 border border-gray-200/80 dark:border-zinc-700">
                MasterCard
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 border border-gray-200/80 dark:border-zinc-700">
                PayPal
              </span>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0f294d] dark:text-white">
                <Award size={16} className="text-amber-500" />
                <span>Global Support Services of the Year 2026</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom Rights */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 dark:text-zinc-500 gap-3">
          <p>
            Copyright © {new Date().getFullYear()} Trip.com Travel Singapore Pte. Ltd. All rights reserved. Site Operator: Trip.com / AngkorVerses.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/settings" className="hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/settings" className="hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">
              Privacy Statement
            </Link>
            <Link to="/deletion-request" className="hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">
              Security
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
