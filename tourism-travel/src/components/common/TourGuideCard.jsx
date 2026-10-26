import { Link } from 'react-router-dom';
import { Star, MapPin, CheckCircle2, ShieldCheck, Languages, ArrowRight } from 'lucide-react';

export default function TourGuideCard({ guide, onBook }) {
  if (!guide) return null;

  return (
    <div className="group modern-card bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs hover:border-blue-300 dark:hover:border-blue-500/50 flex flex-col justify-between h-full transition-all">
      <div>
        {/* Guide Header Banner & Avatar */}
        <Link to={`/guides/${guide.id}`} className="block relative h-24 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 overflow-hidden">
          <img
            src={guide.coverImage || guide.cover_image || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80'}
            alt={guide.name}
            className="w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2.5 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 dark:bg-zinc-900/90 text-emerald-700 dark:text-emerald-400 backdrop-blur-md border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {guide.availability || 'Available'}
            </span>
          </div>
        </Link>

        {/* Profile Info */}
        <div className="px-5 pt-0 pb-4 relative space-y-3">
          {/* Avatar overlapping banner */}
          <div className="flex items-end justify-between -mt-10 mb-2">
            <Link to={`/guides/${guide.id}`} className="relative block group-hover:scale-105 transition-transform">
              <img
                src={guide.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={guide.name}
                className="w-18 h-18 rounded-2xl object-cover ring-4 ring-white dark:ring-zinc-900 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full shadow-xs" title="Ministry of Tourism Licensed">
                <ShieldCheck size={13} />
              </div>
            </Link>

            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Daily Rate</span>
              <span className="text-lg font-extrabold text-[#003E83] dark:text-blue-400">
                ${guide.dailyRate || guide.daily_rate || 45} <span className="text-xs font-normal text-gray-500">/ day</span>
              </span>
            </div>
          </div>

          <div>
            <Link to={`/guides/${guide.id}`} className="inline-flex items-center gap-1.5 group/title">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white group-hover/title:text-[#003E83] dark:group-hover/title:text-blue-400 transition-colors">
                {guide.name}
              </h3>
              <CheckCircle2 size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
            </Link>
            <p className="text-xs text-[#003E83] dark:text-blue-300 font-semibold">{guide.title || 'Certified Tour Guide'}</p>
            <p className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
              <MapPin size={12} className="text-amber-500" />
              <span>{guide.province || 'Cambodia'} • {guide.experienceYears || guide.experience_years || 5}+ years exp</span>
            </p>
          </div>

          <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {guide.bio}
          </p>

          {/* Languages Chips */}
          <div className="flex flex-wrap items-center gap-1 pt-1">
            <Languages size={13} className="text-gray-400 mr-0.5 shrink-0" />
            {guide.languages.map((lang, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300"
              >
                {lang.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3.5 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs bg-gray-50/70 dark:bg-zinc-800/40">
        <div className="flex items-center gap-1 text-gray-900 dark:text-white font-bold">
          <Star size={13} className="fill-amber-400 text-amber-400" />
          <span>{guide.rating.toFixed(2)}</span>
          <span className="text-gray-400 text-[11px] font-normal">({guide.reviewsCount})</span>
        </div>

        <button
          type="button"
          onClick={() => onBook && onBook(guide)}
          className="inline-flex items-center gap-1 px-4 py-2 bg-[#003E83] hover:bg-[#002e62] text-white font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <span>Book Guide</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
