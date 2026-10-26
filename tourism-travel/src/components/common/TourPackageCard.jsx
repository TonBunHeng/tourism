import { Link } from 'react-router-dom';
import { Clock, MapPin, Users, Check, ArrowRight } from 'lucide-react';

export default function TourPackageCard({ tour, onBook }) {
  if (!tour) return null;

  const ratingVal = tour.rating ? Number(tour.rating).toFixed(1) : '5.0';
  const badgeLabel = tour.badge || 'BEST SELLER';
  const durationLabel = tour.duration || '3 Days / 2 Nights';
  const locationLabel = tour.destination || tour.location || 'Siem Reap';
  const maxGuestsLabel = tour.groupSize ? `Max ${tour.groupSize} guests` : 'Max 10 guests';
  const reviewsCount = tour.reviewsCount || 342;

  // Fallback highlights if not present
  const highlights = tour.highlights && tour.highlights.length > 0
    ? tour.highlights
    : [
        `${tour.title || 'Cambodia'} VIP access with professional guide`,
        'Includes comfortable air-conditioned transfers & entrance pass'
      ];

  return (
    <div className="group bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Cover Photo Frame */}
        <Link to={`/tours/${tour.id}`} className="block relative aspect-16/10 w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
          <img
            src={tour.image}
            alt={tour.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Badge Top Left */}
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="px-3.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-full bg-[#2563eb] text-white shadow-sm">
              {badgeLabel}
            </span>
          </div>

          {/* Duration Top Right */}
          <div className="absolute top-3.5 right-3.5 z-10">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-white text-gray-900 shadow-sm flex items-center gap-1.5 border border-white/20">
              <Clock size={14} className="text-[#2563eb]" />
              <span>{durationLabel}</span>
            </span>
          </div>

          {/* Location & Max Guests on Image */}
          <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-white text-xs font-bold drop-shadow-sm">
            <span className="flex items-center gap-1.5 truncate max-w-[200px]">
              <MapPin size={14} className="text-amber-400 shrink-0 fill-amber-400/20" />
              <span>{locationLabel}</span>
            </span>
            <span className="flex items-center gap-1.5 text-white/90 font-medium shrink-0">
              <Users size={14} className="text-white/80" />
              <span>{maxGuestsLabel}</span>
            </span>
          </div>
        </Link>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-3">
          {/* Review Rating Badge + Free Cancellation Tag */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#0f294d] text-white text-xs font-black">
                {ratingVal}
              </span>
              <span className="font-bold text-[#0f294d] dark:text-white text-sm">
                Excellent
              </span>
              <span className="text-xs text-gray-400 font-normal">
                ({reviewsCount})
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-md bg-[#ecfdf5] dark:bg-emerald-950/50 text-[#059669] dark:text-emerald-400 text-xs font-bold">
              Free Cancellation
            </span>
          </div>

          {/* Title */}
          <Link to={`/tours/${tour.id}`} className="block">
            <h3 className="text-lg font-black text-[#0f294d] dark:text-white group-hover:text-[#2563eb] transition-colors line-clamp-1 leading-snug">
              {tour.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs sm:text-[13px] text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {tour.description}
          </p>

          {/* Highlights Mini-list with 2 Green Checkmarks */}
          <div className="space-y-1.5 pt-1">
            {highlights.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs sm:text-[13px] text-gray-600 dark:text-zinc-300">
                <Check size={14} className="text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
                <span className="truncate">{item}</span>
              </div>
            ))}
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
              ${tour.price}
            </span>
            <span className="text-xs font-normal text-gray-500 ml-1">
              / person
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onBook ? onBook(tour) : null}
          className="px-5 py-2.5 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <span>Book Tour</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
