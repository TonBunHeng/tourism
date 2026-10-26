import { Clock, Eye, Edit, Trash2, Video, Image as ImageIcon, Eye as ViewsIcon } from 'lucide-react';
import { getGalleryStatusColor as getStatusColor, getTypeIcon } from '../../utils/StatusUtils';

export default function GalleryList({ media, mediaItems, onPreview, onEdit, onDelete, startIndex = 0 }) {
  const items = Array.isArray(media) ? media : (Array.isArray(mediaItems) ? mediaItems : []);

  return (
    <>
      {/* Mobile Card List View */}
      <div className="sm:hidden divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)]">
        {items.length > 0 ? (
          items.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            return (
              <div
                key={item.id}
                onClick={() => onPreview(item)}
                className="p-4 hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-[var(--color-border-light)] dark:bg-[var(--color-surface-hover-dark)] overflow-hidden relative shrink-0 border border-slate-200 dark:border-zinc-700 flex items-center justify-center">
                    {item.type === 'video' ? (
                      <div className="w-full h-full bg-black/60 flex items-center justify-center">
                        <Video className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                        {item.title}
                      </p>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border shrink-0 ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] border border-[var(--color-info-border)] dark:border-[var(--color-info-dark-border)]">
                        {item.category}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                        {item.size} • {(item.views || 0).toLocaleString()} views
                      </span>
                    </div>

                    <div
                      className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onPreview(item)}
                        className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 px-4">
            <ImageIcon className="w-12 h-12 text-blue-500 mx-auto mb-2 opacity-80" />
            <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
              No media found
            </h3>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Desktop Responsive Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)] table-auto">
          <thead className="bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/50">
            <tr>
              <th className="pl-4 pr-2 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-10 text-center">
                #
              </th>
              <th className="px-4 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
                Media & Title
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-36">
                Category
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-28">
                Size
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-28">
                Views
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-32">
                Status
              </th>
              <th className="pl-3 pr-4 py-3.5 text-right text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-24 whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
            {items.length > 0 ? (
              items.map((item, index) => {
                const TypeIcon = getTypeIcon(item.type);
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors group"
                  >
                    <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                      {startIndex + index + 1}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-[var(--color-border-light)] dark:bg-[var(--color-surface-hover-dark)] overflow-hidden relative shrink-0 border border-slate-200 dark:border-zinc-700 flex items-center justify-center">
                          {item.type === 'video' ? (
                            <div className="w-full h-full bg-black/60 flex items-center justify-center">
                              <Video className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <img
                              src={item.url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate font-mono">
                            {item.dimensions || (item.type === 'video' ? 'Video Stream' : 'Image File')}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] border border-[var(--color-info-border)] dark:border-[var(--color-info-dark-border)]">
                        {item.category}
                      </span>
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono">
                      {item.size}
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                      <div className="flex items-center gap-1">
                        <ViewsIcon className="w-3.5 h-3.5 text-[var(--color-text-muted-light)] shrink-0" />
                        <span>{(item.views || 0).toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-xs text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onPreview(item)}
                          className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-12 px-4">
                  <ImageIcon className="w-12 h-12 text-blue-500 mx-auto mb-2 opacity-80" />
                  <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
                    No media found
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    Try adjusting your search or filter criteria
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
