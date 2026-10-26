/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/categoryService';
import { provinceService } from '../services/provinceService';
import { favoriteService } from '../services/favoriteService';
import { settingService } from '../services/settingService';
import { useAuth } from './AuthContext';

const TravelContext = createContext(null);

export const TravelProvider = ({ children }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [settings, setSettings] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  };

  const [loadingGlobal, setLoadingGlobal] = useState(true);

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const [catsRes, provsRes, settingsRes] = await Promise.allSettled([
          categoryService.getCategories(),
          provinceService.getProvinces(),
          settingService.getSettings(),
        ]);

        if (catsRes.status === 'fulfilled' && catsRes.value?.data) {
          setCategories(catsRes.value.data);
        }
        if (provsRes.status === 'fulfilled' && provsRes.value?.data) {
          setProvinces(provsRes.value.data);
        }
        if (settingsRes.status === 'fulfilled' && settingsRes.value?.data) {
          setSettings(settingsRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load global tourism metadata', err);
      } finally {
        setLoadingGlobal(false);
      }
    };

    fetchGlobalData();
  }, []);

  const fetchFavorites = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const res = await favoriteService.getFavorites();
        if (res?.data && Array.isArray(res.data)) {
          setFavorites(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch favorites', err);
      }
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = (placeId) => {
    if (!placeId) return false;
    const targetId = Number(placeId);
    return favorites.some((fav) => Number(fav.place_id) === targetId || Number(fav.place?.id) === targetId);
  };

  const toggleFavorite = async (place) => {
    if (!isAuthenticated) {
      if (openAuthModal) openAuthModal('login');
      showToast('Please log in to save favorites to your wishlist', 'info');
      return;
    }

    const rawId = place.id || place.place_id;
    if (!rawId) return;
    const targetId = Number(rawId);

    const existing = favorites.find((f) => Number(f.place_id) === targetId || Number(f.place?.id) === targetId);

    if (existing) {
      try {
        await favoriteService.removeFavorite(targetId);
        setFavorites((prev) => prev.filter((f) => Number(f.place_id) !== targetId && Number(f.place?.id) !== targetId));
        showToast(`Removed "${place.name || 'destination'}" from wishlist`, 'info');
      } catch {
        showToast('Failed to remove favorite', 'error');
      }
    } else {
      try {
        const res = await favoriteService.addFavorite({ place_id: targetId, visited: false });
        if (res?.data) {
          setFavorites((prev) => [res.data, ...prev.filter((f) => Number(f.place_id) !== targetId)]);
          showToast(`Added "${place.name || 'destination'}" to wishlist!`, 'success');
        }
      } catch {
        showToast('Failed to add favorite', 'error');
      }
    }
  };

  return (
    <TravelContext.Provider
      value={{
        favorites,
        wishlistCount: favorites.length,
        isFavorite,
        toggleFavorite,
        fetchFavorites,
        categories,
        provinces,
        settings,
        loadingGlobal,
        chatOpen,
        setChatOpen,
        toggleChat: () => setChatOpen((prev) => !prev),
        toast,
        showToast,
      }}
    >
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white text-xs px-4 py-3 rounded-lg shadow-lg border border-gray-800 animate-in">
          <span className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'error' ? 'bg-rose-400' : 'bg-blue-400'}`}></span>
          <p className="font-medium">{toast.message}</p>
        </div>
      )}
    </TravelContext.Provider>
  );
};

export const useTravel = () => {
  const context = useContext(TravelContext);
  if (!context) {
    throw new Error('useTravel must be used within a TravelProvider');
  }
  return context;
};
