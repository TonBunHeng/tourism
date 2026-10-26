import { ShieldCheck } from 'lucide-react';

export default function SettingsHeader() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-100 dark:border-zinc-800 bg-gradient-to-br from-blue-50/60 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-6 sm:p-8 shadow-sm space-y-2">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003E83]/10 dark:bg-blue-400/10 text-[#003E83] dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Traveler Safety & Cultural Etiquette</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Tourist Emergency & Guidelines
      </h1>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 max-w-xl">
        Official emergency hotlines, cultural guidelines, temple etiquette, and travel safety in Cambodia.
      </p>
    </div>
  );
}
