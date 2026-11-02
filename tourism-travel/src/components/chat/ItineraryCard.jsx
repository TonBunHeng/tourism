import { useState } from 'react';
import { Sparkles, Copy, Check, Star, Flag } from 'lucide-react';

export default function ItineraryCard({ itinerary, language = 'en' }) {
  const [activeDay, setActiveDay] = useState(1);
  const [copied, setCopied] = useState(false);
  const isKm = language === 'km';

  if (!itinerary || !itinerary.days || !Array.isArray(itinerary.days) || itinerary.days.length === 0) {
    return null;
  }

  const currentDayData =
    itinerary.days.find((d) => d.day === activeDay) || itinerary.days[0] || {};

  const handleCopy = (e) => {
    e.stopPropagation();
    let text = `${itinerary.title || 'Cambodia Itinerary'}\n`;
    text += `Destination: ${itinerary.destination || 'Cambodia'}\n`;
    text += `Duration: ${itinerary.duration_days || itinerary.days.length} Days\n\n`;

    (itinerary.days || []).forEach((day) => {
      text += `DAY ${day.day}: ${day.theme || day.location || ''}\n`;
      (day.activities || []).forEach((act) => {
        text += `  • ${act.time || ''} — ${act.title || ''} (${act.transport || 'Transit'})\n    ${act.description || ''}\n`;
      });
      text += '\n';
    });

    if (itinerary.formatted_total_budget) {
      text += `Estimated Total Budget: ${itinerary.formatted_total_budget}\n`;
    }

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden text-slate-800 dark:text-slate-100 w-full">
      {/* Top Header with title and copy button */}
      <div className="px-3 py-2 bg-gradient-to-r from-blue-500/10 via-sky-500/5 to-transparent border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 min-w-0">
          <Sparkles size={13} className="text-[#003E83] dark:text-blue-400 shrink-0" />
          <span className="font-bold text-xs truncate text-slate-900 dark:text-white">
            {itinerary.title || (isKm ? 'គម្រោងដំណើរកម្សាន្ត' : 'Custom Itinerary')}
          </span>
          <span className="text-[11px] text-slate-500 shrink-0">
            ({itinerary.duration_days || itinerary.days.length}d • {itinerary.destination || 'Cambodia'})
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-500" />
              <span>{isKm ? 'បានចម្លង' : 'Copied'}</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>{isKm ? 'ចម្លង' : 'Copy'}</span>
            </>
          )}
        </button>
      </div>

      {/* Recommendation note banner */}
      {itinerary.recommendation_note && (
        <div className="px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
          <Star size={11} className="fill-amber-500 text-amber-500 shrink-0" />
          <span className="leading-tight">{itinerary.recommendation_note}</span>
        </div>
      )}

      {/* Day Switcher Tabs */}
      <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {itinerary.days.map((day) => (
          <button
            key={day.day}
            type="button"
            onClick={() => setActiveDay(day.day)}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
              activeDay === day.day
                ? 'bg-[#003E83] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {isKm ? `ថ្ងៃ ${day.day}` : `Day ${day.day}`}
          </button>
        ))}
      </div>

      {/* Day Content */}
      <div className="p-2.5 space-y-2">
        {currentDayData.theme && (
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#003E83] dark:text-blue-400">
            <Flag size={11} />
            <span>{currentDayData.theme}</span>
          </div>
        )}

        <div className="space-y-1.5">
          {(currentDayData.activities || []).slice(0, 5).map((act, idx) => (
            <div
              key={idx}
              className="p-2 rounded-lg bg-slate-50/60 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 text-xs"
            >
              <div className="flex items-center justify-between gap-1 font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                <span className="truncate">
                  {act.time} — {act.title}
                </span>
                {act.transport && (
                  <span className="text-[10px] font-normal px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 rounded border border-blue-200/60 dark:border-blue-800/60 shrink-0">
                    {act.transport}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                {act.description}
              </p>
              {act.cost && (
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  Est: {act.cost}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Total Budget Footer */}
      {itinerary.formatted_total_budget && (
        <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-500">
            {isKm ? 'ថវិកាប៉ាន់ស្មាន៖' : 'Estimated Budget:'}
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
            {itinerary.formatted_total_budget}
          </span>
        </div>
      )}
    </div>
  );
}

