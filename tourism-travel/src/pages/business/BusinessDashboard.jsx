import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Star, 
  Plus, 
  AlertCircle, 
  Clock, 
  BarChart3, 
  MessageSquare, 
  Loader2,
  ChevronRight,
  CalendarCheck,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Sparkles
} from 'lucide-react';
import businessService from '../../services/businessService';
import bookingService from '../../services/bookingService';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function BusinessDashboard() {
  const [profileData, setProfileData] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [bookingStats, setBookingStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      businessService.getOwnerProfile().catch(() => null),
      businessService.getOwnerBusinesses().catch(() => ({ data: { businesses: [] } })),
      bookingService.getBookingStatistics().catch(() => null),
    ]).then(([profRes, bizRes, statsRes]) => {
      if (statsRes?.data) setBookingStats(statsRes.data);
      if (!isMounted) return;
      setProfileData(profRes?.data || profRes);
      const bizList = bizRes?.data?.businesses || bizRes?.data || bizRes || [];
      setBusinesses(Array.isArray(bizList) ? bizList : []);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#003E83] dark:text-[#60a5fa] animate-spin" />
        <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Loading Business Dashboard...</p>
      </div>
    );
  }

  const totalBusinesses = businesses.length;
  const approvedCount = businesses.filter(b => b.verification_status === 'approved').length;
  const pendingCount = businesses.filter(b => b.verification_status === 'pending').length;
  const rejectedCount = businesses.filter(b => b.verification_status === 'rejected').length;

  const totalReviews = businesses.reduce((acc, b) => acc + (b.reviews_count || b.review_count || 0), 0);
  const avgRating = businesses.length > 0 
    ? (businesses.reduce((acc, b) => acc + Number(b.rating || 0), 0) / businesses.length).toFixed(1)
    : '0.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <Breadcrumb items={[{ label: 'Business Owner Portal' }]} />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#003E83] to-blue-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-bold border border-white/10">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Verified Business Management Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {profileData?.user?.name ? `Welcome back, ${profileData.user.name}` : 'Business Owner Dashboard'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
              Manage your hotels, restaurants, and tourism activities. Review customer reservations, reply to guest feedback, and export financial performance reports.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <Link
              to="/business/bookings"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 text-xs font-bold rounded-2xl shadow-sm transition-all flex items-center gap-2 relative"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-300" />
              <span>Customer Bookings</span>
              {bookingStats && bookingStats.pending_bookings > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping absolute -top-1 -right-1" />
              )}
            </Link>
            <Link
              to="/business/analytics"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 text-xs font-bold rounded-2xl shadow-sm transition-all flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-sky-300" />
              <span>Analytics</span>
            </Link>
            <Link
              to="/business/businesses/new"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-extrabold rounded-2xl shadow-md transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Add Listing</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Verification Alert Banner */}
      {rejectedCount > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs transition-colors">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>You have {rejectedCount} submission(s) requiring edits before admin verification.</span>
          </div>
          <Link to="/business/businesses" className="font-bold underline text-rose-800 dark:text-rose-200">
            Review Updates
          </Link>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Link
          to="/business/bookings"
          className="modern-card p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-all group block"
        >
          <div className="flex items-center justify-between text-gray-500 dark:text-zinc-400 text-xs mb-2">
            <span className="font-bold">Guest Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#003E83] dark:text-blue-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {bookingStats ? bookingStats.total_bookings : 0}
          </p>
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {bookingStats ? `${bookingStats.pending_bookings} Pending Action` : 'Manage'}
          </span>
        </Link>

        <div className="modern-card p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm transition-all">
          <div className="flex items-center justify-between text-gray-500 dark:text-zinc-400 text-xs mb-2">
            <span className="font-bold">Active Listings</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {totalBusinesses}
          </p>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {approvedCount} Verified Active
          </span>
        </div>

        <div className="modern-card p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm transition-all">
          <div className="flex items-center justify-between text-gray-500 dark:text-zinc-400 text-xs mb-2">
            <span className="font-bold">Pending Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {pendingCount}
          </p>
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1 block font-medium">
            In Moderation Queue
          </span>
        </div>

        <div className="modern-card p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm transition-all">
          <div className="flex items-center justify-between text-gray-500 dark:text-zinc-400 text-xs mb-2">
            <span className="font-bold">Guest Reviews</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {totalReviews}
          </p>
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1 block font-medium">
            Across listings
          </span>
        </div>

        <div className="modern-card p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm transition-all">
          <div className="flex items-center justify-between text-gray-500 dark:text-zinc-400 text-xs mb-2">
            <span className="font-bold">Avg Rating</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {avgRating}
          </p>
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            Out of 5.0 Stars
          </span>
        </div>
      </div>

      {/* Managed Business Listings */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
              <span>Managed Business Profiles</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Update services, opening hours, promotional media, and respond to guest reviews.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/business/reports"
              className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Reports</span>
            </Link>
            <Link
              to="/business/businesses"
              className="text-xs font-bold text-[#003E83] dark:text-[#60a5fa] hover:underline flex items-center gap-1 px-2 py-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {businesses.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-zinc-800 text-[#003E83] dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">No Businesses Registered Yet</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              Register your hotel, restaurant, transport service, or tour agency to reach millions of domestic and international travelers across Cambodia.
            </p>
            <div className="pt-2">
              <Link
                to="/business/businesses/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-bold rounded-2xl shadow-md transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Register Business Listing</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businesses.map((biz) => {
              const isApproved = biz.verification_status === 'approved';
              const isPending = biz.verification_status === 'pending';

              return (
                <div
                  key={biz.id}
                  className="modern-card p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/50 flex flex-col justify-between gap-4 hover:border-blue-500 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">{biz.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : isPending
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          }`}
                        >
                          {biz.verification_status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{biz.address || biz.province?.name || 'Cambodia'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-xl border border-gray-200/80 dark:border-zinc-700 shrink-0 shadow-2xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{Number(biz.rating || 0).toFixed(1)}</span>
                    </div>
                  </div>

                  {biz.verification_status === 'rejected' && biz.rejection_reason && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 rounded-xl text-xs border border-rose-200 dark:border-rose-900/50">
                      <span className="font-bold">Rejection Note:</span> {biz.rejection_reason}
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200/70 dark:border-zinc-700/60 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                      {biz.category?.name || 'Tourism Business'}
                    </span>
                    <Link
                      to={`/business/businesses/${biz.id}`}
                      className="px-4 py-1.5 bg-[#003E83] hover:bg-[#002e62] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 hover:scale-105 active:scale-95"
                    >
                      <span>Manage Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
