import { X, Calendar, Clock, MapPin, Users, Building, ExternalLink, Sparkles } from 'lucide-react';

export default function EventDetailsModal({ isOpen, event, onClose }) {
  if (!isOpen || !event) return null;

  const imageUrl = event.image_url || 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80';
  const status = event.status || event.computed_status || 'Upcoming';

  const statusColor = status === 'Ongoing'
    ? 'bg-emerald-500 text-white'
    : status === 'Upcoming'
    ? 'bg-blue-600 text-white'
    : 'bg-gray-700 text-white';

  const mapQuery = encodeURIComponent(`${event.location || event.province || event.title}, Cambodia`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200/80 dark:border-zinc-800 overflow-hidden my-8 p-6 space-y-5 transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cover Scenery Picture */}
        <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-800 shadow-sm">
          <img src={imageUrl} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-md ${statusColor}`}>
              {status}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#003E83] dark:text-blue-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Cultural Celebration</span>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {event.title}
          </h2>
          <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line font-normal pt-1">
            {event.description || 'Join vibrant community celebrations and experience traditional Khmer cultural heritage.'}
          </p>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700/60 space-y-1">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Start Date</span>
            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
              <Calendar className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
              <span>{event.start_date || 'TBD'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700/60 space-y-1">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">End Date</span>
            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
              <Clock className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
              <span>{event.end_date || 'TBD'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700/60 space-y-1">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Organizer</span>
            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white truncate">
              <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{event.organizer || 'Ministry of Tourism'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700/60 space-y-1">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Visitors</span>
            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>{event.expected_attendees ? event.expected_attendees.toLocaleString() : 'Public Open'}</span>
            </div>
          </div>
        </div>

        {/* Location Bar & Map Button */}
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-zinc-800/60 border border-blue-200/80 dark:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <div>
              <span className="font-extrabold text-gray-900 dark:text-white block">Event Venue</span>
              <span className="text-gray-600 dark:text-zinc-300 font-medium">{event.location || event.province || 'Cambodia'}</span>
            </div>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 text-gray-800 dark:text-white hover:bg-gray-50 border border-gray-200 dark:border-zinc-700 font-bold transition-all flex items-center gap-1.5 shadow-2xs self-stretch sm:self-auto justify-center"
          >
            <span>Open Map</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
