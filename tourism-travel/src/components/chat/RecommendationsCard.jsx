import { Sparkles, Star, MapPin, ExternalLink } from 'lucide-react';

export default function RecommendationsCard({ recommendations = [], language = 'en' }) {
  const isKm = language === 'km';

  if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-2.5 space-y-1.5 w-full">
      <div className="flex items-center space-x-1 text-[11px] font-bold text-[#003E83] dark:text-blue-400 uppercase tracking-wider">
        <Sparkles size={12} />
        <span>{isKm ? '✨ គោលដៅណែនាំ' : '✨ Recommended Destinations'}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {recommendations.slice(0, 4).map((item, idx) => {
          const displayName = isKm && item.name_km ? item.name_km : item.name;
          const displayDesc = isKm && item.description_km ? item.description_km : item.description;
          const displayPrice = item.price || (item.estimated_cost_usd === 0 ? 'Free' : item.estimated_cost_usd ? `$${item.estimated_cost_usd}` : 'Standard Entry');

          return (
            <div
              key={item.id || idx}
              className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {displayName}
                  </h4>
                  {item.match_score && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded-full border border-emerald-200/60 shrink-0">
                      <Star size={9} className="fill-emerald-500 text-emerald-500" />
                      {item.match_score}%
                    </span>
                  )}
                </div>

                <div className="flex items-center text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                  <MapPin size={10} className="text-[#003E83] dark:text-blue-400 mr-0.5 shrink-0" />
                  <span className="truncate">{item.province}</span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {displayDesc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {displayPrice}
                </span>

                {item.google_maps_url ? (
                  <a
                    href={item.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 font-bold text-[#003E83] dark:text-blue-400 hover:underline"
                  >
                    <span>{isKm ? 'ផែនទី' : 'Maps'}</span>
                    <ExternalLink size={9} />
                  </a>
                ) : (
                  <span className="text-slate-400 text-[10px]">{item.category || 'Attraction'}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

