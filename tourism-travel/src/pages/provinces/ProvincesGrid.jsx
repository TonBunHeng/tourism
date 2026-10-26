import ProvinceCard from '../../components/common/ProvinceCard';
import { Compass } from 'lucide-react';

export default function ProvincesGrid({ provinces }) {
  if (!provinces || provinces.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-6 transition-colors">
        <Compass className="w-10 h-10 text-gray-400 dark:text-zinc-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200">No provinces found</h3>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Try a different search query.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {provinces.map((prov) => (
        <ProvinceCard key={prov.id} province={prov} />
      ))}
    </div>
  );
}
