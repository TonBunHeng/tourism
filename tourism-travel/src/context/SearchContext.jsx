import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const SearchContext = createContext({
  searchTerm: '',
  setSearchTerm: () => {},
  placeholder: 'Search across business hub...',
  setPlaceholder: () => {},
});

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customPlaceholder, setCustomPlaceholder] = useState('');
  const location = useLocation();

  // Reset search term when navigating between different routes
  useEffect(() => {
    setSearchTerm('');
    setCustomPlaceholder('');
  }, [location.pathname]);

  // Derive default placeholder from current pathname
  const defaultPlaceholder = useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/listings')) return 'Search services, promotions, events...';
    if (path.includes('/bookings')) return 'Search bookings by ref or guest...';
    if (path.includes('/reviews')) return 'Search customer reviews...';
    if (path.includes('/notifications')) return 'Search notifications...';
    if (path.includes('/reports')) return 'Search reports & analytics...';
    if (path.includes('/profile')) return 'Search business profiles...';
    return 'Search across modules, bookings, services...';
  }, [location.pathname]);

  const placeholder = customPlaceholder || defaultPlaceholder;

  const contextValue = useMemo(() => ({
    searchTerm,
    setSearchTerm,
    placeholder,
    setPlaceholder: setCustomPlaceholder,
  }), [searchTerm, placeholder]);

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
export default SearchContext;

