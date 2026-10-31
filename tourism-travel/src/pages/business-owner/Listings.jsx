import { useState, useEffect, useCallback } from 'react';
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
  Calendar
} from 'lucide-react';
import businessOwnerService from '../../services/businessOwnerService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

export default function Listings() {
  const { selectedBusiness } = useOutletContext();
  const { showSuccess, showError, showConfirm } = useAlert();

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

  const handleDeleteService = async (svcId) => {
    const confirmed = await showConfirm({
      title: 'Delete Service Listing',
      message: 'Are you sure you want to delete this service listing? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'danger',
    });
    if (!confirmed) return;

    try {
      const res = await businessOwnerService.deleteService(selectedBusiness.id, svcId);
      if (res?.success) {
        showSuccess('Service deleted.');
        setServices((prev) => prev.filter((s) => s.id !== svcId));
      }
    } catch (err) {
      showError(err.message || 'Failed to delete service.');
    }
  };

  // PROMOTION HANDLERS
  const handleOpenCreatePromo = () => {
    setEditingPromo(null);
    setPromoTitle('');
    setPromoCode('ANGKOR15');
    setPromoDiscount('15');
    setPromoStartDate(new Date().toISOString().split('T')[0]);
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
    setPromoStartDate(promo.start_date ? promo.start_date.split('T')[0] : '');
    setPromoEndDate(promo.end_date ? promo.end_date.split('T')[0] : '');
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
      discount_percentage: parseFloat(promoDiscount) || 0,
      start_date: promoStartDate || undefined,
      end_date: promoEndDate || undefined,
      description: promoDescription.trim() || undefined,
      is_active: promoIsActive,
    };

    try {
      if (editingPromo) {
        const res = await businessOwnerService.updatePromotion(selectedBusiness.id, editingPromo.id, payload);
        if (res?.success) {
          showSuccess('Promotion updated successfully.');
          setIsPromoModalOpen(false);
          fetchCatalogData();
        }
      } else {
        const res = await businessOwnerService.createPromotion(selectedBusiness.id, payload);
        if (res?.success) {
          showSuccess('Promotion discount published!', 'Promotion Created');
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

  const handleDeletePromo = async (promoId) => {
    const confirmed = await showConfirm({
      title: 'Delete Promotion',
      message: 'Delete this promotional offer from your establishment?',
      confirmText: 'Delete',
      type: 'danger',
    });
    if (!confirmed) return;

    try {
      const res = await businessOwnerService.deletePromotion(selectedBusiness.id, promoId);
      if (res?.success) {
        showSuccess('Promotion removed.');
        setPromotions((prev) => prev.filter((p) => p.id !== promoId));
      }
    } catch (err) {
      showError(err.message || 'Failed to delete promotion.');
    }
  };

  // EVENT HANDLERS
  const handleOpenCreateEvent = () => {
    setEventTitle('');
    setEventCategory('Cultural & Dining');
    setEventLocation(selectedBusiness?.address || 'Siem Reap');
    setEventStartDate(new Date().toISOString().split('T')[0]);
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
      category: eventCategory.trim() || undefined,
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

  if (!selectedBusiness) {
    return (
      <EmptyState
        icon={Building2}
        title="No active business selected"
        description="Please select or register a business profile first before managing listings."
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#002D62] dark:text-blue-400 uppercase tracking-wider mb-1">
            Establishment Catalog ({selectedBusiness.name})
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Offerings, Deals & Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Publish bookable experiences, configure seasonal discounts, and promote live events.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeTab === 'services' && (
            <button
              type="button"
              onClick={handleOpenCreateService}
              className="px-4 py-2.5 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} />
              <span>Add New Service</span>
            </button>
          )}

          {activeTab === 'promotions' && (
            <button
              type="button"
              onClick={handleOpenCreatePromo}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} />
              <span>Create Promotion</span>
            </button>
          )}

          {activeTab === 'events' && (
            <button
              type="button"
              onClick={handleOpenCreateEvent}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} />
              <span>Publish Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-zinc-800 flex items-center gap-2 text-xs sm:text-sm font-bold">
        {[
          { key: 'services', label: 'Services & Experiences', count: services.length, icon: Package },
          { key: 'promotions', label: 'Promotions & Discounts', count: promotions.length, icon: Tag },
          { key: 'events', label: 'Hosted Events', count: events.length, icon: PartyPopper },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'border-[#002D62] text-[#002D62] dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isActive 
                  ? 'bg-[#002D62]/10 text-[#002D62] dark:bg-blue-400/20 dark:text-blue-400' 
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {isLoading ? (
        <LoadingSpinner text="Retrieving catalog items from database..." />
      ) : activeTab === 'services' ? (
        /* SERVICES GRID */
        services.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No services created yet"
            description="Create your first tourism service (e.g. Khmer Cooking Class, Deluxe Heritage Suite, or Guided Boat Excursion)."
            action={
              <button
                type="button"
                onClick={handleOpenCreateService}
                className="px-4 py-2 rounded-xl bg-[#002D62] text-white text-xs font-bold shadow-sm"
              >
                Add First Service
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={svc.status === 'active' || svc.is_available ? 'success' : 'neutral'}>
                      {svc.status || 'Active'}
                    </Badge>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      ${Number(svc.price || 0).toFixed(2)}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1 mb-1">
                    {svc.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {svc.description || 'Verified tourism experience offered by business.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-[#002D62] dark:text-blue-400 shrink-0" />
                      <span>{svc.duration || 'Flexible'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-[#002D62] dark:text-blue-400 shrink-0" />
                      <span>Max: {svc.capacity || '10'} guests</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditService(svc)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Edit size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(svc.id)}
                    className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
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
        promotions.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="No promotions active"
            description="Create seasonal discount codes or percentage discounts to attract more travelers."
            action={
              <button
                type="button"
                onClick={handleOpenCreatePromo}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-sm"
              >
                Create First Promo
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {promotions.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase">
                      {p.discount_percentage ? `${p.discount_percentage}% OFF` : 'Special Offer'}
                    </span>
                    {p.promo_code && (
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-700">
                        {p.promo_code}
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1">
                    {p.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {p.description || 'Seasonal promotion available to travelers.'}
                  </p>

                  <div className="pt-2 text-[11px] text-slate-400">
                    Status: <strong className={p.is_active ? 'text-emerald-500' : 'text-slate-400'}>{p.is_active ? 'Active' : 'Inactive'}</strong>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditPromo(p)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Edit size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePromo(p.id)}
                    className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
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
        events.length === 0 ? (
          <EmptyState
            icon={PartyPopper}
            title="No events scheduled"
            description="Publish cultural nights, live music, cooking classes, or tasting workshops to the community."
            action={
              <button
                type="button"
                onClick={handleOpenCreateEvent}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm"
              >
                Publish First Event
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <Calendar size={13} />
                    <span>{ev.start_date ? new Date(ev.start_date).toLocaleDateString() : 'Upcoming'}</span>
                  </span>
                  {ev.price && (
                    <span className="font-semibold text-slate-500 dark:text-zinc-400">
                      {ev.price}
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1">
                  {ev.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                  {ev.description || 'Special event hosted at our establishment.'}
                </p>

                {ev.location && (
                  <div className="pt-2 text-[11px] text-slate-400 truncate">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-[#002D62] dark:text-blue-400 uppercase tracking-wider">
                  Service Listing
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {editingService ? 'Edit Experience / Service' : 'Add New Service Listing'}
                </h3>
              </div>
              <button onClick={() => setIsServiceModalOpen(false)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Service Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. Traditional Khmer Cooking Class"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Price ($ USD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={serviceDuration}
                    onChange={(e) => setServiceDuration(e.target.value)}
                    placeholder="2 hours, Full day"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={serviceCapacity}
                    onChange={(e) => setServiceCapacity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Outline what's included, timing, equipment, or pickup details..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Availability Status
                </label>
                <select
                  value={serviceStatus}
                  onChange={(e) => setServiceStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002D62]"
                >
                  <option value="active">Active & Bookable</option>
                  <option value="inactive">Inactive (Temporarily Hidden)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to DB...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMOTION MODAL */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Promotion Deal
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {editingPromo ? 'Edit Promotion Deal' : 'Create Special Promotion'}
                </h3>
              </div>
              <button onClick={() => setIsPromoModalOpen(false)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handlePromoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Promotion Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  placeholder="e.g. 15% Early Bird Sunrise Special"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Promo Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="ANGKOR15"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Discount Percentage (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={promoDiscount}
                    onChange={(e) => setPromoDiscount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={promoStartDate}
                    onChange={(e) => setPromoStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={promoEndDate}
                    min={promoStartDate}
                    onChange={(e) => setPromoEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Conditions & Description
                </label>
                <textarea
                  rows={3}
                  value={promoDescription}
                  onChange={(e) => setPromoDescription(e.target.value)}
                  placeholder="Applies to bookings made 3 days in advance..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-alert-backdrop">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl animate-alert-popup space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Community Event
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Publish Business Event
                </h3>
              </div>
              <button onClick={() => setIsEventModalOpen(false)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Khmer Traditional Music & Apsara Night"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Admission / Price
                  </label>
                  <input
                    type="text"
                    value={eventPrice}
                    onChange={(e) => setEventPrice(e.target.value)}
                    placeholder="Free / $10 Admission"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Location / Venue
                </label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Event Description
                </label>
                <textarea
                  rows={3}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Performers, schedules, seatings, dinner packages..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
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
