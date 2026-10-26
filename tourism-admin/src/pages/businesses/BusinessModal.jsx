import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Building2, Check, Plus, Upload, Image as ImageIcon,
  MapPin, Phone, Mail, Globe, Navigation, DollarSign,
  User, FileText, AlertCircle, X as XIcon
} from 'lucide-react';
import { uploadService } from '../../services/uploadService';
import { categoryService } from '../../services/categoryService';
import { validateImageFile } from '../../utils/fileValidation';

const PROVINCES = [
  'Siem Reap',
  'Phnom Penh',
  'Banteay Meanchey',
  'Battambang',
  'Kampong Cham',
  'Kampong Chhnang',
  'Kampong Speu',
  'Kampong Thom',
  'Kampot',
  'Kandal',
  'Kep',
  'Koh Kong',
  'Kratie',
  'Mondulkiri',
  'Oddar Meanchey',
  'Pailin',
  'Preah Sihanouk',
  'Preah Vihear',
  'Prey Veng',
  'Pursat',
  'Ratanakiri',
  'Stung Treng',
  'Svay Rieng',
  'Takeo',
  'Tboung Khmum'
];

const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Hospitality & Hotels' },
  { id: '2', name: 'Tour & Travel Agency' },
  { id: '3', name: 'Dining' },
  { id: '4', name: 'Resort & Hotel' },
  { id: '5', name: 'Adventure & Tour' },
  { id: '6', name: 'Transport & Logistics' },
  { id: '7', name: 'Souvenir & Handicrafts' },
  { id: '8', name: 'Temple' },
  { id: '9', name: 'Historical Site' },
  { id: '10', name: 'Nature' },
  { id: '11', name: 'Museum' },
  { id: '12', name: 'Palace' }
];

const PRICE_TIERS = [
  { value: '$', label: '$ Budget' },
  { value: '$$', label: '$$ Moderate' },
  { value: '$$$', label: '$$$ Luxury' },
  { value: '$$$$', label: '$$$$ Premium' }
];

export default function BusinessModal({
  isOpen,
  onClose,
  editingBusiness = null,
  onSubmit
}) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    category_id: '1',
    category_name: 'Hospitality & Hotels',
    province: 'Siem Reap',
    price_tier: '$$',
    image: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    latitude: '',
    longitude: '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    license_number: '',
    verification_status: 'pending'
  });

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [errors, setErrors] = useState({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [fileValidationError, setFileValidationError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Load categories from API if available
  useEffect(() => {
    categoryService.getCategories({ all: true })
      .then(res => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const merged = [...res.data];
          DEFAULT_CATEGORIES.forEach(dc => {
            if (!merged.some(c => c.name.toLowerCase() === dc.name.toLowerCase())) {
              merged.push(dc);
            }
          });
          setCategories(merged);
        }
      })
      .catch(() => {});
  }, []);

  // Handle ESC key and prevent body scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose?.();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  // Sync editing data
  useEffect(() => {
    if (editingBusiness) {
      const existingImg =
        editingBusiness.image ||
        editingBusiness.image_url ||
        editingBusiness.cover_image ||
        editingBusiness.photo ||
        editingBusiness.thumbnail ||
        editingBusiness.logo ||
        (Array.isArray(editingBusiness.images) ? editingBusiness.images[0] : '') ||
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800';

      setFormData({
        name: editingBusiness.name || '',
        category_id: String(editingBusiness.category?.id || editingBusiness.category_id || '1'),
        category_name: editingBusiness.category?.name || editingBusiness.category_name || editingBusiness.category || 'Hospitality & Hotels',
        province: editingBusiness.province?.name || editingBusiness.province || 'Siem Reap',
        price_tier: editingBusiness.price_tier || editingBusiness.price || '$$',
        image: existingImg,
        description: editingBusiness.description || '',
        address: editingBusiness.address || '',
        phone: editingBusiness.phone || editingBusiness.owner?.phone || editingBusiness.owner_phone || '',
        email: editingBusiness.email || editingBusiness.owner?.email || editingBusiness.owner_email || '',
        website: editingBusiness.website || '',
        latitude: editingBusiness.latitude || editingBusiness.lat || '',
        longitude: editingBusiness.longitude || editingBusiness.lng || '',
        owner_name: editingBusiness.owner?.name || editingBusiness.owner_name || '',
        owner_email: editingBusiness.owner?.email || editingBusiness.owner_email || '',
        owner_phone: editingBusiness.owner?.phone || editingBusiness.owner_phone || '',
        license_number: editingBusiness.license_number || editingBusiness.tax_id || '',
        verification_status: editingBusiness.verification_status || editingBusiness.status || 'pending'
      });
    } else {
      setFormData({
        name: '',
        category_id: '1',
        category_name: 'Hospitality & Hotels',
        province: 'Siem Reap',
        price_tier: '$$',
        image: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        latitude: '',
        longitude: '',
        owner_name: '',
        owner_email: '',
        owner_phone: '',
        license_number: '',
        verification_status: 'pending'
      });
    }
    setErrors({});
    setFileValidationError('');
  }, [editingBusiness, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const processImageFile = async (file) => {
    if (!file) return;

    setFileValidationError('');
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setFileValidationError(validation.error);
      return;
    }

    setIsUploadingImage(true);
    try {
      // Immediate local preview
      const reader = new FileReader();
      reader.onload = (event) => {
        handleChange('image', event.target.result);
      };
      reader.readAsDataURL(file);

      // Backend upload
      const res = await uploadService.uploadFile(file, 'businesses');
      if (res?.success && res.data?.url) {
        handleChange('image', res.data.url);
      }
    } catch (err) {
      console.warn('Business image upload fallback to local preview:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImageFile(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processImageFile(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Business name is required';
    if (!formData.owner_name.trim()) newErrors.owner_name = 'Owner name is required';
    if (!formData.owner_email.trim()) newErrors.owner_email = 'Owner email is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-modal-overlay)] backdrop-blur-xs p-4 animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] rounded-md max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-alert-popup"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#003E83]/10 dark:bg-blue-500/10 flex items-center justify-center text-[#003E83] dark:text-blue-400 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                {editingBusiness ? 'Edit Business Profile' : 'Add New Business Profile'}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                {editingBusiness ? `Updating record #${editingBusiness.id}` : 'Register a commercial business entity in AngkorVerses'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">

            {fileValidationError && (
              <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-700 dark:text-red-400 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fileValidationError}</span>
              </div>
            )}

            {/* SECTION 1: BASIC BUSINESS INFO */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/50 pb-2">
                <Building2 size={14} className="text-[#003E83] dark:text-blue-400" />
                <span>Basic Business Info</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Business Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g. Angkor Boutique Hotel & Spa"
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-xs sm:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                  />
                  {errors.name && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.name}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category_name}
                    onChange={(e) => {
                      const cat = categories.find(c => c.name === e.target.value);
                      handleChange('category_name', e.target.value);
                      if (cat) handleChange('category_id', String(cat.id));
                    }}
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-xs sm:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Province */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Province <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => handleChange('province', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-xs sm:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all cursor-pointer"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Price Tier */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Price Tier
                  </label>
                  <select
                    value={formData.price_tier}
                    onChange={(e) => handleChange('price_tier', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-xs sm:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all cursor-pointer"
                  >
                    {PRICE_TIERS.map((tier) => (
                      <option key={tier.value} value={tier.value}>{tier.label}</option>
                    ))}
                  </select>
                </div>

                {/* Cover Image URL & Upload */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                      Cover Image URL / Photo Upload
                    </label>
                    <span className="text-[10px] text-[var(--color-text-muted-light)]">
                      Paste URL, copy link, or drop picture
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => handleChange('image', e.target.value)}
                        placeholder="Paste image URL (https://...) or drop picture below"
                        className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-xs sm:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="px-3.5 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] text-xs font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                    >
                      <Upload size={14} className={isUploadingImage ? 'animate-spin' : ''} />
                      <span>{isUploadingImage ? 'Uploading...' : 'Browse Picture'}</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </div>

                  {fileValidationError && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1.5">{fileValidationError}</p>
                  )}

                  {/* Image Preview or Drop Zone */}
                  {formData.image ? (
                    <div className="mt-3 relative w-full h-44 rounded-md overflow-hidden border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] shadow-xs group">
                      <img
                        src={formData.image}
                        alt="Cover Preview"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-between p-3">
                        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
                          <ImageIcon size={13} className="text-emerald-400" />
                          <span>Photo Attached</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-md bg-white/95 hover:bg-white text-gray-900 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          >
                            Change Photo
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChange('image', '')}
                            className="p-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer"
                            title="Remove picture"
                          >
                            <XIcon size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={`mt-2.5 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer transition-all ${
                        isDragging
                          ? 'border-[#003E83] bg-blue-50/50 dark:bg-blue-950/20'
                          : 'border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-surface-hover-light)]/40 dark:bg-[var(--color-surface-hover-dark)]/20 hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/40'
                      }`}
                    >
                      <ImageIcon className="w-8 h-8 text-[var(--color-text-muted-light)] mb-1.5" />
                      <p className="text-xs font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                        Drag & drop picture here, or <span className="text-[#003E83] dark:text-blue-400 underline">browse file</span>
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted-light)] mt-0.5">Supports PNG, JPG, JPEG, WEBP files</p>
                    </div>
                  )}
                </div>

                {/* Description & Story */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Description & Story
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe your hospitality services, atmosphere, and amenities..."
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-xs sm:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: CONTACT & LOCATION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/50 pb-2">
                <MapPin size={14} className="text-[#003E83] dark:text-blue-400" />
                <span>Contact & Location</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Full Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Street address, Village, Sangkat..."
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-xs sm:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+855 12 345 678"
                      className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-xs sm:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="contact@business.com"
                      className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-xs sm:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                    />
                  </div>
                </div>

                {/* Website */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="https://business.com"
                      className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-xs sm:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                    />
                  </div>
                </div>

                {/* Coordinates */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Latitude (Optional)
                  </label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.latitude}
                      onChange={(e) => handleChange('latitude', e.target.value)}
                      placeholder="13.3633"
                      className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-xs sm:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Longitude (Optional)
                  </label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.longitude}
                      onChange={(e) => handleChange('longitude', e.target.value)}
                      placeholder="103.8564"
                      className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-xs sm:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: OWNER & ADMINISTRATIVE DETAILS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/50 pb-2">
                <User size={14} className="text-[#003E83] dark:text-blue-400" />
                <span>Owner & Administrative Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Owner Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Owner Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.owner_name}
                    onChange={(e) => handleChange('owner_name', e.target.value)}
                    placeholder="e.g. Sok Sovann"
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-xs sm:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                  />
                  {errors.owner_name && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.owner_name}</p>}
                </div>

                {/* Owner Email */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Owner Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.owner_email}
                    onChange={(e) => handleChange('owner_email', e.target.value)}
                    placeholder="e.g. info@angkor-hotel.com"
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-xs sm:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                  />
                  {errors.owner_email && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.owner_email}</p>}
                </div>

                {/* Owner Phone */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Owner Phone Contact
                  </label>
                  <input
                    type="text"
                    value={formData.owner_phone}
                    onChange={(e) => handleChange('owner_phone', e.target.value)}
                    placeholder="e.g. +855 12 884 920"
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-xs sm:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                  />
                </div>

                {/* Commercial License / Tax ID */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Commercial License / Tax ID
                  </label>
                  <input
                    type="text"
                    value={formData.license_number}
                    onChange={(e) => handleChange('license_number', e.target.value)}
                    placeholder="e.g. MOT-2024-REG"
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-xs sm:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                  />
                </div>

                {/* Verification Status */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                    Verification Status
                  </label>
                  <select
                    value={formData.verification_status}
                    onChange={(e) => handleChange('verification_status', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-xs sm:text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all cursor-pointer capitalize"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="suspended">Suspended</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-[var(--color-surface-hover-light)]/40 dark:bg-[var(--color-surface-hover-dark)]/20 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] font-medium text-sm transition-colors text-center cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData?.name?.trim() || isUploadingImage}
              className="flex-1 py-2.5 px-4 rounded-md bg-[#003E83] hover:bg-[#002e62] active:scale-[0.98] text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              {editingBusiness ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Update Profile</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Business</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
