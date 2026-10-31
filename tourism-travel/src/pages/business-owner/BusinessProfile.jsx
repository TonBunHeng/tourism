import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Store,
  Phone,
  Camera,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  MapPin,
  Globe,
  Mail,
  ShieldCheck,
  Building2,
  Info,
  Check
} from 'lucide-react';
import businessOwnerService from '../../services/businessOwnerService';
import travelService from '../../services/travelService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function BusinessProfile() {
  const { selectedBusiness, refreshBusinesses } = useOutletContext();
  const { showSuccess, showError, showConfirm } = useAlert();

  const [activeBusinessId, setActiveBusinessId] = useState(selectedBusiness?.id || null);
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('pending');

  useEffect(() => {
    Promise.allSettled([travelService.getCategories(), travelService.getProvinces()]).then(
      ([catRes, provRes]) => {
        if (catRes.status === 'fulfilled' && catRes.value?.success) {
          setCategories(catRes.value.data?.categories || catRes.value.data || []);
        }
        if (provRes.status === 'fulfilled' && provRes.value?.success) {
          setProvinces(provRes.value.data?.provinces || provRes.value.data || []);
        }
      }
    );
  }, []);

  const loadBusinessDetails = (bizId) => {
    if (!bizId) return;
    setIsLoading(true);
    businessOwnerService
      .getBusiness(bizId)
      .then((res) => {
        if (res?.success) {
          const b = res.data?.business || res.data;
          setName(b.name || '');
          setCategoryId(b.category_id || b.category?.id || '');
          setProvinceId(b.province_id || b.province?.id || '');
          setDescription(b.description || '');
          setAddress(b.address || '');
          setPhone(b.phone || '');
          setEmail(b.email || '');
          setWebsite(b.website || '');
          setVerificationStatus(b.verification_status || 'pending');
        }
      })
      .catch((err) => {
        console.warn('Failed to load business details:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    businessOwnerService
      .getImages(bizId)
      .then((res) => {
        if (res?.success) {
          const list = res.data?.images || res.data || [];
          setImages(Array.isArray(list) ? list : []);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (selectedBusiness?.id) {
      setActiveBusinessId(selectedBusiness.id);
      loadBusinessDetails(selectedBusiness.id);
    }
  }, [selectedBusiness?.id]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      showError('Please enter a business name.');
      return;
    }

    setIsSaving(true);
    const payload = {
      name: name.trim(),
      category_id: categoryId || undefined,
      province_id: provinceId || undefined,
      description: description.trim() || undefined,
      address: address.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
    };

    try {
      if (activeBusinessId) {
        const res = await businessOwnerService.updateBusiness(activeBusinessId, payload);
        if (res?.success) {
          showSuccess('Business profile details updated successfully.');
          await refreshBusinesses?.(activeBusinessId);
          loadBusinessDetails(activeBusinessId);
        }
      } else {
        const res = await businessOwnerService.createBusiness(payload);
        if (res?.success) {
          const created = res.data?.business || res.data;
          showSuccess(
            'New business profile created! Application submitted for Ministry verification.',
            'Business Created'
          );
          if (created?.id) {
            setActiveBusinessId(created.id);
            await refreshBusinesses?.(created.id);
            loadBusinessDetails(created.id);
          }
        }
      }
    } catch (err) {
      showError(err.message || 'Failed to save business profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeBusinessId) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('Photo must be less than 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setIsUploadingImage(true);
    try {
      const res = await businessOwnerService.uploadImage(activeBusinessId, formData);
      if (res?.success) {
        showSuccess('Photo uploaded to gallery.');
        businessOwnerService.getImages(activeBusinessId).then((r) => {
          if (r?.success) setImages(r.data?.images || r.data || []);
        });
      }
    } catch (err) {
      showError(err.message || 'Failed to upload photo.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (imageId) => {
    const confirmed = await showConfirm({
      title: 'Delete Photo',
      message: 'Delete this photo from your business gallery?',
      confirmText: 'Delete',
      type: 'danger',
    });
    if (!confirmed) return;

    try {
      const res = await businessOwnerService.deleteImage(activeBusinessId, imageId);
      if (res?.success) {
        showSuccess('Photo removed.');
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      }
    } catch (err) {
      showError(err.message || 'Failed to delete image.');
    }
  };

  // Find Category and Province Names for KPI cards
  const selectedCategoryName = useMemo(() => {
    const c = categories.find((item) => String(item.id) === String(categoryId));
    return c?.name || selectedBusiness?.category?.name || 'Hospitality & Tourism';
  }, [categories, categoryId, selectedBusiness]);

  const selectedProvinceName = useMemo(() => {
    const p = provinces.find((item) => String(item.id) === String(provinceId));
    return p?.name || selectedBusiness?.province?.name || 'Cambodia';
  }, [provinces, provinceId, selectedBusiness]);

  // 4 KPI Stats
  const statsList = [
    {
      title: 'Verification Status',
      value: verificationStatus === 'approved' ? 'Verified & Active' : 'Pending Review',
      subtext: verificationStatus === 'approved' ? 'Official accreditation' : 'Ministry audit underway',
      icon: ShieldCheck,
      color:
        verificationStatus === 'approved'
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-amber-600 dark:text-amber-400',
      bg:
        verificationStatus === 'approved'
          ? 'bg-emerald-50 dark:bg-emerald-950/40'
          : 'bg-amber-50 dark:bg-amber-950/40',
    },
    {
      title: 'Industry Category',
      value: selectedCategoryName,
      subtext: 'Commercial classification',
      icon: Store,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      title: 'Operating Region',
      value: selectedProvinceName,
      subtext: 'Geographic location',
      icon: MapPin,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
    },
    {
      title: 'Media Showcase',
      value: `${images.length} ${images.length === 1 ? 'Photo' : 'Photos'}`,
      subtext: 'High-res commercial gallery',
      icon: Camera,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header Section (matching tourism-admin) */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Business Profile & Verification
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Update commercial establishment information, tourism license details, and gallery photos.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap self-start sm:self-auto">
            {verificationStatus === 'approved' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                <CheckCircle2 size={13} />
                <span>Verified Enterprise</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-xs">
                <Clock size={13} />
                <span>Status: {verificationStatus || 'Pending Review'}</span>
              </span>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-4 py-2 rounded-md bg-[#003E83] hover:bg-[#002e62] disabled:opacity-50 text-white text-xs sm:text-sm font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statsList.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-zinc-900 rounded-md p-4 shadow-xs border border-gray-200 dark:border-zinc-800 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium truncate">
                    {stat.title}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 tracking-tight truncate">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-9 h-9 rounded-md shrink-0 flex items-center justify-center ${stat.bg}`}>
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-2 truncate">
                {stat.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {isLoading ? (
        <div className="p-16 text-center bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800">
          <LoadingSpinner text="Retrieving business profile..." />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Main Details Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card 1: General Establishment Information */}
              <div className="p-5 sm:p-6 rounded-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-zinc-800">
                  <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/50 text-[#003E83] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                      General Establishment Information
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      Primary enterprise identity as shown on public travel itineraries.
                    </p>
                  </div>
                </div>

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
                    className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Tourism Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83] cursor-pointer"
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
                      value={provinceId}
                      onChange={(e) => setProvinceId(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83] cursor-pointer"
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

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Full Physical Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Street 08, Krong Siem Reap, Cambodia"
                    className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Business Description & Offerings
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your tourism offerings, dining specialties, hotel amenities, or excursion packages in detail..."
                    className="w-full px-3 py-2.5 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                  />
                </div>
              </div>

              {/* Card 2: Contact & Communication Channels */}
              <div className="p-5 sm:p-6 rounded-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-zinc-800">
                  <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/50 text-[#003E83] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                      Contact & Booking Inquiries
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      Direct contact points shared with confirmed tourists and emergency operators.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Public Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+855 63 963 888"
                      className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Inquiry Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="bookings@example.com"
                      className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Official Website URL
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#003E83]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Column: Gallery & Verification Guidelines */}
            <div className="lg:col-span-1 space-y-6">
              {/* Card 3: Photo Showcase & Media */}
              <div className="p-5 sm:p-6 rounded-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/50 text-[#003E83] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Media Showcase
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                        {images.length} {images.length === 1 ? 'photo' : 'photos'} uploaded
                      </p>
                    </div>
                  </div>

                  {activeBusinessId && (
                    <label className="px-3 py-1.5 rounded-md bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-xs">
                      {isUploadingImage ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Plus size={13} />
                      )}
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {images.length === 0 ? (
                  <div className="p-8 text-center rounded-md border border-dashed border-gray-200 dark:border-zinc-800 text-xs text-gray-400 dark:text-zinc-500">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-zinc-600" />
                    <p className="font-medium text-gray-600 dark:text-zinc-400">No photos yet</p>
                    <p className="text-[11px] mt-1">Upload restaurant dishes, room interiors, or tour attractions.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {images.map((img) => (
                      <div
                        key={img.id}
                        className="group relative h-24 rounded-md overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700"
                      >
                        <img
                          src={img.image_url || img.url || img.image}
                          alt="Business Gallery"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 hover:bg-rose-600 text-white transition opacity-0 group-hover:opacity-100 cursor-pointer shadow-xs"
                          title="Delete photo"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card 4: Regulatory & Compliance Guidelines */}
              <div className="p-5 rounded-md bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-[#003E83] dark:text-blue-400" />
                  <span>Ministry Verification Standards</span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-zinc-400 leading-relaxed">
                  Cambodia Ministry of Tourism regulations require commercial enterprises to provide active local contact details and an authentic physical address before receiving public search priority.
                </p>
                <div className="pt-2 border-t border-gray-200 dark:border-zinc-700/60 space-y-1.5 text-[11px] text-gray-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-600 shrink-0" />
                    <span>Valid business tax or registration ID</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-600 shrink-0" />
                    <span>Real location in Cambodian province</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-600 shrink-0" />
                    <span>Verified customer contact line</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-md bg-[#003E83] hover:bg-[#002e62] disabled:opacity-50 text-white text-xs sm:text-sm font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>Save Business Profile</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
