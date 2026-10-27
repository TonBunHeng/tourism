import { FolderOpen } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'There are currently no items to display.',
  action = null,
  className = '',
}) {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 flex flex-col items-center justify-center ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 flex items-center justify-center mb-3.5">
        <Icon size={26} />
      </div>
      <h4 className="text-base font-semibold text-slate-800 dark:text-white mb-1">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
