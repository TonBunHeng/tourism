import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Calendar, 
  Image as ImageIcon, 
  Plus, 
  Star, 
  Loader2, 
  ChevronRight,
  Sparkles,
  ShieldCheck,
  MapPin,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import guideService from '../../services/guideService';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function GuideDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await guideService.getDashboardStats();
        setStats(res?.data || res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#003E83] dark:text-[#60a5fa] animate-spin" />
        <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Loading Guide Dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Destinations Curated',
      count: stats?.places_count || 0,
      link: '/guide/places',
      actionText: 'Manage Places',
      icon: Compass,
      gradient: 'from-blue-600 to-sky-500',
      bgLight: 'bg-blue-50 dark:bg-blue-950/40',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Upcoming Events',
      count: stats?.events_count || 0,
      link: '/guide/events',
      actionText: 'Manage Events',
      icon: Calendar,
      gradient: 'from-indigo-600 to-purple-500',
      bgLight: 'bg-indigo-50 dark:bg-indigo-950/40',
      textColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'Media Gallery Assets',
      count: stats?.media_count || 0,
      link: '/guide/gallery',
      actionText: 'Curate Gallery',
      icon: ImageIcon,
      gradient: 'from-emerald-600 to-teal-500',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Pending Reviews',
      count: stats?.pending_reviews_count || 0,
      link: '/guide/reviews',
      actionText: 'Review Feed',
      icon: Star,
      gradient: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <Breadcrumb items={[{ label: 'Tour Guide Portal' }]} />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#003E83] via-blue-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Ministry of Tourism Licensed Guide Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Tour Guide & Content Editor Hub
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
              Curate Cambodian heritage sites, publish immersive itineraries, organize cultural festivals, and engage with traveler reviews to ensure safe and authentic tourism experiences.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <Link
              to="/guide/places/new"
              className="px-4 py-2.5 bg-white text-[#003E83] hover:bg-blue-50 text-xs font-extrabold rounded-2xl shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#003E83]" />
              <span>Add Destination</span>
            </Link>
            <Link
              to="/guide/events/new"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-2xl shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Schedule Event</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              to={item.link}
              className="modern-card group p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">
                  {item.title}
                </span>
                <div className={`w-10 h-10 rounded-2xl ${item.bgLight} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <Icon className={`w-5 h-5 ${item.textColor}`} />
                </div>
              </div>

              <div className="my-4">
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {item.count}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800/80 text-xs font-bold">
                <span className={item.textColor}>{item.actionText}</span>
                <ChevronRight className={`w-4 h-4 ${item.textColor} transition-transform group-hover:translate-x-1`} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Editor Shortcuts & Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Shortcuts */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 sm:p-7 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Editor Curation Shortcuts</span>
            </h2>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Fast Actions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/guide/places/new"
              className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/70 dark:border-zinc-700/60 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#003E83] dark:text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-1">
                Create Temple / Site Guide
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed">
                Add dress codes, opening hours, ticket fees, and historical significance.
              </p>
            </Link>

            <Link
              to="/guide/events/new"
              className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/70 dark:border-zinc-700/60 hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-1">
                Schedule Cultural Event
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed">
                Publish Water Festival, Khmer New Year, or local pagoda gatherings.
              </p>
            </Link>

            <Link
              to="/guide/gallery"
              className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/70 dark:border-zinc-700/60 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-1">
                Upload Curated Scenery
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed">
                Upload verified high-resolution photography for temple guides and provinces.
              </p>
            </Link>

            <Link
              to="/guide/reviews"
              className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/70 dark:border-zinc-700/60 hover:border-amber-500 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Star className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-1">
                Moderate & Reply Reviews
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed">
                Provide local insights and responses to questions left by international travelers.
              </p>
            </Link>
          </div>
        </div>

        {/* Right Column: Role Standards & Guidelines */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-6 sm:p-7 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="pb-3 border-b border-gray-100 dark:border-zinc-800">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Guide Code of Ethics</span>
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
              Approved by the Ministry of Tourism of the Kingdom of Cambodia
            </p>
          </div>

          <div className="space-y-3 text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
              <p><strong>Cultural Integrity:</strong> Respect temple etiquette, monks, and historical accuracy at all UNESCO heritage sites.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
              <p><strong>Transparent Pricing:</strong> Always quote clear daily tour rates in USD or KHR without undisclosed fees.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
              <p><strong>Eco-Tourism:</strong> Encourage leave-no-trace practices in Kulen Mountain, Koh Rong, and Cardamom sanctuaries.</p>
            </div>
          </div>

          <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 rounded-2xl border border-blue-200/80 dark:border-blue-900/50">
            <div className="flex items-center gap-2 text-xs font-bold text-[#003E83] dark:text-blue-300 mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Tip for Higher Bookings</span>
            </div>
            <p className="text-[11px] text-blue-900/80 dark:text-blue-200 leading-relaxed">
              Guides with active language certifications (Khmer, English, French, Chinese, Japanese) receive up to 3x more tourist inquiries during high season (October – April).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
