import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Trash2, 
  Loader2, 
  Upload, 
  Copy, 
  Check, 
  Image as ImageIcon 
} from 'lucide-react';
import guideService from '../../services/guideService';
import { useAlert } from '../../context/AlertContext';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function GuideGallery() {
  const { showAlert, showConfirm } = useAlert();
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const fetchGalleries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await guideService.getGalleries();
      const list = res?.data?.galleries || res?.data || res || [];
      setGalleries(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGalleries();
  }, [fetchGalleries]);

  const handleCopyUrl = async () => {
    if (!mediaUrl) return;
    try {
      await navigator.clipboard.writeText(mediaUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showAlert({ title: 'Copied!', message: 'Photo URL copied to clipboard.', type: 'info' });
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
      setMediaUrl(e.target.result);
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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !mediaUrl) return;
    setUploading(true);
    try {
      await guideService.uploadGalleryMedia({ title, media_url: mediaUrl, media_type: 'image' });
      setTitle('');
      setMediaUrl('');
      showAlert({ title: 'Success', message: 'Media uploaded to tourism gallery.', type: 'success' });
      fetchGalleries();
    } catch (err) {
      showAlert({ title: 'Error', message: err?.message || 'Failed to upload media.', type: 'danger' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (await showConfirm({ title: 'Delete Media', message: 'Delete this media item from gallery?', type: 'danger' })) {
      try {
        await guideService.deleteGalleryMedia(id);
        fetchGalleries();
      } catch (err) {
        showAlert({ title: 'Error', message: err?.message || 'Failed to delete.', type: 'danger' });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Guide Portal', to: '/guide/dashboard' },
          { label: 'Media Curation' }
        ]}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Tourism Media Curation</h1>
        </div>
      </div>

      {/* Upload Card */}
      <form onSubmit={handleUpload} className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-4 shadow-xs transition-colors">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-2">
          Upload New Photo
        </h4>

        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-1">
            Photo Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Title (e.g. Sunrise at Bayon Temple)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs font-medium text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
            required
          />
        </div>

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
                placeholder="Paste image URL (https://...) or drop picture below"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full pl-3 pr-9 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-xs text-gray-900 dark:text-white focus:border-[#003E83] dark:focus:border-[#60a5fa] focus:ring-1 focus:ring-[#003E83] focus:outline-none"
                required={!mediaUrl}
              />
              {mediaUrl && (
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
            {mediaUrl ? (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="w-24 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shrink-0">
                  <img
                    src={mediaUrl}
                    alt="Photo preview"
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
                    {mediaUrl.startsWith('data:') ? 'Local uploaded picture file' : mediaUrl}
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
                      onClick={() => setMediaUrl('')}
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

        <div className="flex justify-end pt-1">
          <button type="submit" disabled={uploading || !title || !mediaUrl} className="px-4 py-2 bg-[#003E83] hover:bg-[#002e62] dark:bg-[#60a5fa] dark:hover:bg-[#3b82f6] dark:text-zinc-950 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Uploading...' : 'Publish to Gallery'}</span>
          </button>
        </div>
      </form>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#003E83] dark:text-[#60a5fa] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {galleries.map((g) => (
            <div key={g.id} className="relative aspect-square rounded-lg overflow-hidden group bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 shadow-xs">
              <img src={g.media_url} alt={g.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                <span className="text-xs font-bold text-white line-clamp-1">{g.title}</span>
                <button
                  onClick={() => handleDelete(g.id)}
                  className="mt-2 text-rose-400 hover:text-rose-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

