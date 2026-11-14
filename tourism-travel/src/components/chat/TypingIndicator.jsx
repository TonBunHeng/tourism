export default function TypingIndicator({ language = 'en' }) {
  const isKm = language === 'km';

  return (
    <div className="flex justify-start mb-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-sm shadow-2xs flex items-center space-x-2.5">
        <span className="text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 font-medium">
          {isKm ? 'AngkorVers AI កំពុងគិត...' : 'AngkorVers AI is thinking...'}
        </span>
        <div className="flex items-center space-x-1 pt-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 dark:bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 dark:bg-zinc-300 animate-bounce" />
        </div>
      </div>
    </div>
  );
}

