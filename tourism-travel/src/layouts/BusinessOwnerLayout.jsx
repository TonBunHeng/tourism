import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BusinessSidebar from '../components/layout/BusinessSidebar';
import BusinessHeader from '../components/layout/BusinessHeader';
import BusinessFooter from '../components/layout/BusinessFooter';
import { SearchProvider } from '../context/SearchContext';
import businessOwnerService from '../services/businessOwnerService';

export default function BusinessOwnerLayout() {
  const location = useLocation();
  const mainRef = useRef(null);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem('business_sidebar_expanded');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('business_sidebar_expanded', JSON.stringify(isExpanded));
    } catch {
      // Ignore storage errors
    }
  }, [isExpanded]);

  const refreshBusinesses = useCallback(async (preferredBusinessId = null) => {
    try {
      const res = await businessOwnerService.getBusinesses();
      if (!res?.success) return;

      const rawBusinesses = res.data?.businesses || res.data || [];
      const list = Array.isArray(rawBusinesses) ? rawBusinesses : [];
      setBusinesses(list);
      setSelectedBusiness((current) =>
        list.find((b) => b.id === preferredBusinessId) ||
        list.find((b) => b.id === current?.id) ||
        list[0] ||
        null
      );
    } catch {
      // Keep current state on error
    }
  }, []);

  useEffect(() => {
    refreshBusinesses();
  }, [refreshBusinesses]);

  const handleSelectBusiness = (biz) => {
    setSelectedBusiness(biz);
  };

  // Scroll to top on page navigation
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [location.pathname, location.search]);

  // Dynamic Browser Tab Title
  useEffect(() => {
    const pageTitles = {
      '/business': 'Dashboard',
      '/business/dashboard': 'Dashboard',
      '/business/profile': 'Business Profile',
      '/business/listings': 'Listings & Services',
      '/business/bookings': 'Bookings',
      '/business/availability': 'Operating Hours',
      '/business/reviews': 'Customer Reviews',
      '/business/reports': 'Sales & Reports',
      '/business/notifications': 'Notifications',
      '/business/settings': 'Settings',
    };

    const title = pageTitles[location.pathname] || 'Business Hub';
    document.title = `${title} | AngkorVerses Business Hub`;
  }, [location.pathname]);

  return (
    <SearchProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-[#09090b] text-gray-800 dark:text-zinc-100 font-sans transition-colors duration-200 overflow-hidden">
        <BusinessSidebar
          isOpen={isMobileSidebarOpen}
          setIsOpen={setIsMobileSidebarOpen}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          selectedBusiness={selectedBusiness}
          businesses={businesses}
          onSelectBusiness={handleSelectBusiness}
        />

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <BusinessHeader
            toggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            isSidebarOpen={isMobileSidebarOpen}
            isExpanded={isExpanded}
            toggleExpand={() => setIsExpanded((prev) => !prev)}
            selectedBusiness={selectedBusiness}
            businesses={businesses}
            onSelectBusiness={handleSelectBusiness}
          />

          <main ref={mainRef} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Outlet
              context={{
                selectedBusiness,
                businesses,
                refreshBusinesses,
                setSelectedBusiness,
              }}
            />
          </main>

          <BusinessFooter />
        </div>
      </div>
    </SearchProvider>
  );
}
