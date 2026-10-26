import { Clock, MapPin, Users, Check, ArrowRight } from 'lucide-react';

export default function EventCard({ event, onViewDetails }) {
  if (!event) return null;

  const imageUrl =
    event.image_url ||
    event.image ||
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80';
  const status = event.status || event.computed_status || 'UPCOMING';
  const locationLabel = event.location || event.province || 'Cambodia';
  const priceVal = event.price ? (String(event.price).startsWith('$') ? event.price : `$${event.price}`) : 'Free';

  // Format date
  const formatDateRange = () => {
    if (!event.start_date) return 'Annual Festival';
    try {
      const d = new Date(event.start_date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return event.start_date;
    }
  };

  const handleClick = () => {
    if (onViewDetails) onViewDetails(event);
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full cursor-pointer"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Badge Top Left */}
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="px-3.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-full bg-[#2563eb] text-white shadow-sm">
              {status}
            </span>
          </div>

          {/* Duration Top Right */}
          <div className="absolute top-3.5 right-3.5 z-10">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-white text-gray-900 shadow-sm flex items-center gap-1.5 border border-white/20">
              <Clock size={14} className="text-[#2563eb]" />
              <span>{formatDateRange()}</span>
            </span>
          </div>

          {/* Location & Guests on Image */}
          <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-white text-xs font-bold drop-shadow-sm">
            <span className="flex items-center gap-1.5 truncate max-w-[200px]">
              <MapPin size={14} className="text-amber-400 shrink-0 fill-amber-400/20" />
              <span>{locationLabel}</span>
            </span>
            <span className="flex items-center gap-1.5 text-white/90 font-medium shrink-0">
              <Users size={14} className="text-white/80" />
              <span>Open to Public</span>
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-3">
          {/* Review Rating Badge + Free Cancellation / Entry Tag */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#0f294d] text-white text-xs font-black">
                5.0
              </span>
              <span className="font-bold text-[#0f294d] dark:text-white text-sm">
                Excellent
              </span>
              <span className="text-xs text-gray-400 font-normal">
                (260)
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-[#ecfdf5] dark:bg-emerald-950/50 text-[#059669] dark:text-emerald-400 text-xs font-bold">
              Free Cancellation
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-black text-[#0f294d] dark:text-white group-hover:text-[#2563eb] transition-colors line-clamp-1 leading-snug">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-[13px] text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {event.description || 'Celebrate Cambodian cultural festivals, spiritual parades, and traditional Khmer celebrations.'}
          </p>

          {/* Highlights Mini-list with 2 Green Checkmarks */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-start gap-2 text-xs sm:text-[13px] text-gray-600 dark:text-zinc-300">
              <Check size={14} className="text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
              <span className="truncate">Authentic Cambodian cultural traditions and festivities</span>
            </div>
            <div className="flex items-start gap-2 text-xs sm:text-[13px] text-gray-600 dark:text-zinc-300">
              <Check size={14} className="text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
              <span className="truncate">Official national festival program with visitor assistance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 sm:px-6 py-4 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between bg-white dark:bg-zinc-900 rounded-b-3xl">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block leading-none mb-1">
            FROM
          </span>
          <div className="flex items-baseline">
            <span className="text-2xl font-black text-[#2563eb] dark:text-blue-400">
              {priceVal}
            </span>
            <span className="text-xs font-normal text-gray-500 ml-1">
              / entry
            </span>
          </div>
        </div>

        <button
          type="button"
          className="px-5 py-2.5 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
        >
          <span>Event Details</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
