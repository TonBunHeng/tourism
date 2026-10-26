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
import guideService from '../../services/guideService';
import provinceService from '../../services/provinceService';
import categoryService from '../../services/categoryService';
import { useAlert } from '../../context/AlertContext';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function GuidePlaceForm() {
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
    description: '',
    opening_hours: '',
    entrance_fee: '',
    phone: '',
    website: '',
    cover_image_url: '',
  });

  useEffect(() => {
    const fetchMetadata = async () => {
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
    fetchMetadata();

    if (isEdit) {
      const fetchPlace = async () => {
        try {
          const res = await guideService.getPlace(id);
          const data = res?.data || res;
          if (data) {
            setFormData({
              name: data.name || '',
              category_id: data.category_id || '',
              province_id: data.province_id || '',
              address: data.address || '',
              latitude: data.latitude || '',
              longitude: data.longitude || '',
              description: data.description || '',
              opening_hours: data.opening_hours || '',
              entrance_fee: data.entrance_fee || '',
              phone: data.phone || '',
              website: data.website || '',
              cover_image_url: data.cover_image_url || '',
            });
          }
        } catch (err) {
          showAlert({ title: 'Error', message: err?.message || 'Failed to load place.', type: 'danger' });
          navigate('/guide/places');
        } finally {
          setFetching(false);
        }
      };
      fetchPlace();
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
      if (isEdit) {
        await guideService.updatePlace(id, formData);
        showAlert({ title: 'Success', message: 'Destination updated successfully.', type: 'success' });
      } else {
        await guideService.createPlace(formData);
        showAlert({ title: 'Success', message: 'Destination created successfully.', type: 'success' });
      }
      navigate('/guide/places');
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message || 'Failed to save place.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#003E83] dark:text-[#60a5fa] animate-spin" />
        <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Loading destination data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Guide Portal', to: '/guide/dashboard' },
          { label: 'Destinations', to: '/guide/places' },
          { label: isEdit ? 'Edit Destination' : 'Add New Destination' }
        ]}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {isEdit ? 'Edit Destination Guide' : 'Add New Destination Guide'}
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Curate heritage sites, temple descriptions, visitor opening hours, and entrance fee details.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-6 shadow-xs transition-colors">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-zinc-800 pb-2">
            Destination Details
          </h3>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">
              Destination Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Banteay Srei Temple"
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">Category <span className="text-rose-500">*</span></label>
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
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">Province <span className="text-rose-500">*</span></label>
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
            <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">Address & Location</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="District, Sangkat, Province location info"
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">Opening Hours</label>
              <input
                type="text"
                name="opening_hours"
                value={formData.opening_hours}
                onChange={handleChange}
                placeholder="e.g. 07:30 AM - 05:30 PM"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">Entrance Fee</label>
              <input
                type="text"
                name="entrance_fee"
                value={formData.entrance_fee}
                onChange={handleChange}
                placeholder="e.g. Included in Angkor Pass / Free Entrance"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
              />
            </div>
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
              className={`p-4 rounded-md border-2 border-dashed transition-all ${
                isDragging
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
            <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">Description & Heritage Story</label>
            <textarea
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Historical background, architecture notes, visitor guidelines..."
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-end gap-3">
          <Link
            to="/guide/places"
            className="px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 text-xs font-semibold rounded-md transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] dark:text-zinc-950 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isEdit ? 'Update Destination' : 'Create Destination'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
