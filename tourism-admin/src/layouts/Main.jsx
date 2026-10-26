import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { SIDEBAR_COMPACT_CHANGE_EVENT } from "../utils/Theme";

export default function Main() {
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
      "/dashboard": "Dashboard",
      "/place": "Places",
      "/places": "Places",
      "/businesses": "Businesses",
      "/categories": "Categories",
      "/provinces": "Provinces",
      "/galleries": "Galleries",
      "/events": "Events",
      "/reports": "Reports",
      "/reports/analytics": "Reports Analytics",
      "/users": "Users",
      "/reviews": "Reviews",
      "/ratings": "Ratings",
      "/ratings/analytics": "Ratings Analytics",
      "/favorites": "Favorites",
      "/favorites/analytics": "Favorites Analytics",
      "/deletion-requests": "Deletion Requests",
      "/security": "Security & Audit Center",
      "/tracking-users": "Users Tracking",
      "/settings": "Settings",
      "/profile": "Profile",
      "/notifications": "Notifications Center",
      "/login": "Login",
      "/logout": "Logout",
    };

    document.title = `${pageTitles[location.pathname] || "AngkorVerses"} | AngkorVerses`;
  }, [location.pathname]);

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
