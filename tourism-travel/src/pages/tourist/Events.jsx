import { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  MapPin, 
  X
} from 'lucide-react';
import travelService from '../../services/travelService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const ITEMS_PER_PAGE = 9;

export default function Events() {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 9 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeEventDetails, setActiveEventDetails] = useState(null);

  const loadEvents = useCallback(() => {
    setIsLoading(true);
    travelService.getEvents({ page: currentPage, per_page: ITEMS_PER_PAGE })
      .then((res) => {
        if (res?.success) {
          const raw = res.data?.events || res.data?.data || res.data || [];
          setEvents(Array.isArray(raw) ? raw : []);
          setPagination({
            current_page: res.meta?.current_page || currentPage,
            last_page: res.meta?.last_page || 1,
            total: res.meta?.total || 0,
            per_page: res.meta?.per_page || ITEMS_PER_PAGE,
          });
        } else {
          setEvents([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load events from API:', err);
        setEvents([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentPage]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const totalPages = pagination.last_page;
  const paginatedEvents = events;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">
            Events & Celebrations
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Festivals & Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Browse cultural events, festivals, and celebrations recorded in the database.
          </p>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <LoadingSpinner text="Retrieving events from database..." />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found in database"
          description="There are currently no active events available in the database."
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedEvents.map((ev) => (
              <div
                key={ev.id}
                className="group rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                    {ev.image_url || ev.image ? (
                      <img
                        src={ev.image_url || ev.image}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-rose-900/10 to-amber-900/10">
                        <Calendar size={36} className="text-amber-500" />
                      </div>
                    )}

                    {ev.category && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-rose-600/90 text-white text-[10px] font-bold shadow-sm">
                          {ev.category}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
                      <Calendar size={13} />
                      <span>{ev.start_date} {ev.end_date && ev.end_date !== ev.start_date ? `to ${ev.end_date}` : ''}</span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#002D62] dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {ev.title}
                    </h3>

                    {(ev.location || ev.province) && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                        <MapPin size={12} className="text-rose-500 shrink-0" />
                        <span className="truncate">{ev.location || ev.province}</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                      {ev.description || 'No description recorded in database.'}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {ev.status || 'Active'}
                  </span>

                  <button
                    type="button"
                    onClick={() => setActiveEventDetails(ev)}
                    className="px-4 py-2 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white font-bold transition cursor-pointer"
                  >
                    Event Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            lastPage={totalPages}
            total={pagination.total}
            perPage={pagination.per_page}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {/* Event Details Modal */}
      {activeEventDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {activeEventDetails.title}
                </h2>
                <div className="text-xs text-slate-500 mt-1">
                  {activeEventDetails.location || activeEventDetails.province}
                </div>
              </div>
              <button onClick={() => setActiveEventDetails(null)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {activeEventDetails.image_url && (
              <img
                src={activeEventDetails.image_url}
                alt={activeEventDetails.title}
                className="w-full h-56 object-cover rounded-2xl"
              />
            )}

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">About This Event</h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                {activeEventDetails.description || 'No description provided in database.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveEventDetails(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
