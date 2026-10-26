import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, Loader2, Building2, CheckCircle2, Clock, AlertCircle, MapPin, Store } from 'lucide-react';
import businessService from '../../services/businessService';
import Breadcrumb from '../../components/common/Breadcrumb';
import SimplePagination from '../../components/common/SimplePagination';

export default function BusinessList() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await businessService.getOwnerBusinesses();
        const list = res?.data?.businesses || res?.data || res || [];
        setBusinesses(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  const stats = useMemo(() => {
    const total = businesses.length;
    const approved = businesses.filter(b => b.verification_status === 'approved').length;
    const pending = businesses.filter(b => b.verification_status === 'pending').length;
    return { total, approved, pending };
  }, [businesses]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#003E83] dark:text-blue-400 animate-spin" />
        <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400">Loading your business directory...</p>
      </div>
    );
  }

  const itemsPerPage = 6;
  const totalPages = Math.ceil(businesses.length / itemsPerPage) || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, businesses.length);
  const paginatedBusinesses = businesses.slice(startIndex, endIndex);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb
        items={[
          { label: 'Business Portal', to: '/business/dashboard' },
          { label: 'My Businesses' }
        ]}
      />

      {/* Modern Hero & Summary Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 dark:border-zinc-800 bg-gradient-to-br from-blue-50/70 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003E83]/10 dark:bg-blue-400/10 text-[#003E83] dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" />
              <span>Merchant Management & Listings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              My Registered Businesses
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 max-w-xl">
              Manage your hotel, tour operator, dining, or artisan retail profiles visible to tourists on AngkorVerses.
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-gray-200/80 dark:border-zinc-700/80 text-gray-700 dark:text-zinc-300 shadow-2xs font-medium">
                <Building2 className="w-3.5 h-3.5 text-[#003E83] dark:text-blue-400" />
                <span><strong className="text-gray-900 dark:text-white font-bold">{stats.total}</strong> Listings</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-gray-200/80 dark:border-zinc-700/80 text-gray-700 dark:text-zinc-300 shadow-2xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span><strong className="text-gray-900 dark:text-white font-bold">{stats.approved}</strong> Verified & Active</span>
              </div>
              {stats.pending > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 shadow-2xs font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span><strong>{stats.pending}</strong> Under Review</span>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0">
            <Link
              to="/business/businesses/new"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#003E83] to-blue-600 hover:from-[#002e62] hover:to-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-900/20 hover:shadow-lg transition-all active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Register New Business</span>
            </Link>
          </div>
        </div>
      </div>

      {businesses.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-14 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-zinc-800 text-[#003E83] dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-100 dark:border-zinc-700 shadow-2xs">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Businesses Registered Yet</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Create your business profile to start accepting booking requests, answering tourist reviews, and publishing promotional tours.
            </p>
          </div>
          <Link
            to="/business/businesses/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-900/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Business</span>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {paginatedBusinesses.map((biz) => {
              const isApproved = biz.verification_status === 'approved';
              const isPending = biz.verification_status === 'pending';

              return (
                <div
                  key={biz.id}
                  className="modern-card p-6 rounded-3xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between gap-5 transition-all shadow-xs hover:border-blue-300 dark:hover:border-blue-500/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 font-medium">
                        <MapPin size={13} className="text-[#003E83] dark:text-blue-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{biz.address || biz.province?.name || 'Cambodia'}</span>
                      </div>
                      <h3 className="font-extrabold text-lg text-gray-900 dark:text-white tracking-tight">
                        {biz.name}
                      </h3>
                      {biz.description && (
                        <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {biz.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-2xs border ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                          : isPending
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                      }`}
                    >
                      {isApproved && <CheckCircle2 size={11} />}
                      {isPending && <Clock size={11} />}
                      <span>{biz.verification_status}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 text-xs font-semibold text-gray-600 dark:text-zinc-300">
                      {biz.category?.name || 'Tourism Service'}
                    </span>
                    <Link
                      to={`/business/businesses/${biz.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#003E83] hover:bg-[#002e62] dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                    >
                      <span>Manage Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <SimplePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            startIndex={startIndex}
            endIndex={endIndex}
            totalRecords={businesses.length}
            label="businesses"
          />
        </>
      )}
    </div>
  );
}
