import { Link } from 'react-router-dom';
import { Clock, MapPin, Users, Check, ArrowRight } from 'lucide-react';

export default function TourGuideCard({ guide, onBook }) {
  if (!guide) return null;

  const ratingVal = guide.rating ? Number(guide.rating).toFixed(1) : '5.0';
  const locationLabel = guide.province || 'Cambodia';
  const reviewsCount = guide.reviewsCount || 112;
  const dailyPrice = guide.dailyRate || guide.daily_rate || 45;
  const imageCover =
    guide.avatar ||
    guide.coverImage ||
    guide.cover_image ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';

  const languagesList = Array.isArray(guide.languages)
    ? guide.languages.join(', ')
    : 'English, Khmer, French';

  return (
    <div className="group bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Cover Photo Frame */}
        <Link to={`/guides/${guide.id}`} className="block relative aspect-16/10 w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
          <img
            src={imageCover}
            alt={guide.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Badge Top Left */}
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="px-3.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-full bg-[#2563eb] text-white shadow-sm">
              CERTIFIED GUIDE
            </span>
          </div>

          {/* Duration Top Right */}
          <div className="absolute top-3.5 right-3.5 z-10">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-white text-gray-900 shadow-sm flex items-center gap-1.5 border border-white/20">
              <Clock size={14} className="text-[#2563eb]" />
              <span>Full Day (8 hrs)</span>
            </span>
          </div>

          {/* Location & Languages on Image */}
          <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-white text-xs font-bold drop-shadow-sm">
            <span className="flex items-center gap-1.5 truncate max-w-[200px]">
              <MapPin size={14} className="text-amber-400 shrink-0 fill-amber-400/20" />
              <span>{locationLabel}</span>
            </span>
            <span className="flex items-center gap-1.5 text-white/90 font-medium shrink-0">
              <Users size={14} className="text-white/80" />
              <span>Private & Groups</span>
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
          <Link to={`/guides/${guide.id}`} className="block">
            <h3 className="text-lg font-black text-[#0f294d] dark:text-white group-hover:text-[#2563eb] transition-colors line-clamp-1 leading-snug">
              {guide.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs sm:text-[13px] text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {guide.bio || `${guide.title || 'Official Tour Guide'} with deep knowledge of Angkor temples, Khmer history, and local hidden gems.`}
          </p>

          {/* Highlights Mini-list with 2 Green Checkmarks */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-start gap-2 text-xs sm:text-[13px] text-gray-600 dark:text-zinc-300">
              <Check size={14} className="text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
              <span className="truncate">Fluent in {languagesList}</span>
            </div>
            <div className="flex items-start gap-2 text-xs sm:text-[13px] text-gray-600 dark:text-zinc-300">
              <Check size={14} className="text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
              <span className="truncate">Ministry of Tourism certified heritage & cultural guide</span>
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
              ${dailyPrice}
            </span>
            <span className="text-xs font-normal text-gray-500 ml-1">
              / day
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onBook ? onBook(guide) : null}
          className="px-5 py-2.5 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <span>Book Guide</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
