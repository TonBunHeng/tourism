import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from '../context/AuthContext';
import { AlertProvider } from '../context/AlertContext';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Layouts
import TouristLayout from '../layouts/TouristLayout';
import BusinessOwnerLayout from '../layouts/BusinessOwnerLayout';

// Auth & Error Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Forbidden from '../pages/error/Forbidden';
import NotFound from '../pages/error/NotFound';

// Tourist Pages
import TouristHome from '../pages/tourist/TouristHome';
import Destinations from '../pages/tourist/Destinations';
import DestinationDetails from '../pages/tourist/DestinationDetails';
import Businesses from '../pages/tourist/Businesses';
import BusinessDetails from '../pages/tourist/BusinessDetails';
import TourPackages from '../pages/tourist/TourPackages';
import TourGuides from '../pages/tourist/TourGuides';
import Categories from '../pages/tourist/Categories';
import Provinces from '../pages/tourist/Provinces';
import Galleries from '../pages/tourist/Galleries';
import Events from '../pages/tourist/Events';
import AIChat from '../pages/tourist/AIChat';
import Bookings from '../pages/tourist/Bookings';
import Favorites from '../pages/tourist/Favorites';
import Notifications from '../pages/tourist/Notifications';
import Profile from '../pages/tourist/Profile';
import Support from '../pages/tourist/Support';
import Trips from '../pages/tourist/Trips';
import Achievements from '../pages/tourist/Achievements';

// Business Owner Pages
import BusinessDashboard from '../pages/business-owner/Dashboard';
import BusinessProfile from '../pages/business-owner/BusinessProfile';
import Listings from '../pages/business-owner/Listings';
import BusinessBookings from '../pages/business-owner/Bookings';
import Availability from '../pages/business-owner/Availability';
import BusinessReviews from '../pages/business-owner/Reviews';
import BusinessReports from '../pages/business-owner/Reports';
import BusinessNotifications from '../pages/business-owner/Notifications';
import BusinessSettings from '../pages/business-owner/Settings';
import OAuthCallbackHandler from '../components/common/OAuthCallbackHandler';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AlertProvider>
          <OAuthCallbackHandler />
          <Routes>
            {/* Keep OAuth callback query parameters mounted until the callback
                handler stores the session and redirects the visitor. */}
            <Route path="/auth/google/callback" element={<OAuthCallbackPending />} />
            <Route path="/auth/callback" element={<OAuthCallbackPending />} />

            {/* Guest / Public Routes (redirect if already logged in) */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Error Pages */}
            <Route path="/forbidden" element={<Forbidden />} />

            {/* Standalone Full-Screen AI Chat (No Header, No Footer) */}
            <Route path="/ai-chat" element={<AIChat />} />

            {/* 1. Tourist Portal (Public & Authenticated Routes under TouristLayout) */}
            <Route element={<TouristLayout />}>
              <Route path="/" element={<TouristHome />} />
              
              {/* Destinations Section */}
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/places" element={<Navigate to="/destinations" replace />} />
              <Route path="/destinations/:id" element={<DestinationDetails />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/provinces" element={<Provinces />} />
              <Route path="/galleries" element={<Galleries />} />
              <Route path="/events" element={<Events />} />

              {/* Tours & Bookings Section */}
              <Route path="/businesses" element={<Businesses />} />
              <Route path="/businesses/:id" element={<BusinessDetails />} />
              <Route path="/tours" element={<TourPackages />} />
              <Route path="/tour-packages" element={<Navigate to="/tours" replace />} />
              <Route path="/guides" element={<TourGuides />} />
              <Route path="/tour-guides" element={<Navigate to="/guides" replace />} />

              {/* Achievements & Gamification */}
              <Route path="/achievements" element={<Achievements />} />

              {/* General Tourist Pages */}
              <Route path="/support" element={<Support />} />

              {/* Protected Tourist Actions */}
              <Route element={<ProtectedRoute allowedRoles={['user', 'business_owner', 'admin', 'super_admin']} />}>
                <Route path="/trips" element={<Trips />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* 2. Business Owner Portal (Strictly Protected for Business Owners and Admins) */}
            <Route element={<ProtectedRoute allowedRoles={['business_owner', 'admin', 'super_admin']} />}>
              <Route element={<BusinessOwnerLayout />}>
                <Route path="/business" element={<Navigate to="/business/dashboard" replace />} />
                <Route path="/business/dashboard" element={<BusinessDashboard />} />
                <Route path="/business/profile" element={<BusinessProfile />} />
                <Route path="/business/listings" element={<Listings />} />
                <Route path="/business/bookings" element={<BusinessBookings />} />
                <Route path="/business/availability" element={<Availability />} />
                <Route path="/business/reviews" element={<BusinessReviews />} />
                <Route path="/business/reports" element={<BusinessReports />} />
                <Route path="/business/notifications" element={<BusinessNotifications />} />
                <Route path="/business/settings" element={<BusinessSettings />} />
              </Route>
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AlertProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function OAuthCallbackPending() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 text-sm text-slate-600 dark:text-zinc-300">
      Completing sign in…
    </main>
  );
}
