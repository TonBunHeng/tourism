import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import travelService from '../../services/travelService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

export default function Provinces() {
  const [provinces, setProvinces] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    travelService.getProvinces()
      .then((res) => {
        if (!isMounted) return;
        if (res?.success) {
          const raw = res.data?.provinces || res.data?.data || res.data || [];
          setProvinces(Array.isArray(raw) ? raw : []);
        } else {
          setProvinces([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load provinces from API:', err);
        setProvinces([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const totalPages = Math.ceil(provinces.length / ITEMS_PER_PAGE);
  const paginatedProvinces = provinces.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">
            Regions & Municipalities
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Cambodian Provinces & Cities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Explore provinces and municipalities stored in the central database.
          </p>
        </div>
      </div>

      {/* Provinces Grid */}
      {isLoading ? (
        <LoadingSpinner text="Retrieving provinces from database..." />
      ) : provinces.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No provinces found in database"
          description="There are currently no active province records available."
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedProvinces.map((p) => (
              <Link
                key={p.id}
                to={`/destinations?province=${encodeURIComponent(p.name)}`}
                className="group rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                    {p.image || p.image_url ? (
                      <img
                        src={p.image || p.image_url}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-[#002D62]/10 to-blue-500/10">
                        <Globe size={40} className="text-[#002D62] dark:text-blue-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-[#002D62] dark:text-blue-400 font-bold text-[10px] shadow-sm">
                      {p.places_count ?? 0} Places
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-extrabold text-white text-base leading-tight drop-shadow-sm">
                        {p.name}
                      </h3>
                      {p.type && (
                        <div className="text-[11px] text-white/80 font-light mt-0.5">
                          {p.type}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-2 text-xs">
                    <p className="text-slate-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                      {p.description || 'No description recorded in database.'}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Regional Sites</span>
                  <span className="px-4 py-2 rounded-xl bg-[#002D62] group-hover:bg-[#001f44] text-white font-bold transition shadow-xs text-xs">
                    View Places
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            lastPage={totalPages}
            total={provinces.length}
            perPage={ITEMS_PER_PAGE}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}
    </div>
  );
}
