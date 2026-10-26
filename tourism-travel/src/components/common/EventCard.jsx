import { MapPin, ArrowRight } from 'lucide-react';

export default function EventCard({ event, onViewDetails }) {
  const imageUrl = event.image_url || 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80';
  const status = event.status || event.computed_status || 'Upcoming';

  const isOngoing = status.toLowerCase() === 'ongoing';
  const isUpcoming = status.toLowerCase() === 'upcoming';

  const handleClick = () => {
    if (onViewDetails) {
      onViewDetails(event);
    }
  };

  // Format date helper for calendar badge
  const parseDateParts = (dateStr) => {
    if (!dateStr) return { month: 'EVENT', day: '2026' };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { month: 'DATE', day: dateStr.slice(0, 5) };
      const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      const day = d.getDate();
      return { month, day };
    } catch {
      return { month: 'EVENT', day: '2026' };
    }
  };

  const dateParts = parseDateParts(event.start_date);

  return (
    <div
      onClick={handleClick}
      className="group modern-card bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs hover:border-blue-300 dark:hover:border-blue-500/50 flex flex-col justify-between cursor-pointer transition-all h-full"
    >
      <div>
        {/* Cover Photo Frame */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

          {/* Calendar Date Block */}
          <div className="absolute top-3 left-3 z-10 overflow-hidden rounded-2xl bg-white/95 dark:bg-zinc-900/95 shadow-md backdrop-blur-md border border-white/40 dark:border-zinc-700 text-center min-w-[50px]">
            <div className="bg-[#003E83] dark:bg-blue-600 text-[10px] font-bold text-white uppercase px-2 py-0.5 tracking-wider">
              {dateParts.month}
            </div>
            <div className="text-sm font-extrabold text-gray-900 dark:text-white py-1 px-2">
              {dateParts.day}
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm border ${
                isOngoing
                  ? 'bg-emerald-500/90 text-white border-emerald-400'
                  : isUpcoming
                  ? 'bg-blue-600/90 text-white border-blue-400'
                  : 'bg-zinc-800/85 text-zinc-300 border-zinc-700'
              }`}
            >
              {isOngoing && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
              {status}
            </span>
          </div>

          {/* Location on image overlay */}
          <div className="absolute bottom-2.5 left-3.5 z-10 text-white flex items-center gap-1.5 text-xs font-semibold drop-shadow-sm">
            <MapPin size={13} className="text-amber-400 shrink-0" />
            <span className="truncate max-w-[220px]">
              {event.location || event.province || 'Cambodia'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-2">
          <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#003E83] dark:group-hover:text-blue-400 transition-colors">
            {event.title}
          </h3>

          {event.description ? (
            <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-zinc-500 italic">
              Explore authentic Khmer traditions and festivities.
            </p>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3.5 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs bg-gray-50/70 dark:bg-zinc-800/40">
        <span className="text-gray-400 dark:text-zinc-500 truncate max-w-[150px] font-medium">
          {event.organizer || 'Tourism Festival'}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onViewDetails) onViewDetails(event);
          }}
          className="inline-flex items-center gap-1.5 font-bold text-[#003E83] dark:text-blue-400 hover:underline cursor-pointer group-hover:translate-x-1 transition-transform"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
