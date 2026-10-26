import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Eye,
  Edit,
  Trash2,
  MapPin,
  Star,
  Clock,
  Landmark,
  ExternalLink
} from 'lucide-react';
import SimplePagination from '../../components/common/SimplePagination';
import PlacesHeader from './PlacesHeader';
import PlacesStats from './PlacesStats';
import PlacesToolbar from './PlacesToolbar';
import PlacesList from './PlacesList';
import PlaceModal from './PlaceModal';
import PlaceDetailsModal from './PlaceDetailsModal';
import placeService from '../../services/placeService';
import categoryService from '../../services/categoryService';
import deletionRequestService from '../../services/deletionRequestService';
import authService, { isSuperAdminRole } from '../../services/authService';
import { useAlert } from '../../context/AlertContext';
import { useSearch } from '../../context/SearchContext';
import { getPageCache, setPageCache } from '../../utils/pageCache';

export default function Places() {
  const location = useLocation();
  const { showConfirm, showSuccess, showError } = useAlert();
  const { searchTerm, setSearchTerm } = useSearch();
  const currentUser = authService.getCurrentUser();
  const isSuperAdmin = isSuperAdminRole(currentUser?.role);
  const cachedData = getPageCache('places_data');
  const [places, setPlaces] = useState(() => cachedData?.places || []);
  const [categoriesList, setCategoriesList] = useState(['All', 'Temple', 'Palace', 'Beach', 'Nature', 'Market', 'Farm']);
  const [isLoading, setIsLoading] = useState(() => !cachedData);

  const [selectedCategory, setSelectedCategory] = useState('All');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(() => cachedData?.totalRecords || 0);
  const [totalPages, setTotalPages] = useState(() => cachedData?.totalPages || 1);
  const itemsPerPage = 10;

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [viewingPlace, setViewingPlace] = useState(null);

  // Add / Edit Form State
  const [formData, setFormData] = useState({
    name: '',
    category_id: 1,
    category: 'Temple',
    address: '',
    description: '',
    best_time: '',
    duration: '',
    price: '',
    rating: 5.0,
    status: 'Active',
    image_url: ''
  });

  const handleFormChange = (fieldOrData, value) => {
    if (typeof fieldOrData === 'object' && fieldOrData !== null) {
      setFormData(fieldOrData);
    } else {
      setFormData(prev => ({ ...prev, [fieldOrData]: value }));
    }
  };

  const loadCategories = async () => {
    try {
      const res = await categoryService.getCategories({ all: true });
      if (res.success && res.data && res.data.length > 0) {
        const catNames = res.data.map(c => c.name);
        setCategoriesList(['All', ...catNames]);
      }
    } catch (e) {
      console.warn('Could not load categories list for filter:', e);
    }
  };

  const loadPlaces = async () => {
    if (!getPageCache('places_data')) setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const res = await placeService.getPlaces(params);
      if (res.success && res.data) {
        const formatted = res.data.map(p => ({
          id: p.id,
          name: p.name,
          category_id: p.category_id,
          category: p.category || p.category_detail?.name || 'Attraction',
          category_detail: p.category_detail,
          province_id: p.province_id,
          province: p.province || p.province_detail?.name || 'Siem Reap',
          province_detail: p.province_detail,
          address: p.address || 'Cambodia',
          coordinates: p.coordinates || '13.4125° N, 103.8670° E',
          latitude: p.latitude || 13.4125,
          longitude: p.longitude || 103.8670,
          description: p.description || '',
          best_time: p.best_time || 'Morning',
          duration: p.duration || '2-3 Hours',
          price: p.price || 'Free',
          rating: Number(p.rating || 5.0),
          reviews: Number(p.reviews_count || 0),
          visits: Number(p.visitors_count || 0),
          image_url: p.image_url || p.image || '',
          image: p.image_url || p.image || '',
          images: p.image_url ? [p.image_url] : [],
          is_featured: Boolean(p.is_featured),
          status: p.status || 'Active',
          created_at: p.created_at,
          updated_at: p.updated_at
        }));
        setPlaces(formatted);
        const total = res.meta?.total || formatted.length;
        const pages = res.meta?.last_page || Math.ceil(total / itemsPerPage) || 1;
        setTotalRecords(total);
        setTotalPages(pages);
        setPageCache('places_data', { places: formatted, totalRecords: total, totalPages: pages });
      }
    } catch (e) {
      console.error('Failed to load places from API:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    loadPlaces();
  }, [currentPage, searchTerm, selectedCategory]);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  const handleView = async (idOrPlace) => {
    const id = typeof idOrPlace === 'object' && idOrPlace !== null ? idOrPlace.id : idOrPlace;
    const localPlace = places.find(p => p.id === id) || (typeof idOrPlace === 'object' ? idOrPlace : null);
    if (localPlace) {
      setViewingPlace(localPlace);
    }
    try {
      const res = await placeService.getPlaceById(id);
      if (res.success && res.data) {
        const p = res.data;
        setViewingPlace({
          ...p,
          reviews: p.reviews_count !== undefined ? Number(p.reviews_count) : 0,
          visits: p.visitors_count !== undefined ? Number(p.visitors_count) : 0,
          category: p.category || p.category_detail?.name || 'Attraction',
          image: p.image_url || p.image || '',
          images: p.image_url ? [p.image_url] : [],
        });
      }
    } catch (e) {
      console.warn('Single place fetch fallback:', e);
    }
  };

  const handleDelete = async (id) => {
    const place = places.find(p => p.id === id);
    const placeName = place?.name || `Place #${id}`;

    if (isSuperAdmin) {
      const confirmed = await showConfirm({
        title: 'Delete Destination',
        message: `Are you sure you want to permanently delete "${placeName}"?\n\nThis action cannot be undone.`,
        confirmText: 'Delete Permanently',
        type: 'danger'
      });

      if (!confirmed) return;

      try {
        await placeService.deletePlace(id);
        showSuccess(`Destination "${placeName}" has been permanently deleted.`, 'Destination Deleted');
        loadPlaces();
      } catch (e) {
        showError(e.message || 'Failed to delete destination.', 'Delete Failed');
      }
      return;
    }

    const confirmed = await showConfirm({
      title: 'Submit Deletion Request',
      message: `Are you sure you want to submit a deletion request for "${placeName}"?\n\nThis will be submitted to the Super Administrator for review and approval.`,
      confirmText: 'Submit Deletion',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await deletionRequestService.createRequest({
        request_type: 'item',
        reason: `Request to delete destination: ${placeName}`,
        urgency: 'medium',
        items: [{
          item_type: 'place',
          item_id: id,
          item_name: placeName,
          category: place?.category || 'Place',
        }]
      });
      showSuccess(`Deletion request for "${placeName}" has been submitted to Super Admin for approval.`, 'Request Submitted');
    } catch (e) {
      showError(e.message || 'Failed to submit deletion request.', 'Submission Failed');
    }
  };

  const formCategories = categoriesList.filter(c => c !== 'All');

  const openAddModal = () => {
    setEditingPlace(null);
    setFormData({
      name: '',
      category_id: 1,
      category: formCategories[0] || 'Temple',
      address: '',
      description: '',
      best_time: 'Morning',
      duration: '2-3 Hours',
      price: '$10 - $25',
      rating: 5.0,
      status: 'Active',
      image_url: ''
    });
    setIsAddModalOpen(true);
  };

  useEffect(() => {
    if (location.state?.openAdd) {
      openAddModal();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const openEditModal = (place) => {
    setEditingPlace(place);
    setFormData({
      name: place.name,
      category_id: place.category_id || 1,
      category: place.category || formCategories[0] || 'Temple',
      address: place.address || '',
      description: place.description || '',
      best_time: place.best_time || 'Morning',
      duration: place.duration || '2-3 Hours',
      price: place.price || '',
      rating: place.rating || 5.0,
      status: place.status || 'Active',
      image_url: place.image_url || place.image || ''
    });
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingPlace(null);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) return;

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        address: formData.address,
        description: formData.description || '',
        best_time: formData.best_time || '',
        duration: formData.duration || '',
        price: formData.price || '',
        rating: formData.rating || 5.0,
        status: formData.status || 'Active',
        image_url: formData.image_url || ''
      };

      if (editingPlace) {
        await placeService.updatePlace(editingPlace.id, payload);
        showSuccess(`Place "${formData.name}" has been updated successfully.`, 'Place Updated');
      } else {
        await placeService.createPlace(payload);
        showSuccess(`Place "${formData.name}" has been created successfully.`, 'Place Created');
      }
      closeModal();
      loadPlaces();
    } catch (e) {
      showError(e.message || 'Failed to save place.', 'Save Failed');
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + places.length, totalRecords);

  return (
    <div className="flex flex-col">
      {/* 1. Header with Add Place Button */}
      <PlacesHeader
        onOpenAddModal={openAddModal}
        onAddPlace={openAddModal}
        onAddClick={openAddModal}
      />

      {/* 2. Key Metrics & Analytics Row */}
      <PlacesStats places={places} />

      {/* 3. Main Places Explorer Container */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden flex-1">
        {/* Search & Filter Toolbar */}
        <PlacesToolbar
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          categories={categoriesList}
          totalCount={totalRecords}
        />

        {/* Places List View */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 dark:text-zinc-400 font-medium">
            Loading places from database...
          </div>
        ) : (
          <PlacesList
            places={places}
            onViewPlace={handleView}
            onEditPlace={openEditModal}
            onDeletePlace={handleDelete}
            startIndex={startIndex}
          />
        )}

        {/* Simple Pagination Footer */}
        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalRecords={totalRecords}
          label="places"
        />
      </div>

      {/* Place Details Modal */}
      <PlaceDetailsModal
        place={viewingPlace}
        onClose={() => setViewingPlace(null)}
        onEditPlace={openEditModal}
      />

      {/* Add / Edit Place Modal */}
      <PlaceModal
        isOpen={isAddModalOpen}
        editingPlace={editingPlace}
        formData={formData}
        onFormDataChange={handleFormChange}
        onFormChange={handleFormChange}
        onClose={closeModal}
        onSubmit={handleSubmit}
        categories={formCategories}
        formCategories={formCategories}
      />
    </div>
  );
}
