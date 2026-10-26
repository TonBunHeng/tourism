import { useState, useRef, useEffect } from 'react';
import { Upload, Trash2, Video, Image as ImageIcon, AlertCircle, Type, Layers, ChevronDown } from 'lucide-react';
import uploadService from '../../services/uploadService';
import { validateImageFile, DANGEROUS_EXTENSIONS } from '../../utils/fileValidation';

export default function GalleryUploadModal({ isOpen, onClose, categories = [], onAddMedia }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories.find(c => c !== 'All') || 'Temple');
  const [fileUrl, setFileUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [dimensions, setDimensions] = useState('1920x1080');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // 1. Extension check
    const fileName = file.name || '';
    const ext = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      setUploadError(`File type .${ext} is blocked for security reasons.`);
      if (e.target) e.target.value = '';
      return;
    }

    // 2. MIME & size validation
    const isVideo = file.type.startsWith('video/');
    if (isVideo) {
      if (file.size > 25 * 1024 * 1024) {
        setUploadError('Video file exceeds maximum limit of 25MB.');
        if (e.target) e.target.value = '';
        return;
      }
      setMediaType('video');
    } else {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setUploadError(validation.error);
        if (e.target) e.target.value = '';
        return;
      }
      setMediaType('image');
    }

    // Local instant preview
    const localUrl = URL.createObjectURL(file);
    setFileUrl(localUrl);
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);

    // Upload to backend project storage
    setIsUploading(true);
    try {
      const res = await uploadService.uploadFile(file, 'gallery');
      if (res.success && res.data?.url) {
        setFileUrl(res.data.url);
        if (res.data.type) setMediaType(res.data.type);
        if (res.data.file_size) setFileSize(res.data.file_size);
        if (res.data.dimensions) setDimensions(res.data.dimensions);
      }
    } catch (err) {
      console.warn('Backend file upload fallback to local preview:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl) return;

    const newMedia = {
      id: Date.now(),
      title,
      category,
      type: mediaType,
      url: fileUrl,
      fileSize,
      dimensions,
      views: 0,
      likes: 0,
      status: 'Published'
    };

    if (onAddMedia) {
      onAddMedia(newMedia);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] rounded-md max-w-lg w-full shadow-2xl border border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] overflow-hidden animate-alert-popup flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#003E83]/10 text-[#003E83] dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center shrink-0">
              {mediaType === 'video' ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                Upload Media (Photo / Video)
              </h3>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                Upload high resolution photos and video files to the gallery
              </p>
            </div>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {uploadError && (
              <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-red-700 dark:text-red-400 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                Media Title *
              </label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter media title or caption"
                  className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                Category *
              </label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="appearance-none w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md pl-9 pr-9 py-2.5 text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all cursor-pointer"
                >
                  {categories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Media Upload Area */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                Upload File (JPG, PNG, WEBP, MP4)
              </label>

              {fileUrl ? (
                <div className="relative w-full h-44 rounded-md overflow-hidden border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-gray-50 dark:bg-zinc-800 flex items-center justify-center group mb-2 shadow-xs">
                  {mediaType === 'video' ? (
                    <video src={fileUrl} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={fileUrl} alt="Preview" className="w-full h-full object-cover" />
                  )}

                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 bg-white/90 dark:bg-zinc-900/90 text-xs font-medium rounded-md border border-gray-200 dark:border-zinc-700 shadow-sm hover:bg-white transition-colors cursor-pointer"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setFileUrl('')}
                      className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50/70 dark:bg-zinc-800/40 rounded-md p-6 text-center hover:border-[#003E83] dark:hover:border-[#003E83] transition-colors cursor-pointer mb-2"
                >
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
                  <p className="text-gray-800 dark:text-zinc-200 font-medium text-xs">
                    {isUploading ? 'Uploading to storage...' : 'Click to select image or video'}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                    Images up to 5MB (JPG, PNG, WEBP), Videos up to 25MB (MP4)
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4"
                className="hidden"
                onChange={handleFileSelect}
              />

              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="Or enter image/video URL (https://...)"
                  className="w-full pl-9 pr-4 py-2 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-xs text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 px-6 py-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-[var(--color-surface-hover-light)]/40 dark:bg-[var(--color-surface-hover-dark)]/20 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] font-medium text-xs sm:text-sm transition-colors text-center cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!title.trim() || !fileUrl || isUploading}
              className="flex-1 py-2.5 px-4 rounded-md bg-[#003E83] hover:bg-[#002e62] active:scale-[0.98] text-white font-medium text-xs sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Uploading Media...' : 'Upload Media'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
