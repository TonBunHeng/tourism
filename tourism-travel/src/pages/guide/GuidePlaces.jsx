import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit3, Loader2 } from 'lucide-react';
import guideService from '../../services/guideService';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function GuidePlaces() {
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const res = await guideService.getPlaces({ search });
      const list = res?.data?.places || res?.data || res || [];
      setPlaces(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPlaces();
  }, [fetchPlaces]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Guide Portal', to: '/guide/dashboard' },
          { label: 'Destinations' }
        ]}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Destination Management</h1>
        </div>

        <Link
          to="/guide/places/new"
          className="px-3.5 py-2 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] dark:text-zinc-950 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Destination
        </Link>
      </div>

      {/* Search Card */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div className="relative">
          <input
            type="text"
            placeholder="Search destination by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs font-medium text-gray-900 dark:text-white focus:outline-none"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#003E83] dark:text-[#60a5fa] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place) => (
            <div key={place.id} className="p-5 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between shadow-xs transition-colors">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#003E83] dark:text-[#60a5fa]">{place.category?.name || 'Attraction'}</span>
                <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-1">{place.name}</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2">{place.description}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-zinc-500 font-semibold">{place.province?.name || 'Cambodia'}</span>
                <Link
                  to={`/guide/places/${place.id}/edit`}
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
