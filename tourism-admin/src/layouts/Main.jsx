import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { SIDEBAR_COMPACT_CHANGE_EVENT } from "../utils/Theme";
import { useLanguage } from "../i18n";

export default function Main() {
  const { currentLang, t } = useLanguage();
  const location = useLocation();
  const mainRef = useRef(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar_expanded');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      const isCompact = localStorage.getItem('compact_sidebar') === 'true';
      return !isCompact;
    }
    return true;
  });

  useEffect(() => {
    const handleCompactChange = (e) => {
      if (e?.detail && typeof e.detail.compact === 'boolean') {
        setIsExpanded(!e.detail.compact);
      }
    };

    window.addEventListener(SIDEBAR_COMPACT_CHANGE_EVENT, handleCompactChange);
    return () => window.removeEventListener(SIDEBAR_COMPACT_CHANGE_EVENT, handleCompactChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar_expanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

  // Dynamic Page Title
  useEffect(() => {
    const pageTitles = {
      "/": "Login",
      "/dashboard": t("sidebar.dashboard", "Dashboard"),
      "/place": t("sidebar.places", "Places"),
      "/places": t("sidebar.places", "Places"),
      "/businesses": t("sidebar.businesses", "Businesses"),
      "/bookings": t("sidebar.bookings", "Bookings"),
      "/tours": t("sidebar.tourPackages", "Tour Packages"),
      "/guides": t("sidebar.tourGuides", "Tour Guides"),
      "/categories": t("sidebar.categories", "Categories"),
      "/provinces": t("sidebar.provinces", "Provinces"),
      "/galleries": t("sidebar.galleries", "Galleries"),
      "/events": t("sidebar.events", "Events"),
      "/reports": t("sidebar.reports", "Reports"),
      "/reports/analytics": t("reports.analyticsTitle", "Reports Analytics"),
      "/users": t("sidebar.users", "Users"),
      "/reviews": t("sidebar.ratingsReviews", "Ratings & Reviews"),
      "/ratings": t("sidebar.ratingsReviews", "Ratings & Reviews"),
      "/ratings/analytics": t("ratings.analyticsTitle", "Ratings & Reviews Analytics"),
      "/favorites": t("favorites.title", "Favorites"),
      "/favorites/analytics": t("favorites.analyticsTitle", "Favorites Analytics"),
      "/deletion-requests": t("deletion.title", "Deletion Requests"),
      "/security": t("security.title", "Security Alerts"),
      "/tracking-users": t("sidebar.userTracking", "Users Tracking"),
      "/settings": t("settings.title", "Settings"),
      "/profile": t("profile.title", "Profile"),
      "/notifications": t("notifications.title", "Notifications"),
      "/login": "Login",
      "/logout": t("sidebar.logout", "Logout"),
    };

    document.title = `${pageTitles[location.pathname] || "AngkorVerses"} | AngkorVerses`;
  }, [location.pathname, currentLang, t]);

  // Scroll to top when page changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [location.pathname, location.search]);

  // Pre-warm API cache in the background so navigating to any page renders immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      import('../utils/prewarm').then(m => m.prewarmAdminCaches());
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#09090b] transition-colors duration-200">
      <Sidebar
        isOpen={isMobileSidebarOpen}
        setIsOpen={setIsMobileSidebarOpen}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <Header
          toggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isSidebarOpen={isMobileSidebarOpen}
          isExpanded={isExpanded}
          toggleExpand={() => setIsExpanded(prev => !prev)}
        />

        <main ref={mainRef} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
