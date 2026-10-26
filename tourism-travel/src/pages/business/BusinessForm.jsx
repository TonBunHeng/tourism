import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Save,
  Loader2,
  Upload,
  Copy,
  Check,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import businessService from '../../services/businessService';
import provinceService from '../../services/provinceService';
import categoryService from '../../services/categoryService';
import { useAlert } from '../../context/AlertContext';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function BusinessForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [provinces, setProvinces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    province_id: '',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    website: '',
    price_range: '$$',
    description: '',
    cover_image_url: '',
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          provinceService.getProvinces().catch(() => ({ data: [] })),
          categoryService.getCategories().catch(() => ({ data: [] })),
        ]);
        setProvinces(pRes?.data || pRes || []);
        setCategories(cRes?.data || cRes || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDropdowns();

    if (isEdit) {
      const fetchBusiness = async () => {
        try {
          const [res, galRes, imgRes] = await Promise.all([
            businessService.getOwnerBusiness(id),
            businessService.getBusinessGallery(id).catch(() => ({ data: [] })),
            businessService.getImages(id).catch(() => ({ data: [] })),
          ]);
          const data = res?.data || res;
          const galList = galRes?.data || galRes || [];
          const imgList = imgRes?.data || imgRes || [];

          if (data) {
            const extractUrl = (item) => {
              if (!item) return null;
              if (typeof item === 'string') return item;
              return item.image_url || item.url || item.image || item.photo || null;
            };

            const rawCover =
              data.cover_image_url ||
              data.cover_image ||
              data.image_url ||
              data.image ||
              data.photo_url ||
              data.photo ||
              data.cover ||
              (Array.isArray(data.images) && data.images.length > 0 ? extractUrl(data.images[0]) : null) ||
              (Array.isArray(data.gallery) && data.gallery.length > 0 ? extractUrl(data.gallery[0]) : null) ||
              (Array.isArray(galList) && galList.length > 0 ? extractUrl(galList[0]) : null) ||
              (Array.isArray(imgList) && imgList.length > 0 ? extractUrl(imgList[0]) : null) ||
              'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';

            const formatImageUrl = (url) => {
              if (!url || typeof url !== 'string') return '';
              if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
              const backendOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api.*$/, '');
              const cleanPath = url.startsWith('/') ? url : `/${url}`;
              return `${backendOrigin}${cleanPath}`;
            };

            const resolvedCover = formatImageUrl(rawCover);

            setFormData({
              name: data.name || '',
              category_id: data.category_id || '',
              province_id: data.province_id || '',
              address: data.address || '',
              latitude: data.latitude || '',
              longitude: data.longitude || '',
              phone: data.phone || '',
              email: data.email || '',
              website: data.website || '',
              price_range: data.price_range || '$$',
              description: data.description || '',
              cover_image_url: resolvedCover,
            });
          }
        } catch (err) {
          showAlert({ title: 'Error', message: err?.message || 'Failed to load business data.', type: 'danger' });
          navigate('/business/dashboard');
        } finally {
          setFetching(false);
        }
      };
      fetchBusiness();
    }
  }, [id, isEdit, navigate, showAlert]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCopyUrl = async () => {
    if (!formData.cover_image_url) return;
    try {
      await navigator.clipboard.writeText(formData.cover_image_url);
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
      setFormData(prev => ({ ...prev, cover_image_url: e.target.result }));
      showAlert({ title: 'Photo Loaded', message: 'Cover image uploaded successfully.', type: 'success' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id || !formData.province_id) {
      showAlert({ title: 'Validation Error', message: 'Name, Category, and Province are required.', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        cover_image: formData.cover_image_url,
        cover_image_url: formData.cover_image_url,
        image_url: formData.cover_image_url,
      };

      if (isEdit) {
        await businessService.updateBusiness(id, payload);
        showAlert({ title: 'Success', message: 'Business updated successfully.', type: 'success' });
        navigate(`/business/businesses/${id}`);
      } else {
        const res = await businessService.createBusiness(payload);
        const newId = res?.data?.id || res?.id;
        showAlert({ title: 'Success', message: 'Business created! It is now pending admin verification.', type: 'success' });
        navigate(newId ? `/business/businesses/${newId}` : '/business/dashboard');
      }
    } catch (err) {
      showAlert({ title: 'Operation Failed', message: err?.message || 'Failed to save business profile.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#003E83] dark:text-[#60a5fa] animate-spin" />
        <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Loading business form...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Business Portal', to: '/business/dashboard' },
          { label: 'My Businesses', to: '/business/businesses' },
          { label: isEdit ? 'Edit Business' : 'Register New Business' }
        ]}
      />
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 dark:border-zinc-800 bg-gradient-to-br from-blue-50/60 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-6 sm:p-8 shadow-sm space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {isEdit ? 'Edit Business Profile' : 'Register New Business'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 max-w-xl">
          Submit your hospitality, dining, hotel, or activity listing for tourist discovery and official Ministry verification.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-zinc-800 space-y-6 shadow-xs transition-colors">

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-zinc-800 pb-2">
            Basic Business Info
          </h3>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">
              Business Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Angkor Boutique Hotel & Spa"
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none cursor-pointer"
                required
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">
                Province <span className="text-rose-500">*</span>
              </label>
              <select
                name="province_id"
                value={formData.province_id}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none cursor-pointer"
                required
              >
                <option value="">Select Province</option>
                {provinces.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">
              Price Tier
            </label>
            <select
              name="price_range"
              value={formData.price_range}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none cursor-pointer"
            >
              <option value="$">$ Budget</option>
              <option value="$$">$$ Moderate</option>
              <option value="$$$">$$$ Luxury</option>
              <option value="$$$$">$$$$ Premium</option>
            </select>
          </div>

          {/* Cover Image URL / Drag-and-Drop Photo Upload */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block">
                Cover Image URL / Photo Upload
              </label>
              <span className="text-[11px] text-gray-400 dark:text-zinc-500">Paste URL, copy link, or drop picture</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  name="cover_image_url"
                  value={formData.cover_image_url}
                  onChange={handleChange}
                  placeholder="Paste image URL (https://...) or drop picture below"
                  className="w-full pl-3 pr-9 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
                />
                {formData.cover_image_url && (
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-[#003E83] dark:hover:text-[#60a5fa] rounded transition-colors cursor-pointer"
                    title="Copy Picture URL"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#003E83] dark:text-[#60a5fa]" />
                <span>Browse Picture</span>
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Drag & Drop Box / Live Preview Container */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-4 rounded-md border-2 border-dashed transition-all ${isDragging
                  ? 'border-[#003E83] bg-blue-50/50 dark:border-[#60a5fa] dark:bg-blue-950/20'
                  : 'border-gray-200 dark:border-zinc-700/80 bg-gray-50/50 dark:bg-zinc-800/40'
                }`}
            >
              {formData.cover_image_url ? (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-24 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shrink-0">
                    <img
                      src={formData.cover_image_url}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      Cover Picture Active
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">
                      {formData.cover_image_url.startsWith('data:') ? 'Local uploaded picture file' : formData.cover_image_url}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-3 pt-0.5">
                      <button
                        type="button"
                        onClick={handleCopyUrl}
                        className="text-[11px] font-semibold text-[#003E83] dark:text-[#60a5fa] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied URL!' : 'Copy Picture URL'}</span>
                      </button>
                      <span className="text-gray-300 dark:text-zinc-700">•</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, cover_image_url: '' }))}
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
                  onClick={() => fileInputRef.current?.click()}
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

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">
              Description & Story
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your hospitality services, atmosphere, and amenities..."
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-zinc-800 pb-2">
            Contact & Location
          </h3>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">
              Full Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address, Village, Sangkat..."
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+855 12 345 678"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@business.com"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">Website</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://business.com"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">Latitude (Optional)</label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="13.3633"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">Longitude (Optional)</label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="103.8564"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-end gap-3">
          <Link
            to={isEdit ? `/business/businesses/${id}` : '/business/dashboard'}
            className="px-5 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 text-xs sm:text-sm font-bold rounded-2xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-[#003E83] to-blue-700 hover:from-[#002e62] hover:to-blue-800 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isEdit ? 'Save Changes' : 'Submit Business'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
