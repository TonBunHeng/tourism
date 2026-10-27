import { useState, useEffect } from 'react';
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
  Plus
} from 'lucide-react';
import businessOwnerService from '../../services/businessOwnerService';
import travelService from '../../services/travelService';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';

export default function BusinessProfile() {
  const { selectedBusiness } = useOutletContext();
  const { showSuccess, showError, showConfirm } = useAlert();

  const [activeBusinessId, setActiveBusinessId] = useState(selectedBusiness?.id || null);
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    // Load categories and provinces
    Promise.allSettled([travelService.getCategories(), travelService.getProvinces()]).then(([catRes, provRes]) => {
      if (catRes.status === 'fulfilled' && catRes.value?.success) {
        setCategories(catRes.value.data?.categories || catRes.value.data || []);
      }
      if (provRes.status === 'fulfilled' && provRes.value?.success) {
        setProvinces(provRes.value.data?.provinces || provRes.value.data || []);
      }
    });
  }, []);

  const loadBusinessDetails = (bizId) => {
    if (!bizId) return;
    setIsLoading(true);
    businessOwnerService.getBusiness(bizId)
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
          if (b.images && Array.isArray(b.images)) {
            setImages(b.images);
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load business details:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Load gallery images
    businessOwnerService.getImages(bizId)
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
    e.preventDefault();
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
          loadBusinessDetails(activeBusinessId);
        }
      } else {
        const res = await businessOwnerService.createBusiness(payload);
        if (res?.success) {
          const created = res.data?.business || res.data;
          showSuccess('New business profile created! Application submitted for Ministry verification.', 'Business Created');
          if (created?.id) {
            setActiveBusinessId(created.id);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#003E83] dark:text-blue-400 uppercase tracking-wider mb-1">
            Establishment Profile
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Business Profile & Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Update your business details, operating license information, and showcase photos.
          </p>
        </div>

        {verificationStatus === 'approved' ? (
          <Badge variant="success" size="md">
            <CheckCircle2 size={13} /> Verified & Approved
          </Badge>
        ) : (
          <Badge variant="warning" size="md">
            <Clock size={13} /> Status: {verificationStatus || 'Pending Admin Review'}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner text="Retrieving business profile..." />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Core Information Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Store size={18} className="text-[#003E83] dark:text-blue-400" />
              <span>General Information</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Business / Establishment Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Angkor Heritage Boutique Hotel & Restaurant"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Tourism Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Province / City
                </label>
                <select
                  value={provinceId}
                  onChange={(e) => setProvinceId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Full Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Street 08, Krong Siem Reap, Cambodia"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Business Description & Facilities
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your tourism offerings, dining specialties, hotel amenities, or excursion packages..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Phone size={18} className="text-[#003E83] dark:text-blue-400" />
              <span>Contact & Booking Inquiries</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Public Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+855 63 963 888"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Inquiry Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bookings@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Official Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Photo Gallery Management */}
          {activeBusinessId && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Camera size={18} className="text-[#003E83] dark:text-blue-400" />
                    <span>Business Photo Showcase</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    High quality photos improve customer booking confidence.
                  </p>
                </div>

                <label className="px-4 py-2 rounded-xl bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
                  <Plus size={15} />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {images.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-xs text-slate-400">
                  No photos uploaded to this profile yet. Upload restaurant dishes, room photos, or excursions.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="group relative h-32 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700"
                    >
                      <img
                        src={img.image_url || img.url || img.image}
                        alt="Business Gallery"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-white transition opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete photo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Save Action */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 rounded-xl bg-[#003E83] hover:bg-[#002e62] disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>Save Business Profile</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
