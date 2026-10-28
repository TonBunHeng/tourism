import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tags, ArrowRight, MapPin } from 'lucide-react';
import travelService from '../../services/travelService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    travelService.getCategories()
      .then((res) => {
        if (!isMounted) return;
        if (res?.success) {
          const raw = res.data?.categories || res.data?.data || res.data || [];
          setCategories(Array.isArray(raw) ? raw : []);
        } else {
          setCategories([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load categories from API:', err);
        setCategories([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-900 to-[#002D62] text-white p-8 sm:p-12 shadow-xl">
        <div className="relative max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200 border border-white/20">
            <Tags size={13} className="text-amber-300" />
            <span>Categories Database</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Destination Categories
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-light">
            Explore attraction categories configured in the central database.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <LoadingSpinner text="Retrieving categories from database..." />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No categories found in database"
          description="There are currently no active category records available."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/destinations?category=${c.id}`}
              className="group rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                  {c.image || c.image_url ? (
                    <img
                      src={c.image || c.image_url}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-[#002D62]/10 to-indigo-500/10">
                      <Tags size={36} className="text-[#002D62] dark:text-blue-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-[#002D62] dark:text-blue-400 font-bold text-[11px] shadow-sm">
                    {c.places_count ?? 0} Places
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-extrabold text-white text-base leading-tight drop-shadow-sm">
                      {c.name}
                    </h3>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                    {c.description || 'No description recorded in database.'}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-[#002D62] dark:text-blue-400 mt-2">
                <span>View Places</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
