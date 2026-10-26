import { Video, Eye, Edit, Trash2, Clock, Heart, HardDrive, Calendar } from 'lucide-react';

const getStatusColor = (status) => {
  return status === 'Published'
    ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)] dark:bg-[var(--color-success-dark-bg)] dark:text-[var(--color-success-dark-text)] dark:border-[var(--color-success-dark-border)]'
    : 'bg-[var(--color-neutral-badge-bg)] text-[var(--color-neutral-badge-text)] border-[var(--color-border-subtle-light)] dark:bg-[var(--color-neutral-badge-dark-bg)] dark:text-[var(--color-neutral-badge-dark-text)] dark:border-[var(--color-border-dark)]';
};

export default function GalleryGrid({ media, mediaItems, onPreview, onEdit, onDelete }) {
  const items = Array.isArray(media) ? media : (Array.isArray(mediaItems) ? mediaItems : []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
      {items.length > 0 ? (
        items.map((item) => (
          <div
            key={item.id}
            className="group relative bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)]/50 border border-gray-200 dark:border-zinc-800 rounded-md p-4 hover:border-gray-400 dark:hover:border-zinc-600 shadow-xs transition-colors"
          >
            {/* Top Media Picture Banner */}
            <div className="relative w-full h-40 mb-3 rounded-md overflow-hidden border border-gray-200 dark:border-zinc-800 bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]">
              {item.type === 'video' ? (
                <div className="w-full h-full bg-black/60 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-md bg-white/90 dark:bg-gray-900/90 flex items-center justify-center">
                    <Video className="w-4 h-4 text-[var(--color-info-text)] ml-0.5" />
                  </div>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Status Badge */}
              <span className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-medium rounded-md border ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>

            {/* Media Information */}
            <div className="space-y-2 mb-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm line-clamp-1">
                  {item.title}
                </h3>
                <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-md border bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] border-[var(--color-info-border)] dark:border-[var(--color-info-dark-border)] shrink-0">
                  {item.category}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {item.tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] bg-[var(--color-surface-hover-light)] dark:bg-[var(--color-surface-hover-dark)]/50 px-1.5 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Technical Details */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] pt-1">
                <div className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]" />
                  <span className="truncate">{item.size} • {item.dimensions}</span>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Calendar className="w-3 h-3 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]" />
                  <span>{item.uploadDate}</span>
                </div>
              </div>
            </div>

            {/* Card Footer: Views & Action Buttons */}
            <div className="flex items-center justify-between pt-2.5 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                  {(item.views || 0).toLocaleString()} views
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onPreview(item)}
                  className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                  title="View Details"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="p-1.5 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] hover:bg-[var(--color-info-bg)] dark:hover:bg-[var(--color-info-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                  title="Edit Media"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                  title="Delete Media"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <h3 className="text-lg font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">No media found</h3>
          <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
