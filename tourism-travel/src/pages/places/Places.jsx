import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { placeService } from '../../services/placeService';
import { useTravel } from '../../context/TravelContext';
import PlacesHeader from './PlacesHeader';
import PlacesToolbar from './PlacesToolbar';
import PlacesGrid from './PlacesGrid';
import Breadcrumb from '../../components/common/Breadcrumb';
import SimplePagination from '../../components/common/SimplePagination';
import TourPackageCard from '../../components/common/TourPackageCard';
import BookingModal from '../../components/common/BookingModal';
import { TOURS_DATA } from '../../data/toursData';

export default function Places() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { provinces } = useTravel();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [provinceId, setProvinceId] = useState(searchParams.get('province_id') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category_id') || '');
  const [minRating, setMinRating] = useState(searchParams.get('min_rating') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'popular');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [places, setPlaces] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTourForBooking, setSelectedTourForBooking] = useState(null);

  const currentProvince = provinces?.find((p) => String(p.id) === String(provinceId));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch(searchParams.get('search') || '');
    setProvinceId(searchParams.get('province_id') || '');
    setCategoryId(searchParams.get('category_id') || '');
    setMinRating(searchParams.get('min_rating') || '');
    setSortBy(searchParams.get('sort_by') || 'popular');
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const params = { per_page: 8, page, sort_by: sortBy };
        if (search.trim()) params.search = search.trim();
        if (provinceId) params.province_id = provinceId;
        if (categoryId) params.category_id = categoryId;
        if (minRating) params.min_rating = minRating;

        const res = await placeService.getPlaces(params);
        if (res?.data) {
          setPlaces(res.data);
          setPagination(res.meta || null);
        }
      } catch (err) {
        console.error('Failed to load places', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [search, provinceId, categoryId, minRating, sortBy, page]);

  const handleApply = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (provinceId) params.set('province_id', provinceId);
    if (categoryId) params.set('category_id', categoryId);
    if (minRating) params.set('min_rating', minRating);
    if (sortBy) params.set('sort_by', sortBy);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleClear = () => {
    setSearch('');
    setProvinceId('');
    setCategoryId('');
    setMinRating('');
    setSortBy('popular');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb items={[{ label: 'Destinations' }]} />
      <PlacesHeader 
        totalCount={pagination?.total ?? places.length} 
        provinceName={currentProvince?.name}
      />

      <PlacesToolbar
        search={search}
        setSearch={setSearch}
        provinceId={provinceId}
        setProvinceId={setProvinceId}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        minRating={minRating}
        setMinRating={setMinRating}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onApply={handleApply}
        onClear={handleClear}
        hasFilters={Boolean(search || provinceId || categoryId || minRating)}
      />

      <PlacesGrid places={places} loading={loading} onClearFilters={handleClear} />

      <SimplePagination
        currentPage={pagination?.current_page || page}
        totalPages={pagination?.last_page || 1}
        onPageChange={(newPage) => {
          setPage(newPage);
          const p = new URLSearchParams(searchParams);
          p.set('page', String(newPage));
          setSearchParams(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        startIndex={pagination?.from ? pagination.from - 1 : (page - 1) * (pagination?.per_page || 8)}
        endIndex={pagination?.to || Math.min((page - 1) * (pagination?.per_page || 8) + places.length, pagination?.total || places.length)}
        totalRecords={pagination?.total || places.length}
        label="destinations"
        className="rounded-lg border border-gray-200 dark:border-zinc-800 shadow-xs"
      />

      {/* Recommended Tours & Packages Banner */}
      <section className="pt-8 border-t border-gray-200/80 dark:border-zinc-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-xs font-bold text-[#003E83] dark:text-blue-400 mb-2">
              <Sparkles size={13} className="text-amber-500" />
              <span>Full-Service Guided Journeys</span>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Recommended Tours & Packages
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Want a hassle-free vacation? Browse multi-day guided packages with transport and tickets included.
            </p>
          </div>
          <Link
            to="/tours"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#003E83] dark:text-blue-400 hover:underline group shrink-0"
          >
            <span>View All Tour Packages</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOURS_DATA.slice(0, 3).map((tour) => (
            <TourPackageCard
              key={tour.id}
              tour={tour}
              onBook={(selected) => {
                setSelectedTourForBooking(selected);
                setBookingModalOpen(true);
              }}
            />
          ))}
        </div>
      </section>

      {bookingModalOpen && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedTourForBooking(null);
          }}
          targetItem={selectedTourForBooking}
          type="tour"
        />
      )}
    </div>
  );
}
