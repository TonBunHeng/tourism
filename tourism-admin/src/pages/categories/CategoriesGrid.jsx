import { Eye, Edit, Trash2, Clock, FolderTree } from 'lucide-react';
import { getStatusColor } from '../../utils/StatusUtils';

export default function CategoriesGrid({
  categories = [],
  onView,
  onEdit,
  onDelete,
  onViewCategory,
  onEditCategory,
  onDeleteCategory
}) {
  const handleView = onView || onViewCategory || (() => {});
  const handleEdit = onEdit || onEditCategory || (() => {});
  const handleDeleteItem = onDelete || onDeleteCategory || (() => {});

  const safeCategories = categories || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-6">
      {safeCategories.length > 0 ? (
        safeCategories.map((category) => {
          const themeColor = category.color || '#8B5CF6';
          return (
            <div
              key={category.id}
              onClick={() => handleView(category)}
              className="group relative bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)]/50 border border-gray-200 dark:border-zinc-800 rounded-md p-4 overflow-hidden hover:border-gray-400 dark:hover:border-zinc-600 shadow-xs transition-colors cursor-pointer"
            >
              {/* Top Accent Color Bar */}
              <div className="h-1 -mx-4 -mt-4 mb-4" style={{ backgroundColor: themeColor }} />

              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Category Color Icon Badge */}
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: themeColor }}
                  >
                    <FolderTree className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm truncate">{category.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">{category.placeCount} places</span>
                      {/* Color Tag Badge */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.2 rounded-md bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                        <span className="w-2 h-2 rounded-md shrink-0" style={{ backgroundColor: themeColor }} />
                        <span style={{ color: themeColor }} className="font-semibold">{themeColor}</span>
                      </span>
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleView(category); }}
                    className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                    title="View"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleEdit(category); }}
                    className="p-1.5 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] hover:bg-[var(--color-info-bg)] dark:hover:bg-[var(--color-info-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(category.id)}
                    className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-3 line-clamp-2">{category.description}</p>
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-md border flex-shrink-0 ${getStatusColor(category.status)}`}>
                  <Clock className="w-3 h-3" />
                  {category.status}
                </span>
                <span className="text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] truncate">Created: {category.createdAt}</span>
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full text-center py-12">
          <h3 className="text-lg font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">No categories found</h3>
          <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
