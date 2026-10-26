import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit3, Loader2 } from 'lucide-react';
import guideService from '../../services/guideService';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function GuideEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await guideService.getEvents();
        const list = res?.data?.events || res?.data || res || [];
        setEvents(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Guide Portal', to: '/guide/dashboard' },
          { label: 'Events & Festivals' }
        ]}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Cultural Events & Festival Calendar</h1>
        </div>

        <Link
          to="/guide/events/new"
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Schedule Event
        </Link>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((e) => (
            <div key={e.id} className="p-5 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between shadow-xs transition-colors">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">{e.category || 'Cultural Event'}</span>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">{e.title}</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2">{e.description}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-zinc-500 font-semibold">{e.start_date}</span>
                <Link
                  to={`/guide/events/${e.id}/edit`}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
