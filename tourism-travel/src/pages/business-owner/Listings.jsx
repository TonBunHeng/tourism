import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Clock,
  Users,
  X,
  Building2,
  Tag,
  PartyPopper,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import businessOwnerService from '../../services/businessOwnerService';
import { useAlert } from '../../context/AlertContext';
import { useSearch } from '../../context/SearchContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

export default function Listings() {
  const { selectedBusiness } = useOutletContext();
  const { showSuccess, showError, showConfirm } = useAlert();
  const { searchTerm } = useSearch();

  const [activeTab, setActiveTab] = useState('services'); // 'services' | 'promotions' | 'events'
  const [isLoading, setIsLoading] = useState(false);

  // Services State
  const [services, setServices] = useState([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState('25');
  const [serviceDuration, setServiceDuration] = useState('2 hours');
  const [serviceCapacity, setServiceCapacity] = useState('10');
  const [serviceStatus, setServiceStatus] = useState('active');

  // Promotions State
  const [promotions, setPromotions] = useState([]);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoTitle, setPromoTitle] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('15');
  const [promoStartDate, setPromoStartDate] = useState('');
  const [promoEndDate, setPromoEndDate] = useState('');
  const [promoDescription, setPromoDescription] = useState('');
  const [promoIsActive, setPromoIsActive] = useState(true);

  // Events State
  const [events, setEvents] = useState([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState('Cultural & Dining');
  const [eventLocation, setEventLocation] = useState(selectedBusiness?.address || '');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventPrice, setEventPrice] = useState('Free Admission');
  const [eventDescription, setEventDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCatalogData = useCallback(() => {
    if (!selectedBusiness?.id) return;
    setIsLoading(true);

    Promise.allSettled([
      businessOwnerService.getServices(selectedBusiness.id),
      businessOwnerService.getPromotions(selectedBusiness.id),
      businessOwnerService.getEvents(selectedBusiness.id),
    ])
      .then(([sRes, pRes, eRes]) => {
        if (sRes.status === 'fulfilled' && sRes.value?.success) {
          const list = sRes.value.data?.services || sRes.value.data || [];
          setServices(Array.isArray(list) ? list : []);
        }
        if (pRes.status === 'fulfilled' && pRes.value?.success) {
          const pList = pRes.value.data?.promotions || pRes.value.data || [];
          setPromotions(Array.isArray(pList) ? pList : []);
        }
        if (eRes.status === 'fulfilled' && eRes.value?.success) {
          const eList = eRes.value.data?.events || eRes.value.data || [];
          setEvents(Array.isArray(eList) ? eList : []);
        }
      })
      .catch((err) => {
        console.warn('Failed to load business catalog data:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedBusiness]);

  useEffect(() => {
    fetchCatalogData();
  }, [fetchCatalogData]);

  // SERVICE HANDLERS
  const handleOpenCreateService = () => {
    setEditingService(null);
    setServiceName('');
    setServiceDescription('');
    setServicePrice('25');
    setServiceDuration('2 hours');
    setServiceCapacity('10');
    setServiceStatus('active');
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (svc) => {
    setEditingService(svc);
    setServiceName(svc.name || '');
    setServiceDescription(svc.description || '');
    setServicePrice(String(svc.price || ''));
    setServiceDuration(svc.duration || '');
    setServiceCapacity(String(svc.capacity || '10'));
    setServiceStatus(svc.status || 'active');
    setIsServiceModalOpen(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (!serviceName.trim() || !selectedBusiness?.id) {
      showError('Please enter service name.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: serviceName.trim(),
      description: serviceDescription.trim() || undefined,
      price: parseFloat(servicePrice) || 0,
      duration: serviceDuration.trim() || undefined,
      capacity: parseInt(serviceCapacity, 10) || undefined,
      status: serviceStatus,
      is_available: serviceStatus === 'active',
    };

    try {
      if (editingService) {
        const res = await businessOwnerService.updateService(selectedBusiness.id, editingService.id, payload);
        if (res?.success) {
          showSuccess('Service listing updated successfully.');
          setIsServiceModalOpen(false);
          fetchCatalogData();
        }
      } else {
        const res = await businessOwnerService.createService(selectedBusiness.id, payload);
        if (res?.success) {
          showSuccess('New service listing published!', 'Service Created');
          setIsServiceModalOpen(false);
          fetchCatalogData();
        }
      }
    } catch (err) {
      showError(err.message || 'Failed to save service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async (id) => {
    const confirmed = await showConfirm({
      title: 'Delete Service Offering',
      message: 'Remove this service listing from your public profile? Active bookings will remain intact.',
      confirmText: 'Delete Service',
      type: 'danger',
    });
    if (!confirmed) return;

    try {
      const res = await businessOwnerService.deleteService(selectedBusiness.id, id);
      if (res?.success) {
        showSuccess('Service removed successfully.');
        fetchCatalogData();
      }
    } catch (err) {
      showError(err.message || 'Failed to delete service.');
    }
  };

  // PROMO HANDLERS
  const handleOpenCreatePromo = () => {
    setEditingPromo(null);
    setPromoTitle('');
    setPromoCode('');
    setPromoDiscount('15');
    setPromoStartDate('');
    setPromoEndDate('');
    setPromoDescription('');
    setPromoIsActive(true);
    setIsPromoModalOpen(true);
  };

  const handleOpenEditPromo = (promo) => {
    setEditingPromo(promo);
    setPromoTitle(promo.title || '');
    setPromoCode(promo.promo_code || '');
    setPromoDiscount(String(promo.discount_percentage || '15'));
    setPromoStartDate(promo.start_date || '');
    setPromoEndDate(promo.end_date || '');
    setPromoDescription(promo.description || '');
    setPromoIsActive(Boolean(promo.is_active));
    setIsPromoModalOpen(true);
  };

  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    if (!promoTitle.trim() || !selectedBusiness?.id) {
      showError('Please enter promotion title.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: promoTitle.trim(),
      promo_code: promoCode.trim() || undefined,
      discount_percentage: parseFloat(promoDiscount) || 10,
      start_date: promoStartDate || undefined,
      end_date: promoEndDate || undefined,
      description: promoDescription.trim() || undefined,
      is_active: promoIsActive,
    };

    try {
      if (editingPromo) {
        const res = await businessOwnerService.updatePromotion(selectedBusiness.id, editingPromo.id, payload);
        if (res?.success) {
          showSuccess('Promotion deal updated successfully.');
          setIsPromoModalOpen(false);
          fetchCatalogData();
        }
      } else {
        const res = await businessOwnerService.createPromotion(selectedBusiness.id, payload);
        if (res?.success) {
          showSuccess('Special promotion created and activated!', 'Promotion Published');
          setIsPromoModalOpen(false);
          fetchCatalogData();
        }
      }
    } catch (err) {
      showError(err.message || 'Failed to save promotion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePromo = async (id) => {
    const confirmed = await showConfirm({
      title: 'Delete Promotion',
      message: 'Deactivate and delete this promotional discount deal?',
      confirmText: 'Delete Promo',
      type: 'danger',
    });
    if (!confirmed) return;

    try {
      const res = await businessOwnerService.deletePromotion(selectedBusiness.id, id);
      if (res?.success) {
        showSuccess('Promotion deleted successfully.');
        fetchCatalogData();
      }
    } catch (err) {
      showError(err.message || 'Failed to delete promotion.');
    }
  };

  // EVENT HANDLERS
  const handleOpenCreateEvent = () => {
    setEventTitle('');
    setEventCategory('Cultural & Dining');
    setEventLocation(selectedBusiness?.address || '');
    setEventStartDate('');
    setEventEndDate('');
    setEventPrice('Free Admission');
    setEventDescription('');
    setIsEventModalOpen(true);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (!eventTitle.trim() || !selectedBusiness?.id) {
      showError('Please enter event title.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: eventTitle.trim(),
      category: eventCategory,
      location: eventLocation.trim() || undefined,
      start_date: eventStartDate || undefined,
      end_date: eventEndDate || undefined,
      price: eventPrice.trim() || undefined,
      description: eventDescription.trim() || undefined,
    };

    try {
      const res = await businessOwnerService.createEvent(selectedBusiness.id, payload);
      if (res?.success) {
        showSuccess('Event published to community calendar!', 'Event Created');
        setIsEventModalOpen(false);
        fetchCatalogData();
      }
    } catch (err) {
      showError(err.message || 'Failed to publish event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered lists by header search
  const filteredServices = useMemo(() => {
    if (!searchTerm) return services;
    const q = searchTerm.toLowerCase();
    return services.filter(
      (s) => s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
    );
  }, [services, searchTerm]);

  const filteredPromos = useMemo(() => {
    if (!searchTerm) return promotions;
    const q = searchTerm.toLowerCase();
    return promotions.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.promo_code?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [promotions, searchTerm]);

  const filteredEvents = useMemo(() => {
    if (!searchTerm) return events;
    const q = searchTerm.toLowerCase();
    return events.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q)
    );
  }, [events, searchTerm]);

  if (!selectedBusiness) {
    return (
      <EmptyState
        icon={Building2}
        title="No active business selected"
        description="Please select or register a business profile first before managing listings."
      />
    );
  }

  const catalogStats = [
    {
      title: 'Services & Offerings',
      value: services.length,
      subtext: `${services.filter((s) => s.status === 'active' || s.is_available).length} bookable active`,
      icon: Package,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      title: 'Promotions Active',
      value: promotions.length,
      subtext: `${promotions.filter((p) => p.is_active).length} live discount deals`,
      icon: Tag,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
    },
    {
      title: 'Hosted Events',
      value: events.length,
      subtext: 'Cultural & community programs',
      icon: PartyPopper,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header Section (matching tourism-admin) */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Listings & Services
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Publish bookable experiences, configure seasonal discounts, and promote live events.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {activeTab === 'services' && (
              <button
                type="button"
                onClick={handleOpenCreateService}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#003E83] hover:bg-[#002e62] text-white text-xs sm:text-sm font-medium shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={16} />
                <span>Add Service</span>
              </button>
            )}

            {activeTab === 'promotions' && (
              <button
                type="button"
                onClick={handleOpenCreatePromo}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-medium shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={16} />
                <span>Create Promotion</span>
              </button>
            )}

            {activeTab === 'events' && (
              <button
                type="button"
                onClick={handleOpenCreateEvent}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-medium shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={16} />
                <span>Publish Event</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {catalogStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-zinc-900 rounded-md p-4 shadow-xs border border-gray-200 dark:border-zinc-800 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium truncate">
                    {stat.title}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-md shrink-0 ${stat.bg}`}>
                  <Icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">
                  {stat.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Segmented Tabs (matching tourism-admin tabs) */}
      <div className="bg-gray-100 dark:bg-zinc-800/80 p-1 rounded-md inline-flex items-center gap-1 mb-6 border border-gray-200/50 dark:border-zinc-700/50 self-start">
        {[
          { key: 'services', label: 'Services & Offerings', count: filteredServices.length, icon: Package },
          { key: 'promotions', label: 'Promotions & Deals', count: filteredPromos.length, icon: Tag },
          { key: 'events', label: 'Hosted Events', count: filteredEvents.length, icon: PartyPopper },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-zinc-900 text-[#003E83] dark:text-blue-400 font-semibold shadow-xs'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  isActive
                    ? 'bg-blue-50 text-[#003E83] dark:bg-blue-950/60 dark:text-blue-400'
                    : 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="py-16">
          <LoadingSpinner text="Retrieving catalog items from database..." />
        </div>
      ) : activeTab === 'services' ? (
        /* SERVICES GRID */
        filteredServices.length === 0 ? (
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800">
            <EmptyState
              icon={Package}
              title="No services created yet"
              description="Create your first tourism service (e.g. Khmer Cooking Class, Deluxe Heritage Suite, or Guided Boat Excursion)."
              action={
                <button
                  type="button"
                  onClick={handleOpenCreateService}
                  className="px-3.5 py-2 rounded-md bg-[#003E83] text-white text-xs font-medium shadow-xs"
                >
                  Add First Service
                </button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((svc) => (
              <div
                key={svc.id}
                className="p-4 rounded-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={svc.status === 'active' || svc.is_available ? 'success' : 'neutral'}>
                      {svc.status || 'Active'}
                    </Badge>
                    <span className="text-base font-bold text-gray-900 dark:text-white">
                      ${Number(svc.price || 0).toFixed(2)}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 mb-1">
                    {svc.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {svc.description || 'Verified tourism experience offered by business.'}
                  </p>

                  <div className="mt-3.5 pt-2.5 border-t border-gray-100 dark:border-zinc-800 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-[#003E83] dark:text-blue-400 shrink-0" />
                      <span>{svc.duration || 'Flexible'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-[#003E83] dark:text-blue-400 shrink-0" />
                      <span>Max: {svc.capacity || '10'} guests</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditService(svc)}
                    className="px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                  >
                    <Edit size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(svc.id)}
                    className="px-2.5 py-1.5 rounded-md border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'promotions' ? (
        /* PROMOTIONS GRID */
        filteredPromos.length === 0 ? (
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800">
            <EmptyState
              icon={Tag}
              title="No promotions active"
              description="Create seasonal discount codes or percentage discounts to attract more travelers."
              action={
                <button
                  type="button"
                  onClick={handleOpenCreatePromo}
                  className="px-3.5 py-2 rounded-md bg-amber-600 text-white text-xs font-medium shadow-xs"
                >
                  Create First Promo
                </button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPromos.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-500 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 text-[11px] font-bold uppercase">
                      {p.discount_percentage ? `${p.discount_percentage}% OFF` : 'Special Offer'}
                    </span>
                    {p.promo_code && (
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-700">
                        {p.promo_code}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
                    {p.title}
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {p.description || 'Seasonal promotion available to travelers.'}
                  </p>

                  <div className="pt-1.5 text-[11px] text-gray-400 dark:text-zinc-500">
                    Status:{' '}
                    <strong className={p.is_active ? 'text-emerald-500 font-semibold' : 'text-gray-400'}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </strong>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditPromo(p)}
                    className="px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                  >
                    <Edit size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePromo(p.id)}
                    className="px-2.5 py-1.5 rounded-md border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* EVENTS GRID */
        filteredEvents.length === 0 ? (
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800">
            <EmptyState
              icon={PartyPopper}
              title="No events scheduled"
              description="Publish cultural nights, live music, cooking classes, or tasting workshops to the community."
              action={
                <button
                  type="button"
                  onClick={handleOpenCreateEvent}
                  className="px-3.5 py-2 rounded-md bg-purple-600 text-white text-xs font-medium shadow-xs"
                >
                  Publish First Event
                </button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs hover:border-purple-400 dark:hover:border-purple-500 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <Calendar size={13} />
                    <span>{ev.start_date ? new Date(ev.start_date).toLocaleDateString() : 'Upcoming'}</span>
                  </span>
                  {ev.price && (
                    <span className="font-medium text-gray-500 dark:text-zinc-400 text-[11px]">
                      {ev.price}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
                  {ev.title}
                </h3>

                <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {ev.description || 'Special event hosted at our establishment.'}
                </p>

                {ev.location && (
                  <div className="pt-1.5 text-[11px] text-gray-400 dark:text-zinc-500 truncate">
                    📍 {ev.location}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* SERVICE MODAL */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 shadow-2xl animate-alert-popup space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-semibold text-[#003E83] dark:text-blue-400 uppercase tracking-wider">
                  Service Offering
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {editingService ? 'Edit Experience / Service' : 'Add New Service Listing'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Service Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. Traditional Khmer Cooking Class"
                  className="w-full px-3 py-1.5 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Price ($ USD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={serviceDuration}
                    onChange={(e) => setServiceDuration(e.target.value)}
                    placeholder="2 hours, Full day"
                    className="w-full px-3 py-1.5 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={serviceCapacity}
                    onChange={(e) => setServiceCapacity(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Outline what's included, timing, equipment, or pickup details..."
                  className="w-full px-3 py-1.5 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Availability Status
                </label>
                <select
                  value={serviceStatus}
                  onChange={(e) => setServiceStatus(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                >
                  <option value="active">Active & Bookable</option>
                  <option value="inactive">Inactive (Temporarily Hidden)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-md bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-medium transition shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMOTION MODAL */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 shadow-2xl animate-alert-popup space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Promotion Deal
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {editingPromo ? 'Edit Promotion Deal' : 'Create Special Promotion'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPromoModalOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePromoSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Promotion Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  placeholder="e.g. 15% Early Bird Sunrise Special"
                  className="w-full px-3 py-1.5 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Promo Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="ANGKOR15"
                    className="w-full px-3 py-1.5 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Discount Percentage (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={promoDiscount}
                    onChange={(e) => setPromoDiscount(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={promoStartDate}
                    onChange={(e) => setPromoStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-700 dark:text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={promoEndDate}
                    min={promoStartDate}
                    onChange={(e) => setPromoEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-700 dark:text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Conditions & Description
                </label>
                <textarea
                  rows={3}
                  value={promoDescription}
                  onChange={(e) => setPromoDescription(e.target.value)}
                  placeholder="Applies to bookings made 3 days in advance..."
                  className="w-full px-3 py-1.5 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Publish Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EVENT MODAL */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 shadow-2xl animate-alert-popup space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Community Event
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Publish Business Event
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEventSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Khmer Traditional Music & Apsara Night"
                  className="w-full px-3 py-1.5 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-700 dark:text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Admission / Price
                  </label>
                  <input
                    type="text"
                    value={eventPrice}
                    onChange={(e) => setEventPrice(e.target.value)}
                    placeholder="Free / $10 Admission"
                    className="w-full px-3 py-1.5 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Location / Venue
                </label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Event Description
                </label>
                <textarea
                  rows={3}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Performers, schedules, seatings, dinner packages..."
                  className="w-full px-3 py-1.5 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
