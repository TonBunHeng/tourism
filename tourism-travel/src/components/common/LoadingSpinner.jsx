import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...', size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-[#003E83] dark:text-blue-400 animate-spin mb-3`} />
      {text && <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">{text}</p>}
    </div>
  );
}
