import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import TravelUserLayout from '../layouts/TravelUserLayout/TravelUserLayout';
import DashboardLayout from '../layouts/DashboardLayout/DashboardLayout';

// Route Guards
import ProtectedRoute from './ProtectedRoute';

// Public Tourist Pages
import Home from '../pages/home/Home';
import Destinations from '../pages/destinations/Destinations';
import DestinationDetails from '../pages/destinations/DestinationDetails';
import Places from '../pages/places/Places';
import PlaceDetails from '../pages/places/PlaceDetails';
import Tours from '../pages/tours/Tours';
import TourDetails from '../pages/tours/TourDetails';
import Guides from '../pages/guides/Guides';
import GuideDetails from '../pages/guides/GuideDetails';
import Reviews from '../pages/reviews/Reviews';
import About from '../pages/about/About';
import Contact from '../pages/contact/Contact';
import Businesses from '../pages/businesses/Businesses';
import BusinessDetails from '../pages/businesses/BusinessDetails';
import Provinces from '../pages/provinces/Provinces';
import ProvinceDetails from '../pages/provinces/ProvinceDetails';
import Categories from '../pages/categories/Categories';
import Events from '../pages/events/Events';
import Galleries from '../pages/galleries/Galleries';
import Achievements from '../pages/achievements/Achievements';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Travel User Dedicated Portal Pages
import TravelUserDashboard from '../pages/travel-user/TravelUserDashboard';
import Trips from '../pages/trips/Trips';
import TripDetails from '../pages/trips/TripDetails';
import MyBookings from '../pages/bookings/MyBookings';
import Favorites from '../pages/favorites/Favorites';
import Profile from '../pages/profile/Profile';
import Notifications from '../pages/notifications/Notifications';
import DeletionRequests from '../pages/delete/DeletionRequests';
import Settings from '../pages/settings/Settings';

// Management & Dashboard Portal Pages
import Dashboard from '../pages/dashboard/Dashboard';
import BusinessDashboard from '../pages/business/BusinessDashboard';
import BusinessList from '../pages/business/BusinessList';
import BusinessForm from '../pages/business/BusinessForm';
import BusinessManage from '../pages/business/BusinessManage';
import BusinessAnalytics from '../pages/business/BusinessAnalytics';
import BusinessBookings from '../pages/business/BusinessBookings';
import BusinessReports from '../pages/business/BusinessReports';

// Tour Guide & Content Editor Portal Pages
import GuideDashboard from '../pages/guide/GuideDashboard';
import GuidePlaces from '../pages/guide/GuidePlaces';
import GuidePlaceForm from '../pages/guide/GuidePlaceForm';
import GuideEvents from '../pages/guide/GuideEvents';
import GuideEventForm from '../pages/guide/GuideEventForm';
import GuideGallery from '../pages/guide/GuideGallery';
import GuideReviews from '../pages/guide/GuideReviews';
import GuideInquiries from '../pages/guide/GuideInquiries';

// Error Pages
import NotFound from '../pages/error/NotFound';
import Forbidden from '../pages/error/Forbidden';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========================================================= */}
        {/* TRAVEL USER & PUBLIC PORTAL (Header-based Layout, No Sidebar) */}
        {/* ========================================================= */}
        <Route element={<TravelUserLayout />}>
          {/* Public Discovery Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destinations/:id" element={<DestinationDetails />} />
          <Route path="/places" element={<Places />} />
          <Route path="/places/:id" element={<PlaceDetails />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/tours/:id" element={<TourDetails />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/guides/:id" element={<GuideDetails />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/businesses" element={<Businesses />} />
          <Route path="/businesses/:id" element={<BusinessDetails />} />
          <Route path="/provinces" element={<Provinces />} />
          <Route path="/provinces/:id" element={<ProvinceDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<Events />} />
          <Route path="/gallery" element={<Galleries />} />
          <Route path="/achievements" element={<Achievements />} />

          {/* Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Travel User Dedicated Pages */}
          <Route element={<ProtectedRoute />}>
            <Route path="/travel-user" element={<TravelUserDashboard />} />
            <Route path="/travel-user/overview" element={<TravelUserDashboard />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/trips/:id" element={<TripDetails />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/wishlist" element={<Favorites />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/deletion-request" element={<DeletionRequests />} />
            <Route path="/delete" element={<DeletionRequests />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Error and Fallbacks within Public Layout */}
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ========================================================= */}
        {/* MANAGEMENT & DASHBOARD PORTAL (Sidebar & Header Layout) */}
        {/* ========================================================= */}
        <Route element={<DashboardLayout />}>
          {/* Unified Management Dashboard */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  'business_owner',
                  'business',
                  'tour_guide',
                  'guide_editor',
                  'content_editor',
                  'guide',
                  'admin',
                  'super_admin',
                  'superadmin',
                  'administrator',
                  'manager',
                ]}
              />
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Business Owner Dedicated Management Routes */}
          <Route element={<ProtectedRoute allowedRoles={['business_owner', 'business']} />}>
            <Route path="/business/dashboard" element={<BusinessDashboard />} />
            <Route path="/business/bookings" element={<BusinessBookings />} />
            <Route path="/business/businesses" element={<BusinessList />} />
            <Route path="/business/businesses/new" element={<BusinessForm />} />
            <Route path="/business/businesses/:id" element={<BusinessManage />} />
            <Route path="/business/businesses/:id/edit" element={<BusinessForm />} />
            <Route path="/business/analytics" element={<BusinessAnalytics />} />
            <Route path="/business/reports" element={<BusinessReports />} />
          </Route>

          {/* Tour Guide & Content Editor Dedicated Management Routes */}
          <Route element={<ProtectedRoute allowedRoles={['tour_guide', 'guide_editor', 'content_editor', 'guide']} />}>
            <Route path="/guide/dashboard" element={<GuideDashboard />} />
            <Route path="/guide/places" element={<GuidePlaces />} />
            <Route path="/guide/places/new" element={<GuidePlaceForm />} />
            <Route path="/guide/places/:id/edit" element={<GuidePlaceForm />} />
            <Route path="/guide/events" element={<GuideEvents />} />
            <Route path="/guide/events/new" element={<GuideEventForm />} />
            <Route path="/guide/events/:id/edit" element={<GuideEventForm />} />
            <Route path="/guide/gallery" element={<GuideGallery />} />
            <Route path="/guide/reviews" element={<GuideReviews />} />
            <Route path="/guide/inquiries" element={<GuideInquiries />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
