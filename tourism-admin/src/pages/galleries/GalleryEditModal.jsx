import { useState, useEffect } from 'react';
import { X, ChevronDown, Upload, Trash2, Loader2 } from 'lucide-react';
import uploadService from '../../services/uploadService';

export default function GalleryEditModal({
  isOpen,
  editingMedia,
  onEditingMediaChange,
  onClose,
  onSubmit,
  categories = []
}) {
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen && editingMedia) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, editingMedia, onClose]);

  if (!isOpen || !editingMedia) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const localUrl = URL.createObjectURL(file);
    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    onEditingMediaChange({
      ...editingMedia,
      url: localUrl,
      type: isVideo ? 'video' : 'image',
      size: sizeStr
    });

    setIsUploading(true);
    try {
      const res = await uploadService.uploadFile(file, 'gallery');
      if (res.success && res.data?.url) {
        onEditingMediaChange({
          ...editingMedia,
          url: res.data.url,
          type: res.data.type || (isVideo ? 'video' : 'image'),
          size: res.data.file_size || sizeStr,
          dimensions: res.data.dimensions || editingMedia.dimensions || '1920x1080'
        });
      }
    } catch (err) {
      console.warn('Backend file upload fallback:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const categoryOptions = Array.from(
    new Set([
      editingMedia.category,
      ...categories.filter(c => c && c !== 'All')
    ])
  ).filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark-modal)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] rounded-md max-w-lg w-full shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden animate-alert-popup flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">Edit Media</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-all active:scale-90 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">Title</label>
            <input
              type="text"
              value={editingMedia.title}
              onChange={(e) => onEditingMediaChange({ ...editingMedia, title: e.target.value })}
              className="w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md px-4 py-3 text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Picture / Video Upload & Preview Field */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Media File (Picture / Video)</label>

            {editingMedia.url ? (
              <div className="relative w-full h-44 rounded-md overflow-hidden border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] group shadow-sm">
                {editingMedia.type === 'video' ? (
                  <video src={editingMedia.url} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={editingMedia.url} alt={editingMedia.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="p-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-md transition-colors">
                    <Upload className="w-4 h-4" />
                    Change Media
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
                  </label>
                  <button
                    type="button"
                    onClick={() => onEditingMediaChange({ ...editingMedia, url: '' })}
                    className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium flex items-center gap-1 cursor-pointer shadow-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 rounded-md p-6 text-center hover:border-[var(--color-primary)] transition-colors cursor-pointer block">
                <Upload className="w-8 h-8 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mx-auto mb-2" />
                <p className="text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] font-medium text-xs">Drop picture/video here or click to upload</p>
                <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}

            <input
              type="url"
              value={editingMedia.url}
              onChange={(e) => onEditingMediaChange({ ...editingMedia, url: e.target.value })}
              placeholder="Or enter media URL (https://...)"
              className="w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md px-4 py-2.5 text-xs text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] placeholder-[var(--color-text-muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">Media Type</label>
              <div className="relative">
                <select
                  value={editingMedia.type || 'image'}
                  onChange={(e) => onEditingMediaChange({ ...editingMedia, type: e.target.value })}
                  className="appearance-none w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md px-4 py-3 text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent cursor-pointer"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">Category</label>
              <div className="relative">
                <select
                  value={editingMedia.category}
                  onChange={(e) => onEditingMediaChange({ ...editingMedia, category: e.target.value })}
                  className="appearance-none w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md px-4 py-3 text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent cursor-pointer"
                >
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">Status</label>
            <div className="relative">
              <select
                value={editingMedia.status || 'Published'}
                onChange={(e) => onEditingMediaChange({ ...editingMedia, status: e.target.value })}
                className="appearance-none w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md px-4 py-3 text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent cursor-pointer"
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-4 border-t border-gray-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-md border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 font-medium text-sm transition-colors text-center cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 py-2.5 px-4 rounded-md bg-[#003E83] hover:bg-[#002e62] text-white font-medium text-sm transition-colors text-center cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
