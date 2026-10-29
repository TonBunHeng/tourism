import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const SearchContext = createContext({
  searchTerm: '',
  setSearchTerm: () => { },
  placeholder: 'Search in pages...',
  setPlaceholder: () => { },
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
    if (path.includes('/categories')) return 'Search categories...';
    if (path.includes('/places') || path.includes('/place')) return 'Search places...';
    if (path.includes('/provinces')) return 'Search regions...';
    if (path.includes('/galleries')) return 'Search media...';
    if (path.includes('/events')) return 'Search events...';
    if (path.includes('/users') || path.includes('/user')) return 'Search users...';
    if (path.includes('/reviews') || path.includes('/ratings')) return 'Search reviews...';
    if (path.includes('/favorites')) return 'Search saved destinations...';
    if (path.includes('/businesses') || path.includes('/business')) return 'Search businesses...';
    if (path.includes('/guides') || path.includes('/guide')) return 'Search tour guides...';
    if (path.includes('/reports')) return 'Search reports...';
    if (path.includes('/security')) return 'Search security incidents...';
    if (path.includes('/tracking')) return 'Search user activities...';
    if (path.includes('/notifications')) return 'Search notifications...';
    if (path.includes('/deletion-requests')) return 'Search requests...';
    return 'Search in pages...';
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

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    return {
      searchTerm: '',
      setSearchTerm: () => { },
      placeholder: 'Search in pages...',
      setPlaceholder: () => { },
    };
  }
  return context;
};

export default SearchContext;
