import { useState, useEffect } from "react";
import {
  Landmark,
  Crown,
  Waves,
  TreePine,
  ShoppingBag,
  Leaf,
  Loader2
} from "lucide-react";
import SimplePagination from "../../components/common/SimplePagination";
import FavoritesHeader from "./FavoritesHeader";
import FavoritesStats from "./FavoritesStats";
import FavoritesToolbar from "./FavoritesToolbar";
import FavoritesList from "./FavoritesList";
import FavoriteModal from "./FavoriteModal";
import FavoriteDetailsModal from "./FavoriteDetailsModal";
import favoriteService from "../../services/favoriteService";
import placeService from "../../services/placeService";
import categoryService from "../../services/categoryService";
import { useAlert } from "../../context/AlertContext";
import { useSearch } from "../../context/SearchContext";
import { useLanguage } from "../../i18n";
import { getPageCache, setPageCache } from "../../utils/pageCache";

export default function Favorites() {
  const { t } = useLanguage();
  const { showConfirm, showSuccess, showError } = useAlert();
  const { searchTerm, setSearchTerm } = useSearch();

  const [favorites, setFavorites] = useState(() => getPageCache('favorites_data')?.favorites || []);
  const [categories, setCategories] = useState(() => getPageCache('favorites_data')?.categories || ["All"]);
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(() => !getPageCache('favorites_data'));

  // Filter & Search States
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("recent");

  // Selection / Bulk action
  const [selectedFavorites, setSelectedFavorites] = useState([]);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Form State for Add New Place
  const [newPlace, setNewPlace] = useState({
    name: "",
    category: "",
    location: "",
    price: "Free",
    bestTime: "Morning",
    duration: "2-3 Hours",
    description: "",
    image: "",
    rating: 5.0,
    tags: []
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const statuses = ["All", "Visited", "To Visit"];

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.success && res.data) {
          const names = ["All", ...res.data.map((c) => c.name)];
          setCategories(names);
        }
      } catch (e) {
        console.error("Failed to fetch categories from API", e);
      }
    };
    fetchCategories();
  }, []);

  // Fetch all places for modal selector
  const loadAvailablePlaces = async () => {
    try {
      const res = await placeService.getPlaces();
      if (res.success && res.data) {
        setAvailablePlaces(res.data);
      }
    } catch (e) {
      console.error("Failed to fetch places for favorite picker", e);
    }
  };

  useEffect(() => {
    loadAvailablePlaces();
  }, []);

  // Load Favorites from API
  const loadFavorites = async () => {
    if (favorites.length === 0) {
      setIsLoading(true);
    }
    try {
      const res = await favoriteService.getFavorites();
      if (res.success && res.data) {
        const iconMap = {
          Temple: Landmark,
          Palace: Crown,
          Beach: Waves,
          Nature: TreePine,
          Market: ShoppingBag,
          Farm: Leaf
        };

        const formatted = res.data.map((fav) => {
          const place = fav.place || {};
          const catName = place.category || place.category_detail?.name || fav.category || "Temple";
          const isVisited = Boolean(fav.visited);
          const user = fav.user || {
            name: fav.user_name || "Traveler",
            email: fav.user_email || "user@angkorverses.com",
            avatar: fav.user_avatar || null,
            role: "User",
            verified: false
          };

          return {
            id: fav.id,
            user_id: fav.user_id || user.id,
            user: user,
            user_name: user.name,
            user_avatar: user.avatar,
            user_email: user.email,
            place_id: fav.place_id || place.id,
            name: place.name || fav.name || "Favorite Destination",
            category: catName,
            icon: iconMap[catName] || Landmark,
            location: place.address || place.province || place.province_detail?.name || fav.location || "Cambodia",
            rating: Number(place.rating || fav.rating || 5.0),
            reviewsCount: Number(place.reviews_count || fav.reviews || place.reviews || 0),
            reviews: Number(place.reviews_count || fav.reviews || place.reviews || 0),
            visitors: Number(place.visitors_count || place.visitors || 0),
            image: place.image_url || place.image || fav.image || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=600",
            visited: isVisited,
            status: isVisited ? "Visited" : "To Visit",
            saved_date: fav.saved_date || (fav.created_at ? new Date(fav.created_at).toISOString().split('T')[0] : "Recently"),
            dateAdded: fav.saved_date || (fav.created_at ? new Date(fav.created_at).toISOString().split('T')[0] : "Recently"),
            created_at: fav.created_at || fav.saved_date,
            bestTime: place.best_time || place.bestTime || fav.best_time || "Morning",
            duration: place.duration || fav.duration || "2-3 Hours",
            price: place.price || fav.price || "Free",
            description: place.description || fav.description || "",
            tags: place.tags || [catName, "Travel", "Cambodia"]
          };
        });

        setFavorites(formatted);
        setPageCache('favorites_data', { favorites: formatted, categories });
      }
    } catch (e) {
      console.error("Failed to load favorites from API", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handlers
  const handleCategoryChange = (val) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedStatus("All");
    setSortBy("recent");
    setCurrentPage(1);
  };

  const handleToggleStatus = async (favId) => {
    try {
      await favoriteService.toggleVisited(favId);
      setFavorites((prev) =>
        prev.map((f) =>
          f.id === favId
            ? {
                ...f,
                visited: !f.visited,
                status: !f.visited ? "Visited" : "To Visit"
              }
            : f
        )
      );
    } catch (e) {
      console.error("Failed to toggle visited status", e);
    }
  };

  const handleDeleteFavorite = async (favId) => {
    const fav = favorites.find(f => f.id === favId || f.place_id === favId);
    const placeName = fav?.name || 'this destination';
    const confirmed = await showConfirm({
      title: t('favorites.deleteConfirmTitle'),
      message: t('favorites.deleteConfirmMsg', { name: placeName }),
      confirmText: t('favorites.deleteConfirmBtn'),
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      await favoriteService.deleteFavorite(favId);
      setFavorites((prev) => prev.filter((f) => f.id !== favId && f.place_id !== favId));
      setSelectedFavorites((prev) => prev.filter((id) => id !== favId));
      showSuccess(t('favorites.deleteSuccess'), t('favorites.deleteSuccessTitle'));
    } catch (e) {
      showError(e.message || t('favorites.deleteFailed'), t('favorites.deleteConfirmTitle'));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFavorites.length === 0) return;
    const confirmed = await showConfirm({
      title: t('favorites.bulkDeleteConfirmTitle'),
      message: t('favorites.bulkDeleteConfirmMsg', { count: selectedFavorites.length }),
      confirmText: t('favorites.deleteConfirmBtn'),
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      await Promise.all(
        selectedFavorites.map((id) => favoriteService.deleteFavorite(id))
      );
      setFavorites((prev) => prev.filter((f) => !selectedFavorites.includes(f.id)));
      setSelectedFavorites([]);
      showSuccess(t('favorites.bulkDeleteSuccess', { count: selectedFavorites.length }), t('favorites.deleteSuccessTitle'));
    } catch (e) {
      showError(e.message || t('favorites.deleteFailed'), t('favorites.bulkDeleteConfirmTitle'));
    }
  };

  const handleBulkMarkVisited = async () => {
    try {
      await Promise.all(
        selectedFavorites.map((id) => favoriteService.toggleVisited(id))
      );
      setFavorites((prev) =>
        prev.map((f) =>
          selectedFavorites.includes(f.id)
            ? { ...f, visited: true, status: "Visited" }
            : f
        )
      );
      setSelectedFavorites([]);
      showSuccess(t('favorites.statusUpdateSuccess', { status: t('favorites.statusVisited') }), t('favorites.statusUpdateTitle'));
    } catch (e) {
      showError(e.message || t('favorites.deleteFailed'), t('favorites.statusUpdateTitle'));
    }
  };

  const handleToggleSelect = (favId) => {
    setSelectedFavorites((prev) =>
      prev.includes(favId)
        ? prev.filter((id) => id !== favId)
        : [...prev, favId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFavorites.length === paginatedFavorites.length) {
      setSelectedFavorites([]);
    } else {
      setSelectedFavorites(paginatedFavorites.map((f) => f.id));
    }
  };

  const handleDeselectAll = () => {
    setSelectedFavorites([]);
  };

  // Add existing place to favorites
  const handleAddExistingPlace = async (placeId) => {
    try {
      const res = await favoriteService.addFavorite({ place_id: placeId });
      if (res.success) {
        setIsAddOpen(false);
        showSuccess(t('favorites.placeAddedSuccess', { name: 'Destination' }), t('favorites.placeAddedTitle'));
        loadFavorites();
      }
    } catch (e) {
      showError(e.message || t('favorites.deleteFailed'), t('favorites.placeAddedTitle'));
    }
  };

  // Add custom new place and favorite it
  const handleCreatePlace = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const placeRes = await placeService.createPlace(newPlace);
      if (placeRes.success && placeRes.data) {
        await favoriteService.addFavorite({ place_id: placeRes.data.id });
        setIsAddOpen(false);
        setNewPlace({
          name: "",
          category: "",
          location: "",
          price: "Free",
          bestTime: "Morning",
          duration: "2-3 Hours",
          description: "",
          image: "",
          rating: 5.0,
          tags: []
        });
        showSuccess(t('favorites.placeAddedSuccess', { name: placeRes.data.name || newPlace.name }), t('favorites.placeAddedTitle'));
        loadFavorites();
      }
    } catch (e) {
      showError(e.message || t('favorites.deleteFailed'), t('favorites.placeAddedTitle'));
    }
  };

  // Client-Side Filters & Sorting
  const filteredFavorites = favorites
    .filter((fav) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        fav.name.toLowerCase().includes(searchLower) ||
        fav.location.toLowerCase().includes(searchLower) ||
        (fav.user_name && fav.user_name.toLowerCase().includes(searchLower)) ||
        (fav.user_email && fav.user_email.toLowerCase().includes(searchLower));

      const matchesCategory =
        selectedCategory === "All" || fav.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Visited" && fav.visited) ||
        (selectedStatus === "To Visit" && !fav.visited);

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "highest") return Number(b.rating) - Number(a.rating);
      if (sortBy === "lowest") return Number(a.rating) - Number(b.rating);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "most_reviews") return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      if (sortBy === "oldest") return a.id - b.id;
      return b.id - a.id; // recent by default
    });

  const totalPages = Math.ceil(filteredFavorites.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredFavorites.length);
  const paginatedFavorites = filteredFavorites.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col">
      {/* 1. Header with Add Button */}
      <FavoritesHeader />

      {/* 2. Key Analytics / Overview Cards */}
      <FavoritesStats favorites={favorites} />

      {/* 3. Main Explorer Card Container */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden flex flex-col flex-1">
        {/* Search, Filter & Bulk Toolbar */}
        <FavoritesToolbar
          totalCount={filteredFavorites.length}
          selectedCount={selectedFavorites.length}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          statuses={statuses}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          onClearFilters={handleClearFilters}
          onBulkDelete={handleBulkDelete}
          onBulkMarkVisited={handleBulkMarkVisited}
          onDeselectAll={handleDeselectAll}
        />

        {/* Content Area */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin mb-3" />
              <p className="text-sm font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                {t('common.loading') || 'Loading...'}
              </p>
            </div>
          ) : (
            <FavoritesList
              favorites={paginatedFavorites}
              selectedFavorites={selectedFavorites}
              setSelectedFavorites={setSelectedFavorites}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              isAllSelected={
                paginatedFavorites.length > 0 &&
                paginatedFavorites.every((f) => selectedFavorites.includes(f.id))
              }
              onToggleVisited={handleToggleStatus}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteFavorite}
              onViewDetails={(fav) => {
                setSelectedFavorite(fav);
                setIsDetailsOpen(true);
              }}
              onView={(fav) => {
                setSelectedFavorite(fav);
                setIsDetailsOpen(true);
              }}
              startIndex={startIndex}
            />
          )}
        </div>

        {/* Simple Pagination Footer */}
        {!isLoading && (
          <SimplePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalRecords={filteredFavorites.length}
            label={t('favorites.paginationLabel')}
          />
        )}
      </div>

      {/* Modals */}
      <FavoriteModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        newPlace={newPlace}
        setNewPlace={setNewPlace}
        onNewPlaceChange={setNewPlace}
        categories={categories}
        onSubmit={handleCreatePlace}
        availablePlaces={availablePlaces}
        onAddExisting={handleAddExistingPlace}
      />

      <FavoriteDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        favorite={selectedFavorite}
        onToggleVisited={handleToggleStatus}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteFavorite}
      />
    </div>
  );
}
