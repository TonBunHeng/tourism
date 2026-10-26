import { ShieldAlert } from 'lucide-react';

export default function DeletionHeader() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-rose-100 dark:border-zinc-800 bg-gradient-to-br from-rose-50/50 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-6 sm:p-8 shadow-sm space-y-2">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>Privacy & Data Erasure Compliance</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Account Deletion & Data Privacy
      </h1>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 max-w-xl">
        Submit an official data deletion request in compliance with international privacy regulations and Cambodian e-commerce laws.
      </p>
    </div>
  );
}
