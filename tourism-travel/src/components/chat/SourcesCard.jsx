import { Sparkles, MapPin, ExternalLink, Image } from 'lucide-react';

export default function SourcesCard({ sources = [], language = 'en' }) {
  const isKm = language === 'km';

  if (!sources || !Array.isArray(sources) || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5 w-full">
      <div className="flex items-center justify-between px-0.5">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
          <Sparkles size={11} className="text-amber-500 shrink-0" />
          <span>{isKm ? 'ប្រភពយោង AI ទេសចរណ៍៖' : 'AI Tourism Source:'}</span>
        </p>

        <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#003E83] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800/50">
          AI Grounded
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.slice(0, 2).map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-50/80 dark:bg-[#212121] border border-slate-200/90 dark:border-zinc-800 rounded-sm p-2.5 text-xs hover:border-[#003E83] dark:hover:border-blue-500 transition-colors shadow-2xs"
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-xs text-slate-800 dark:text-zinc-200 truncate">
                {item.name || item.title || 'Cambodia Destination'}
              </h4>
              {(item.category || item.type) && (
                <span className="text-[10px] font-medium text-slate-400 shrink-0">
                  {item.category || item.type}
                </span>
              )}
            </div>

            {(item.location || item.province) && (
              <div className="flex items-center text-[10px] text-slate-500 dark:text-zinc-400 mb-1.5">
                <MapPin size={10} className="text-[#003E83] dark:text-blue-400 mr-1 shrink-0" />
                <span className="truncate">{item.location || item.province}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-zinc-800 text-[10px]">
              {(item.url || (item.website_links && item.website_links[0]?.url)) && (
                <a
                  href={item.url || item.website_links[0]?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <span>{isKm ? 'គេហទំព័រ' : 'Website'}</span>
                  <ExternalLink size={8} />
                </a>
              )}

              {item.picture_links && item.picture_links[0]?.image_url && (
                <a
                  href={item.picture_links[0].image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  <Image size={9} />
                  <span>{isKm ? 'រូបភាព' : 'Photo'}</span>
                  <ExternalLink size={8} />
                </a>
              )}

              {item.google_maps_url && (
                <a
                  href={item.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#003E83] dark:text-blue-400 hover:underline"
                >
                  <span>{isKm ? 'មើលផែនទី' : 'Maps'}</span>
                  <ExternalLink size={8} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

