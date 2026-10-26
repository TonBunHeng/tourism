import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTravel } from '../../context/TravelContext';
import ProvincesHeader from './ProvincesHeader';
import ProvincesGrid from './ProvincesGrid';
import Breadcrumb from '../../components/common/Breadcrumb';
import SimplePagination from '../../components/common/SimplePagination';

export default function Provinces() {
  const { provinces, loadingGlobal } = useTravel();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page')) || 1;

  if (loadingGlobal) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#003E83] dark:text-[#60a5fa] animate-spin" />
        <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Loading Cambodia 25 provinces...</p>
      </div>
    );
  }

  const filtered = provinces.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const paginatedProvinces = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (val) => {
    const params = new URLSearchParams(searchParams);
    if (val) {
      params.set('search', val);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb items={[{ label: 'Provinces' }]} />
      <ProvincesHeader search={search} setSearch={handleSearchChange} />
      <ProvincesGrid provinces={paginatedProvinces} />

      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        startIndex={(currentPage - 1) * ITEMS_PER_PAGE}
        endIndex={Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
        totalRecords={filtered.length}
        label="provinces"
        className="rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs"
      />
    </div>
  );
}
