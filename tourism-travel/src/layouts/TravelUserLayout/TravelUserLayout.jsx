import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AuthModal from '../../components/common/AuthModal';
import ChatWidget from '../../components/chat/ChatWidget';
import LogoutAlert from '../../components/layout/LogoutAlert';

export default function TravelUserLayout() {
  const location = useLocation();

  useEffect(() => {
    const getPageTitle = (pathname) => {
      if (pathname === '/') return 'Home';
      if (pathname === '/travel-user' || pathname.startsWith('/travel-user/')) return 'Traveler Space';
      if (pathname.startsWith('/destinations/') || pathname.startsWith('/places/')) return 'Destination Details';
      if (pathname === '/destinations' || pathname === '/places') return 'Destinations';
      if (pathname.startsWith('/tours/')) return 'Tour Package Details';
      if (pathname === '/tours') return 'Tour Packages';
      if (pathname.startsWith('/guides/')) return 'Tour Guide Profile';
      if (pathname === '/guides') return 'Local Tour Guides';
      if (pathname === '/reviews') return 'Traveler Reviews';
      if (pathname === '/about') return 'About AngkorVerses';
      if (pathname === '/contact') return 'Contact & Support';
      if (pathname.startsWith('/businesses/')) return 'Tourism Business Details';
      if (pathname === '/businesses') return 'Tourism Businesses';
      if (pathname.startsWith('/provinces/')) return 'Province Attractions';
      if (pathname === '/provinces') return 'Provinces';
      if (pathname === '/categories') return 'Categories';
      if (pathname.startsWith('/events/')) return 'Event Details';
      if (pathname === '/events') return 'Events & Festivals';
      if (pathname === '/gallery' || pathname === '/galleries') return 'Media Gallery';
      if (pathname === '/wishlist' || pathname === '/favorites') return 'Saved Wishlist';
      if (pathname === '/achievements') return 'Travel Badges & Achievements';
      if (pathname === '/profile') return 'My Tourist Profile';
      if (pathname.startsWith('/trips/')) return 'Trip Itinerary Planner';
      if (pathname === '/trips') return 'My Travel Plans';
      if (pathname === '/bookings') return 'My Bookings & Reservations';
      if (pathname === '/notifications') return 'Notification Center';
      if (pathname === '/deletion-request' || pathname === '/delete') return 'Data Privacy';
      if (pathname === '/settings') return 'Travel Guidelines & Settings';
      if (pathname === '/login') return 'Tourist Sign In';
      if (pathname === '/register') return 'Create Traveler Account';
      return 'Kingdom of Wonder';
    };

    const title = getPageTitle(location.pathname);
    document.title = `${title} | AngkorVerses`;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 font-sans transition-colors">
      {/* Modern, Clean Travel Header */}
      <Header />

      {/* Main Tourist Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Interactive Widgets */}
      <AuthModal />
      <ChatWidget />
      <LogoutAlert />
    </div>
  );
}
