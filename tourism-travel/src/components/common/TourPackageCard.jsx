import { Link } from 'react-router-dom';
import { Calendar, MapPin, Star, ArrowRight, Check, Users } from 'lucide-react';

export default function TourPackageCard({ tour, onBook }) {
  if (!tour) return null;

  return (
    <div className="group modern-card bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs hover:border-blue-300 dark:hover:border-blue-500/50 flex flex-col justify-between h-full transition-all">
      <div>
        {/* Cover Photo Frame */}
        <Link to={`/tours/${tour.id}`} className="block relative aspect-16/10 w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
          <img
            src={tour.image}
            alt={tour.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

          {/* Badge Top Left */}
          {tour.badge && (
            <div className="absolute top-3 left-3 z-10">
              <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm backdrop-blur-md">
                {tour.badge}
              </span>
            </div>
          )}

          {/* Duration Top Right */}
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-white/90 dark:bg-zinc-900/90 text-gray-900 dark:text-zinc-100 shadow-sm backdrop-blur-md flex items-center gap-1 border border-white/20 dark:border-zinc-700">
              <Calendar size={12} className="text-[#003E83] dark:text-blue-400" />
              <span>{tour.duration}</span>
            </span>
          </div>

          {/* Location & Group Size on Image */}
          <div className="absolute bottom-3 left-3.5 right-3.5 z-10 flex items-center justify-between text-white text-xs font-semibold drop-shadow-sm">
            <span className="flex items-center gap-1 truncate max-w-[180px]">
              <MapPin size={13} className="text-amber-400 shrink-0" />
              <span>{tour.destination}</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] text-blue-200">
              <Users size={12} />
              <span>{tour.groupSize || 'Small Group'}</span>
            </span>
          </div>
        </Link>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-gray-900 dark:text-white font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{tour.rating ? Number(tour.rating).toFixed(1) : '5.0'}</span>
              <span className="text-gray-400 font-normal">({tour.reviewsCount || 0})</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60">
              Instant Confirmation
            </span>
          </div>

          <Link to={`/tours/${tour.id}`} className="block">
            <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-[#003E83] dark:group-hover:text-blue-400 transition-colors line-clamp-1">
              {tour.title}
            </h3>
          </Link>

          <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {tour.description}
          </p>

          {/* Highlights Mini-list */}
          {tour.highlights && tour.highlights.length > 0 && (
            <div className="space-y-1 pt-1">
              {tour.highlights.slice(0, 2).map((item, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-zinc-300">
                  <Check size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-4 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs bg-gray-50/70 dark:bg-zinc-800/40">
        <div>
          <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">From</span>
          <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
            ${tour.price} <span className="text-xs font-normal text-gray-500">/ person</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => onBook && onBook(tour)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#003E83] hover:bg-[#002e62] text-white font-bold rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <span>Book Tour</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
