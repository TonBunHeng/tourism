import { useEffect } from 'react';
import { ShieldAlert, FileText } from 'lucide-react';
import { settingService } from '../../services/settingService';
import SettingsHeader from './SettingsHeader';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function Settings() {
  useEffect(() => {
    settingService.getSettings().catch((err) => {
      console.error('Failed to load settings', err);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb items={[{ label: 'Emergency & Guidelines' }]} />
      <SettingsHeader />

      <div className="space-y-6">
        {/* Emergency Assistance */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs transition-colors">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>24/7 Emergency Contacts in Cambodia</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-5 rounded-2xl bg-gray-50/70 dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700/80 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-400 tracking-wider">National Police</span>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">117</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Nationwide emergency dispatch</p>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-[#003E83] dark:text-blue-300 tracking-wider">Tourist Police</span>
              <p className="text-2xl font-black text-[#003E83] dark:text-blue-300 mt-1">+855 31 322 2117</p>
              <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1">English-speaking visitor unit</p>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider">Ambulance & Medical</span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">119</p>
              <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1">First response & hospital care</p>
            </div>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed transition-colors">
          <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#003E83] dark:text-blue-400" />
            <span>Cultural Guidelines & Temple Etiquette</span>
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-gray-900 dark:text-white">Temple Dress Code:</strong> Shoulders and knees must be fully covered when visiting sacred temples including Angkor Wat, Banteay Srei, and the Royal Palace.</li>
            <li><strong className="text-gray-900 dark:text-white">Respecting Monks:</strong> Always ask permission before photographing monks and maintain a respectful, polite posture.</li>
            <li><strong className="text-gray-900 dark:text-white">Accepted Currencies:</strong> US Dollars (USD) and Cambodian Riel (KHR) are both widely accepted nationwide. Bakong digital payments are supported at many merchants.</li>
            <li><strong className="text-gray-900 dark:text-white">Hydration & Weather:</strong> Drink bottled or filtered water throughout your trips, especially during sunny temple walks in tropical midday heat.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
