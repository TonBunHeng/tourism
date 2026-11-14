import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Store,
  Plus,
  MapPin,
  Building2,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import travelService from '../../services/travelService';
import businessOwnerService from '../../services/businessOwnerService';
import { useAlert } from '../../context/AlertContext';

export default function ManageBusinessModal({
  isOpen,
  onClose,
  selectedBusiness,
  businesses = [],
  onSelectBusiness,
  refreshBusinesses,
}) {
  const { showSuccess, showError } = useAlert();

  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'manage'
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [address, setAddress] = useState('');
  const [locationUrl, setLocationUrl] = useState(''); // Location (stored as website)
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  // Load Categories and Provinces
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingMetadata(true);

    Promise.allSettled([travelService.getCategories(), travelService.getProvinces()]).then(
      ([catRes, provRes]) => {
        if (!isMounted) return;
        if (catRes.status === 'fulfilled' && catRes.value?.success) {
          setCategories(catRes.value.data?.categories || catRes.value.data || []);
        }
        if (provRes.status === 'fulfilled' && provRes.value?.success) {
          setProvinces(provRes.value.data?.provinces || provRes.value.data || []);
        }
        setIsLoadingMetadata(false);
      }
    );

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setCategoryId('');
      setProvinceId('');
      setAddress('');
      setLocationUrl('');
      setPhone('');
      setEmail('');
      setDescription('');
      setActiveTab('add');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showError('Please provide an establishment name.');
      return;
    }
    if (!categoryId) {
      showError('Please select a tourism industry category.');
      return;
    }
    if (!provinceId) {
      showError('Please select an operating province / city.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      category_id: categoryId,
      province_id: provinceId,
      address: address.trim() || undefined,
      website: locationUrl.trim() || undefined, // Location stored in website field
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      description: description.trim() || undefined,
    };

    try {
      const res = await businessOwnerService.createBusiness(payload);
      if (res?.success) {
        const created = res.data?.business || res.data;
        showSuccess(
          `Business "${created?.name || name}" has been registered and submitted for Ministry verification.`,
          'Business Profile Created'
        );

        if (refreshBusinesses) {
          await refreshBusinesses(created?.id);
        }
        if (onSelectBusiness && created) {
          onSelectBusiness(created);
        }

        onClose();
      } else {
        showError(res?.message || 'Failed to create business profile.');
      }
    } catch (err) {
      showError(err.message || 'An error occurred while creating the business.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-business-modal-title"
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-sm shadow-2xl max-w-2xl w-full p-5 sm:p-7 relative border border-gray-200 dark:border-zinc-800 animate-alert-popup my-auto overflow-hidden text-gray-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-sm text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="w-10 h-10 rounded-sm bg-blue-50 dark:bg-blue-950/50 text-[#003E83] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 id="manage-business-modal-title" className="text-base sm:text-lg font-bold tracking-tight">
              Manage / Add Profile
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Register a new tourism establishment profile or switch between your business enterprises.
            </p>
          </div>
        </div>

        {/* Tab Switcher if businesses exist */}
        {businesses.length > 0 && (
          <div className="flex items-center gap-2 mt-4 p-1 bg-gray-100 dark:bg-zinc-800/80 rounded-sm text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-1.5 rounded-sm transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-white dark:bg-zinc-900 text-[#003E83] dark:text-blue-400 shadow-2xs'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Plus size={14} />
              <span>+ Add New Business</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manage')}
              className={`flex-1 py-1.5 rounded-sm transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'manage'
                  ? 'bg-white dark:bg-zinc-900 text-[#003E83] dark:text-blue-400 shadow-2xs'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Store size={14} />
              <span>Registered Businesses ({businesses.length})</span>
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'add' ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[72vh] overflow-y-auto pr-1">
            {/* Business Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Establishment Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Angkor Heritage Boutique Hotel & Restaurant"
                className="w-full px-3 py-2 rounded-sm border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
              />
            </div>

            {/* Category & Province */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Tourism Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={isLoadingMetadata}
                  className="w-full px-3 py-2 rounded-sm border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83] cursor-pointer disabled:opacity-60"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Operating Province / City <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={provinceId}
                  onChange={(e) => setProvinceId(e.target.value)}
                  disabled={isLoadingMetadata}
                  className="w-full px-3 py-2 rounded-sm border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83] cursor-pointer disabled:opacity-60"
                >
                  <option value="">Select Province</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location (replacing Website URL) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                <MapPin size={13} className="text-[#003E83] dark:text-blue-400" />
                <span>Location</span>
              </label>
              <input
                type="text"
                value={locationUrl}
                onChange={(e) => setLocationUrl(e.target.value)}
                placeholder="e.g. Google Maps link, coordinates, or location link"
                className="w-full px-3 py-2 rounded-sm border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
              />
              <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1">
                Enter your Google Maps place URL, GPS coordinate pin, or location landmark.
              </p>
            </div>

            {/* Full Physical Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Full Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Street 08, Krong Siem Reap, Cambodia"
                className="w-full px-3 py-2 rounded-sm border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
              />
            </div>

            {/* Contact Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Phone size={13} className="text-gray-400" />
                  <span>Public Phone Number</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+855 63 963 888"
                  className="w-full px-3 py-2 rounded-sm border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Mail size={13} className="text-gray-400" />
                  <span>Inquiry Email Address</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bookings@example.com"
                  className="w-full px-3 py-2 rounded-sm border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Business Description & Offerings
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your tourism offerings, hospitality services, dining specialties, or amenities..."
                className="w-full px-3 py-2 rounded-sm border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
              />
            </div>

            {/* Form Actions */}
            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-sm border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs sm:text-sm font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-sm bg-[#003E83] hover:bg-[#002e62] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Submitting Profile...</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    <span>Create Business Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3">
              Select a business to switch your active workspace session:
            </p>
            {businesses.map((biz) => {
              const isSelected = selectedBusiness?.id === biz.id;
              return (
                <div
                  key={biz.id}
                  className={`p-3 rounded-sm border transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60'
                      : 'bg-gray-50/50 dark:bg-zinc-800/40 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm truncate">{biz.name}</span>
                      {biz.verification_status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 size={10} />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock size={10} />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5 truncate">
                      {biz.category?.name || 'Hospitality'} • {biz.province?.name || 'Cambodia'}
                      {biz.address ? ` • ${biz.address}` : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected ? (
                      <span className="px-3 py-1.5 rounded-sm text-xs font-semibold text-[#003E83] dark:text-blue-400 bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-900/60 shadow-2xs">
                        Active
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectBusiness?.(biz);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-sm text-xs font-semibold text-gray-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 transition cursor-pointer"
                      >
                        Switch
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

