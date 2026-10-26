import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import TripSidebar from '../../components/layout/TripSidebar';
import AuthModal from '../../components/common/AuthModal';
import ChatWidget from '../../components/chat/ChatWidget';
import LogoutAlert from '../../components/layout/LogoutAlert';
import AppDownloadModal from '../../components/common/AppDownloadModal';
import SupportModal from '../../components/common/SupportModal';

export default function TravelUserLayout() {
  const location = useLocation();

  // Sidebar Layout States
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global Dialog Modals
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  useEffect(() => {
    const getPageTitle = (pathname) => {
      if (pathname === '/') return 'Trip.com Cambodia | Travel Deals & Hotel Reservations';
      if (pathname === '/travel-user' || pathname.startsWith('/travel-user/')) return 'Traveler Space | Trip.com';
      if (pathname.startsWith('/destinations/') || pathname.startsWith('/places/')) return 'Hotels & Destinations | Trip.com';
      if (pathname === '/destinations' || pathname === '/places') return 'Hotels, Stays & Attractions | Trip.com';
      if (pathname.startsWith('/tours/')) return 'Tour Package Details | Trip.com';
      if (pathname === '/tours') return 'Attractions & Tours | Trip.com';
      if (pathname.startsWith('/guides/')) return 'Certified Tour Guides | Trip.com';
      if (pathname === '/guides') return 'Local Tour Guides | Trip.com';
      if (pathname === '/reviews') return 'Verified Guest Reviews | Trip.com';
      if (pathname === '/about') return 'About Trip.com Cambodia';
      if (pathname === '/contact') return 'Customer Support & Hotlines | Trip.com';
      if (pathname.startsWith('/businesses/')) return 'Tourism Business Details | Trip.com';
      if (pathname === '/businesses') return 'Car Rentals & Businesses | Trip.com';
      if (pathname.startsWith('/provinces/')) return 'Province Attractions | Trip.com';
      if (pathname === '/provinces') return '25 Cambodian Provinces | Trip.com';
      if (pathname === '/categories') return 'Travel Categories | Trip.com';
      if (pathname.startsWith('/events/')) return 'Festivals & Events | Trip.com';
      if (pathname === '/events') return 'Events & Super Deals | Trip.com';
      if (pathname === '/gallery' || pathname === '/galleries') return 'Travel Moments Gallery | Trip.com';
      if (pathname === '/wishlist' || pathname === '/favorites') return 'Saved Wishlist | Trip.com';
      if (pathname === '/achievements') return 'Trip Rewards & Badges | Trip.com';
      if (pathname === '/profile') return 'My Profile | Trip.com';
      if (pathname.startsWith('/trips/')) return 'Trip.Planner Itinerary | Trip.com';
      if (pathname === '/trips') return 'My Travel Plans & Trains | Trip.com';
      if (pathname === '/bookings') return 'Find & Manage Bookings | Trip.com';
      if (pathname === '/notifications') return 'Notification Alerts | Trip.com';
      if (pathname === '/deletion-request' || pathname === '/delete') return 'Data Privacy | Trip.com';
      if (pathname === '/settings') return 'Account Settings | Trip.com';
      if (pathname === '/login') return 'Sign In | Trip.com';
      if (pathname === '/register') return 'Create Account | Trip.com';
      return 'Trip.com Cambodia';
    };

    const title = getPageTitle(location.pathname);
    document.title = title;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa] dark:bg-zinc-950 text-[#0f294d] dark:text-zinc-100 font-sans transition-colors">
      {/* 1. Trip.com Header */}
      <Header
        onToggleSidebar={toggleSidebar}
        isSidebarExpanded={isSidebarExpanded}
        onToggleMobileSidebar={toggleMobileSidebar}
        onOpenAppModal={() => setAppModalOpen(true)}
        onOpenSupportModal={() => setSupportModalOpen(true)}
      />

      {/* 2. Main Area with Left Vertical Channel Sidebar */}
      <div className="flex-1 flex flex-col">
        {/* Left Sticky Sidebar */}
        <TripSidebar
          isExpanded={isSidebarExpanded}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenAppModal={() => setAppModalOpen(true)}
        />

        {/* Content Area offset by Sidebar width on desktop */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
            isSidebarExpanded ? 'lg:pl-56' : 'lg:pl-[72px]'
          }`}
        >
          <main className="flex-1 w-full">
            <Outlet />
          </main>

          {/* Trip.com Mega Footer */}
          <Footer />
        </div>
      </div>

      {/* Global Modals & Widgets */}
      <AuthModal />
      <AppDownloadModal isOpen={appModalOpen} onClose={() => setAppModalOpen(false)} />
      <SupportModal isOpen={supportModalOpen} onClose={() => setSupportModalOpen(false)} />
      <ChatWidget />
      <LogoutAlert />
    </div>
  );
}
