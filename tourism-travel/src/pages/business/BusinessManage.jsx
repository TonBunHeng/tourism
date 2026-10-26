import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Loader2, 
  Save, 
  Star,
  ExternalLink,
  Upload,
  Copy,
  Check,
  Image as ImageIcon,
  CalendarCheck,
  Phone,
  Mail,
} from 'lucide-react';
import businessService from '../../services/businessService';
import bookingService from '../../services/bookingService';
import { useAlert } from '../../context/AlertContext';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function BusinessManage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useAlert();

  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [hours, setHours] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [events, setEvents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('overview');

  // Form states for modals/tabs
  const [newService, setNewService] = useState({ name: '', description: '', price: '', duration_minutes: '' });
  const [newPromo, setNewPromo] = useState({ title: '', description: '', discount_percentage: '', start_date: '', end_date: '' });
  const [newEvent, setNewEvent] = useState({ title: '', description: '', location: '', start_date: '' });
  const [replyText, setReplyText] = useState({});
  const [imageInput, setImageInput] = useState('');

  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const galleryFileInputRef = useRef(null);


  const handleConfirmBooking = async (bId) => {
    setActionLoadingId(bId);
    try {
      await bookingService.confirmBooking(bId);
      showAlert({ title: 'Success', message: 'Booking confirmed! Guest has been notified.', type: 'success' });
      fetchBusinessData();
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message || 'Failed to confirm booking.', type: 'danger' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectBooking = async (bId) => {
    const reason = window.prompt('Please provide a reason for declining this reservation (optional):', 'Fully booked on this day');
    if (reason === null) return;
    setActionLoadingId(bId);
    try {
      await bookingService.rejectBooking(bId, reason);
      showAlert({ title: 'Booking Declined', message: 'Booking has been declined.', type: 'info' });
      fetchBusinessData();
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message || 'Failed to decline booking.', type: 'danger' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCompleteBooking = async (bId) => {
    setActionLoadingId(bId);
    try {
      await bookingService.completeBooking(bId);
      showAlert({ title: 'Completed', message: 'Booking marked as completed.', type: 'success' });
      fetchBusinessData();
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message || 'Failed to complete booking.', type: 'danger' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const fetchBusinessData = useCallback(async () => {
    setLoading(true);
    try {
      const [bizRes, srvRes, hrsRes, galRes, prmRes, evtRes, rvwRes, bkgRes] = await Promise.all([
        businessService.getOwnerBusiness(id),
        businessService.getServices(id).catch(() => ({ data: [] })),
        businessService.getHours(id).catch(() => ({ data: [] })),
        businessService.getImages(id).catch(() => ({ data: [] })),
        businessService.getPromotions(id).catch(() => ({ data: [] })),
        businessService.getEvents(id).catch(() => ({ data: [] })),
        businessService.getReviews(id).catch(() => ({ data: [] })),
        bookingService.getBusinessBookings(id).catch(() => ({ data: [] })),
      ]);

      const bizObj = bizRes?.data || bizRes;
      setBusiness(bizObj);
      setServices(srvRes?.data || srvRes || []);

      const existingHours = hrsRes?.data || hrsRes || [];
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const formattedHours = days.map(d => {
        const found = existingHours.find(h => (h.day_of_week || '').toLowerCase() === d);
        return found ? { ...found, day_of_week: d } : { day_of_week: d, open_time: '08:00', close_time: '20:00', is_closed: false };
      });
      setHours(formattedHours);

      setGallery(galRes?.data || galRes || []);
      setPromotions(prmRes?.data || prmRes || []);
      setEvents(evtRes?.data || evtRes || []);

      const rList = rvwRes?.data?.reviews || rvwRes?.data || rvwRes || [];
      setReviews(Array.isArray(rList) ? rList : []);

      const bList = bkgRes?.data?.bookings || bkgRes?.data || bkgRes || [];
      setBookings(Array.isArray(bList) ? bList : []);
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message || 'Access denied or business not found.', type: 'danger' });
      navigate('/business/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showAlert]);

  useEffect(() => {
    if (id) fetchBusinessData();
  }, [id, fetchBusinessData]);

  // SERVICE CRUD
  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newService.name) return;
    try {
      await businessService.createService(id, newService);
      setNewService({ name: '', description: '', price: '', duration_minutes: '' });
      showAlert({ title: 'Success', message: 'Service added successfully.', type: 'success' });
      fetchBusinessData();
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message || 'Failed to add service.', type: 'danger' });
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (await showConfirm({ title: 'Delete Service', message: 'Are you sure you want to remove this service?', type: 'danger' })) {
      try {
        await businessService.deleteService(id, serviceId);
        fetchBusinessData();
      } catch (err) {
        showAlert({ title: 'Error', message: err?.message || 'Failed to delete service.', type: 'danger' });
      }
    }
  };

  // HOURS BATCH SAVE
  const handleSaveHours = async () => {
    try {
      await businessService.updateHours(id, hours);
      showAlert({ title: 'Success', message: 'Opening hours updated successfully.', type: 'success' });
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message || 'Failed to update hours.', type: 'danger' });
    }
  };

  // GALLERY CRUD
  const handleCopyUrl = async () => {
    if (!imageInput) return;
    try {
      await navigator.clipboard.writeText(imageInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showAlert({ title: 'Copied!', message: 'Image URL copied to clipboard.', type: 'info' });
    } catch {
      // Fallback
    }
  };

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showAlert({ title: 'Invalid File', message: 'Please select or drop an image file (PNG, JPG, WEBP).', type: 'warning' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageInput(e.target.result);
      showAlert({ title: 'Photo Loaded', message: 'Photo uploaded successfully.', type: 'success' });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!imageInput) return;
    try {
      await businessService.uploadImage(id, { image_url: imageInput });
      setImageInput('');
      fetchBusinessData();
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message || 'Failed to upload image.', type: 'danger' });
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (await showConfirm({ title: 'Delete Image', message: 'Remove this photo from gallery?', type: 'danger' })) {
      try {
        await businessService.deleteImage(id, imageId);
        fetchBusinessData();
      } catch (err) {
        showAlert({ title: 'Error', message: err?.message || 'Failed to delete image.', type: 'danger' });
      }
    }
  };

  // PROMOTION CRUD
  const handleAddPromotion = async (e) => {
    e.preventDefault();
    if (!newPromo.title) return;
    try {
      await businessService.createPromotion(id, newPromo);
      setNewPromo({ title: '', description: '', discount_percentage: '', start_date: '', end_date: '' });
      showAlert({ title: 'Success', message: 'Promotion added successfully.', type: 'success' });
      fetchBusinessData();
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message || 'Failed to add promotion.', type: 'danger' });
    }
  };

  const handleDeletePromotion = async (promoId) => {
    if (await showConfirm({ title: 'Delete Promotion', message: 'Remove this promotion?', type: 'danger' })) {
      try {
        await businessService.deletePromotion(id, promoId);
        fetchBusinessData();
      } catch (err) {
        showAlert({ title: 'Error', message: err?.message || 'Failed to delete promotion.', type: 'danger' });
      }
    }
  };

  // EVENT CRUD
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title) return;
    try {
      await businessService.createEvent(id, newEvent);
      setNewEvent({ title: '', description: '', location: '', start_date: '' });
      showAlert({ title: 'Success', message: 'Event added successfully.', type: 'success' });
      fetchBusinessData();
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message || 'Failed to create event.', type: 'danger' });
    }
  };

  // REVIEWS REPLY
  const handleReplySubmit = async (reviewId) => {
    const text = replyText[reviewId];
    if (!text) return;
    try {
      await businessService.replyReview(id, reviewId, text);
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
      showAlert({ title: 'Success', message: 'Reply posted to review.', type: 'success' });
      fetchBusinessData();
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message || 'Failed to reply.', type: 'danger' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#003E83] dark:text-[#60a5fa] animate-spin" />
        <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Loading business manager...</p>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Business Portal', to: '/business/dashboard' },
          { label: 'My Businesses', to: '/business/businesses' },
          { label: business.name }
        ]}
      />
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 dark:border-zinc-800 bg-gradient-to-br from-blue-50/60 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-6 sm:p-8 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003E83]/10 dark:bg-blue-400/10 text-[#003E83] dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Listing Verification: {business.verification_status}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{business.name}</h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400">
              Manage your services, promotions, photo gallery, operating hours, and customer bookings in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to={`/businesses/${business.id}`}
              target="_blank"
              className="px-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-2 shadow-2xs transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Public View
            </Link>
            <Link
              to={`/business/businesses/${business.id}/edit`}
              className="px-4 py-2.5 bg-gradient-to-r from-[#003E83] to-blue-700 hover:from-[#002e62] hover:to-blue-800 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Tab Selection Switcher */}
      <div className="flex p-1.5 bg-gray-100/90 dark:bg-zinc-800/90 backdrop-blur-md rounded-2xl border border-gray-200/60 dark:border-zinc-700/60 overflow-x-auto gap-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'services', label: `Services (${services.length})` },
          { id: 'hours', label: 'Opening Hours' },
          { id: 'gallery', label: `Gallery (${gallery.length})` },
          { id: 'promotions', label: `Promotions (${promotions.length})` },
          { id: 'events', label: `Events (${events.length})` },
          { id: 'bookings', label: `Bookings (${bookings.length})` },
          { id: 'reviews', label: `Reviews (${reviews.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-xs font-bold whitespace-nowrap rounded-xl transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-white dark:bg-zinc-700 text-[#003E83] dark:text-blue-300 shadow-xs'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}
      <div>
        {/* OVERVIEW / PROFILE */}
        {activeTab === 'overview' && (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-4 transition-colors">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Business Summary</h3>
            <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {business.description || 'No description provided.'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800 text-xs">
              <div>
                <span className="text-gray-400 block font-medium">Category</span>
                <span className="font-bold text-gray-900 dark:text-white">{business.category?.name || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Province</span>
                <span className="font-bold text-gray-900 dark:text-white">{business.province?.name || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Phone</span>
                <span className="font-bold text-gray-900 dark:text-white">{business.phone || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Price Range</span>
                <span className="font-bold text-gray-900 dark:text-white">{business.price_range || '$$'}</span>
              </div>
            </div>
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <form onSubmit={handleAddService} className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-3 transition-colors">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Add Service Item</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Service Name (e.g. Deluxe Room)"
                  value={newService.name}
                  onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                  className="px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price ($)"
                  value={newService.price}
                  onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                  className="px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={newService.duration_minutes}
                  onChange={(e) => setNewService(prev => ({ ...prev, duration_minutes: e.target.value }))}
                  className="px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Short description of this service or item..."
                value={newService.description}
                onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
              />
              <button type="submit" className="px-3.5 py-2 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] dark:text-zinc-950 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer">
                Add Service
              </button>
            </form>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-3 transition-colors">
              <h4 className="text-base font-bold text-gray-900 dark:text-white">Configured Services ({services.length})</h4>
              {services.map((s) => (
                <div key={s.id} className="p-3.5 bg-gray-50 dark:bg-zinc-800/60 rounded-md border border-gray-200 dark:border-zinc-700/60 flex items-center justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-xs text-gray-900 dark:text-white">{s.name}</h5>
                    {s.description && <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">{s.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {s.price && <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">${s.price}</span>}
                    <button onClick={() => handleDeleteService(s.id)} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HOURS TAB */}
        {activeTab === 'hours' && (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h4 className="text-base font-bold text-gray-900 dark:text-white">Weekly Schedule Editor</h4>
              <button onClick={handleSaveHours} className="px-3.5 py-2 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] dark:text-zinc-950 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 cursor-pointer">
                <Save className="w-3.5 h-3.5" /> Save Hours
              </button>
            </div>

            <div className="space-y-2.5">
              {hours.map((h, idx) => (
                <div key={h.day_of_week} className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-md border border-gray-200 dark:border-zinc-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="capitalize font-bold text-xs text-gray-900 dark:text-white w-24">{h.day_of_week}</span>
                  
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-gray-700 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={h.is_closed}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setHours(prev => prev.map((item, i) => i === idx ? { ...item, is_closed: val } : item));
                        }}
                        className="rounded border-gray-300 dark:border-zinc-700 text-[#003E83] focus:ring-[#003E83]"
                      />
                      <span>Closed</span>
                    </label>

                    {!h.is_closed && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={h.open_time || '08:00'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setHours(prev => prev.map((item, i) => i === idx ? { ...item, open_time: val } : item));
                          }}
                          className="px-2 py-1 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs font-semibold text-gray-900 dark:text-white"
                        />
                        <span className="text-xs text-gray-400">to</span>
                        <input
                          type="time"
                          value={h.close_time || '20:00'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setHours(prev => prev.map((item, i) => i === idx ? { ...item, close_time: val } : item));
                          }}
                          className="px-2 py-1 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs font-semibold text-gray-900 dark:text-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <form onSubmit={handleAddImage} className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-4 transition-colors shadow-xs">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-zinc-800 pb-2">
                Add Photo to Gallery
              </h4>

              {/* Photo URL / Drag-and-Drop Photo Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block">
                    Photo URL / Photo Upload <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-gray-400 dark:text-zinc-500">Paste URL, copy link, or drop picture</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Paste image URL (https...) or drop picture below"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
                    />
                    {imageInput && (
                      <button
                        type="button"
                        onClick={handleCopyUrl}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-[#003E83] dark:hover:text-[#60a5fa] rounded transition-colors cursor-pointer"
                        title="Copy Photo URL"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#003E83] dark:text-[#60a5fa]" />
                    <span>Browse Picture</span>
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={galleryFileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Drag & Drop Box / Live Preview Container */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`p-4 rounded-md border-2 border-dashed transition-all ${
                    isDragging
                      ? 'border-[#003E83] bg-blue-50/50 dark:border-[#60a5fa] dark:bg-blue-950/20'
                      : 'border-gray-200 dark:border-zinc-700/80 bg-gray-50/50 dark:bg-zinc-800/40'
                  }`}
                >
                  {imageInput ? (
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="w-24 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shrink-0">
                        <img
                          src={imageInput}
                          alt="Gallery item preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          Photo Active
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">
                          {imageInput.startsWith('data:') ? 'Local uploaded picture file' : imageInput}
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-3 pt-0.5">
                          <button
                            type="button"
                            onClick={handleCopyUrl}
                            className="text-[11px] font-semibold text-[#003E83] dark:text-[#60a5fa] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>{copied ? 'Copied URL!' : 'Copy Photo URL'}</span>
                          </button>
                          <span className="text-gray-300 dark:text-zinc-700">•</span>
                          <button
                            type="button"
                            onClick={() => setImageInput('')}
                            className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove Photo</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="text-center py-2 space-y-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-6 h-6 text-gray-400 dark:text-zinc-500 mx-auto" />
                      <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        Drag & drop picture here, or <span className="text-[#003E83] dark:text-[#60a5fa] underline font-bold">browse file</span>
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500">
                        Supports PNG, JPG, JPEG, WEBP files
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button type="submit" disabled={!imageInput} className="px-4 py-2 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] dark:text-zinc-950 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload to Gallery</span>
                </button>
              </div>
            </form>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-3 transition-colors">
              <h4 className="text-base font-bold text-gray-900 dark:text-white">Gallery Photos ({gallery.length})</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {gallery.map((g) => (
                  <div key={g.id} className="relative aspect-square rounded-md overflow-hidden group bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                    <img src={g.image_url} alt="Gallery item" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleDeleteImage(g.id)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROMOTIONS TAB */}
        {activeTab === 'promotions' && (
          <div className="space-y-6">
            <form onSubmit={handleAddPromotion} className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-3 transition-colors">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Create Promotion</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Title (e.g. 20% Khmer New Year Discount)"
                  value={newPromo.title}
                  onChange={(e) => setNewPromo(prev => ({ ...prev, title: e.target.value }))}
                  className="px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Discount % (e.g. 20)"
                  value={newPromo.discount_percentage}
                  onChange={(e) => setNewPromo(prev => ({ ...prev, discount_percentage: e.target.value }))}
                  className="px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Terms & details..."
                value={newPromo.description}
                onChange={(e) => setNewPromo(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
              />
              <button type="submit" className="px-3.5 py-2 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] dark:text-zinc-950 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer">
                Save Promotion
              </button>
            </form>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-3 transition-colors">
              <h4 className="text-base font-bold text-gray-900 dark:text-white">Active Promotions ({promotions.length})</h4>
              {promotions.map((p) => (
                <div key={p.id} className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-md border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-xs text-gray-900 dark:text-white">{p.title}</h5>
                    {p.description && <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">{p.description}</p>}
                  </div>
                  <button onClick={() => handleDeletePromotion(p.id)} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <form onSubmit={handleAddEvent} className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-3 transition-colors">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Create Event</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Event Title (e.g. Weekend BBQ Night)"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
                  required
                />
                <input
                  type="date"
                  value={newEvent.start_date}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, start_date: e.target.value }))}
                  className="px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Event description..."
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
              />
              <button type="submit" className="px-3.5 py-2 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] dark:text-zinc-950 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer">
                Schedule Event
              </button>
            </form>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-3 transition-colors">
              <h4 className="text-base font-bold text-gray-900 dark:text-white">Business Events ({events.length})</h4>
              {events.map((e) => (
                <div key={e.id} className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-md border border-gray-200 dark:border-zinc-700/60 space-y-1">
                  <h5 className="font-bold text-xs text-gray-900 dark:text-white">{e.title}</h5>
                  {e.description && <p className="text-[11px] text-gray-500 dark:text-zinc-400">{e.description}</p>}
                  <span className="text-[10px] text-gray-400 font-medium block">{e.start_date}</span>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">Customer Reservations ({bookings.length})</h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400">Incoming booking requests and confirmed reservations for this business.</p>
              </div>
              <button
                onClick={fetchBusinessData}
                className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 text-xs font-semibold rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Refresh
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CalendarCheck className="w-10 h-10 text-gray-300 dark:text-zinc-700 mx-auto" />
                <h5 className="font-bold text-sm text-gray-800 dark:text-zinc-200">No Bookings Received Yet</h5>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  When travelers book your services or make reservations, they will appear here for you to accept or decline.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => {
                  const isPending = b.status === 'pending';
                  const isConfirmed = b.status === 'confirmed';
                  const isProcessing = actionLoadingId === b.id;

                  return (
                    <div
                      key={b.id}
                      className={`p-4 rounded-lg border text-xs space-y-3 transition-colors ${
                        isPending
                          ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-300 dark:border-amber-800/60'
                          : 'bg-gray-50 dark:bg-zinc-800/60 border-gray-200 dark:border-zinc-700/60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 dark:border-zinc-700/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">{b.customer_name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : b.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : b.status === 'cancelled'
                              ? 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300'
                              : b.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                          }`}>
                            {b.status}
                          </span>
                        </div>

                        <span className="font-mono text-gray-500 font-semibold text-[11px]">#{b.booking_reference}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[11px]">Service</span>
                          <span className="font-semibold text-gray-900 dark:text-white truncate block">{b.service?.name || 'General Visit'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px]">Date & Time</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{b.booking_date} {b.booking_time ? `@ ${b.booking_time}` : ''}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px]">Party Size</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{b.number_of_guests} guest(s)</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px]">Amount</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {b.total_price > 0 ? `$${Number(b.total_price).toFixed(2)}` : 'Table / Unpriced'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-zinc-400">
                        {b.customer_phone && (
                          <a href={`tel:${b.customer_phone}`} className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{b.customer_phone}</span>
                          </a>
                        )}
                        {b.customer_email && (
                          <a href={`mailto:${b.customer_email}`} className="flex items-center gap-1 hover:underline">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{b.customer_email}</span>
                          </a>
                        )}
                      </div>

                      {b.special_requests && (
                        <p className="text-[11px] text-gray-600 dark:text-zinc-300 bg-white/80 dark:bg-zinc-900/80 p-2 rounded border border-gray-200 dark:border-zinc-700">
                          <span className="font-semibold">Special Request:</span> {b.special_requests}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200/50 dark:border-zinc-700/50">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleConfirmBooking(b.id)}
                              disabled={isProcessing}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                            >
                              Confirm Request
                            </button>
                            <button
                              onClick={() => handleRejectBooking(b.id)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-md transition-colors cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {isConfirmed && (
                          <button
                            onClick={() => handleCompleteBooking(b.id)}
                            disabled={isProcessing}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* REVIEWS & REPLIES TAB */}
        {activeTab === 'reviews' && (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-4 transition-colors">
            <h4 className="text-base font-bold text-gray-900 dark:text-white">Customer Feedback & Replies ({reviews.length})</h4>
            {reviews.length === 0 ? (
              <p className="text-xs text-gray-500 py-4">No reviews submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 rounded-md bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-900 dark:text-white">{r.user?.name || 'Tourist'}</span>
                      <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-gray-200 dark:border-zinc-700 text-xs font-bold text-amber-500">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{r.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-zinc-300">{r.comment}</p>

                    {/* Existing Replies */}
                    {r.replies && r.replies.map((reply) => (
                      <div key={reply.id} className="p-2.5 bg-white dark:bg-zinc-800 border-l-2 border-[#003E83] dark:border-[#60a5fa] rounded-r-md text-xs space-y-1">
                        <span className="font-bold text-[#003E83] dark:text-[#60a5fa]">Your Reply:</span>
                        <p className="text-gray-700 dark:text-zinc-300">{reply.reply}</p>
                      </div>
                    ))}

                    {/* Reply Form */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Type an official owner response..."
                        value={replyText[r.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [r.id]: e.target.value })}
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#003E83]"
                      />
                      <button
                        onClick={() => handleReplySubmit(r.id)}
                        className="px-3.5 py-1.5 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] dark:text-zinc-950 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
