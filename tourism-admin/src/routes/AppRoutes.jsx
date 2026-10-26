import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Layout
import Main from '../layouts/Main';

// Auth & Error Pages
import Login from '../pages/auth/Login';
import Forbidden from '../pages/error/Forbidden';

// Content Pages
import Dashboard from '../pages/dashboard/Dashboard';
import Places from '../pages/places/Places';
import Categories from '../pages/categories/Categories';
import Provinces from '../pages/provinces/Provinces';
import Gallery from '../pages/galleries/Gallery';
import Events from '../pages/events/Events';
import Users from '../pages/users/Users';
import Ratings from '../pages/ratings/Ratings';
import RatingsAnalytics from '../pages/ratings/RatingsAnalytics';
import Favorites from '../pages/favorites/Favorites';
import FavoritesAnalytics from '../pages/favorites/FavoritesAnalytics';
import DeletionRequests from '../pages/delete/DeletionRequests';
import Settings from '../pages/settings/Settings';
import Profile from '../pages/profiles/Profile';
import Reports from '../pages/reports/Reports';
import ReportsAnalytics from '../pages/reports/ReportsAnalytics';
import Notifications from '../pages/notifications/Notifications';
import Security from '../pages/security/Security';
import Businesses from '../pages/businesses/Businesses';
import Bookings from '../pages/bookings/Bookings';
import Tours from '../pages/tours/Tours';
import Guides from '../pages/guides/Guides';
import UsersTracking from '../pages/tracking/UsersTracking';

import { SearchProvider } from '../context/SearchContext';

// Role Groups
const ALL_ADMIN_ROLES = ['super_admin', 'admin', 'guide_editor', 'Super Admin', 'Admin', 'Guide / Editor', 'Tourism Content Editor'];
const PRIVILEGED_ADMIN_ROLES = ['super_admin', 'admin', 'Super Admin', 'Admin'];
const SUPER_ADMIN_ONLY_ROLES = ['super_admin', 'Super Admin'];

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <SearchProvider>
        <Routes>

        {/* Public / Guest Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Root and Auth Redirections */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/logout" element={<Navigate to="/login" replace />} />
        <Route path="/forbidden" element={<Forbidden />} />

        {/* Protected Routes - General Admin Portal Access */}
        <Route element={<ProtectedRoute allowedRoles={ALL_ADMIN_ROLES} />}>
          <Route element={<Main />}>
            {/* General Administrative Pages */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/tours" element={<Tours />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/place" element={<Places />} />
            <Route path="/places" element={<Places />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/provinces" element={<Provinces />} />
            <Route path="/galleries" element={<Gallery />} />
            <Route path="/events" element={<Events />} />
            <Route path="/reviews" element={<Ratings />} />
            <Route path="/ratings" element={<Ratings />} />
            <Route path="/ratings/analytics" element={<RatingsAnalytics />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/favorites/analytics" element={<FavoritesAnalytics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />

            {/* Privileged Pages: Super Admin and Admin Only */}
            <Route element={<ProtectedRoute allowedRoles={PRIVILEGED_ADMIN_ROLES} />}>
              <Route path="/businesses" element={<Businesses />} />
              <Route path="/business" element={<Navigate to="/businesses" replace />} />
              <Route path="/users" element={<Users />} />
              <Route path="/user" element={<Navigate to="/users" replace />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/analytics" element={<ReportsAnalytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/security" element={<Security />} />
              <Route path="/tracking-users" element={<UsersTracking />} />
            </Route>

            {/* Restricted Pages: Super Admin Only */}
            <Route element={<ProtectedRoute allowedRoles={SUPER_ADMIN_ONLY_ROLES} />}>
              <Route path="/deletion-requests" element={<DeletionRequests />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
      </SearchProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
