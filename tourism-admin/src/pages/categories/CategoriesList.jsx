import React from 'react';
import { Eye, Edit, Trash2, Layers, FolderTree } from 'lucide-react';
import { useLanguage } from '../../i18n';
import { getStatusColor } from '../../utils/StatusUtils';

export default function CategoriesList({
  categories = [],
  onView,
  onEdit,
  onDelete,
  onViewCategory,
  onEditCategory,
  onDeleteCategory,
  startIndex = 0
}) {
  const { t } = useLanguage();
  const handleView = onView || onViewCategory || (() => {});
  const handleEdit = onEdit || onEditCategory || (() => {});
  const handleDeleteItem = onDelete || onDeleteCategory || (() => {});

  const safeCategories = categories || [];

  return (
    <>
      {/* Mobile Card List View */}
      <div className="sm:hidden divide-y divide-[var(--color-border-subtle-light)] dark:divide-[var(--color-border-dark)]">
        {safeCategories.length > 0 ? (
          safeCategories.map((category) => {
            const isActive = category.status === 'Active';
            return (
              <div
                key={category.id}
                onClick={() => handleView(category)}
                className="p-4 hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700"
                    style={{
                      backgroundColor: category.color ? `${category.color}15` : 'rgba(59, 130, 246, 0.1)',
                      borderColor: category.color ? `${category.color}40` : undefined
                    }}
                  >
                    <FolderTree
                      className="w-5 h-5"
                      style={{ color: category.color || '#3b82f6' }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
                        {category.name}
                      </p>
                      <span className={`shrink-0 inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md border ${getStatusColor(category.status)}`}>
                        {isActive ? t('categories.statusActive', 'Active') : t('categories.statusInactive', 'Inactive')}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1 line-clamp-2">
                      {category.description || t('categories.defaultDescription', 'General category classification')}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-xs text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)]">
                      <Layers className="w-3.5 h-3.5" />
                      <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                        {category.placeCount ?? category.places_count ?? 0}
                      </span>
                      <span>{t('categories.placesRegistered', 'places registered')}</span>
                    </div>

                    <div
                      className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleView(category)}
                        className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                        title={t('categories.tooltipViewDetails', 'View Details')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(category)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                        title={t('categories.tooltipEdit', 'Edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(category.id)}
                        className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                        title={t('categories.tooltipDelete', 'Delete')}
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
            <FolderTree className="w-12 h-12 text-blue-500 mx-auto mb-2 opacity-80" />
            <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
              {t('categories.noCategoriesFound', 'No categories found')}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {t('categories.refineSearchFilter', 'Try adjusting your search or filter criteria')}
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
                {t('categories.thIndex', '#')}
              </th>
              <th className="px-4 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
                {t('categories.thCategoryTheme', 'Category & Theme')}
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider">
                {t('categories.thDescription', 'Description')}
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-32">
                {t('categories.thPlaces', 'Places')}
              </th>
              <th className="px-3 py-3.5 text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider whitespace-nowrap w-28">
                {t('categories.thStatus', 'Status')}
              </th>
              <th className="pl-3 pr-4 py-3.5 text-right text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] uppercase tracking-wider w-24 whitespace-nowrap">
                {t('categories.thActions', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] divide-y divide-[var(--color-border-light)] dark:divide-[var(--color-border-dark)]">
            {safeCategories.length > 0 ? (
              safeCategories.map((category, index) => {
                const isActive = category.status === 'Active';
                return (
                  <tr
                    key={category.id}
                    className="hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors group"
                  >
                    <td className="pl-4 pr-2 py-3.5 whitespace-nowrap text-xs font-medium text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-mono text-center">
                      {startIndex + index + 1}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 border"
                          style={{
                            backgroundColor: category.color ? `${category.color}15` : 'rgba(59, 130, 246, 0.1)',
                            borderColor: category.color ? `${category.color}40` : 'rgba(59, 130, 246, 0.2)'
                          }}
                        >
                          <FolderTree
                            className="w-4 h-4"
                            style={{ color: category.color || '#3b82f6' }}
                          />
                        </div>
                        <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                          {category.name}
                        </p>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] max-w-sm truncate">
                      {category.description || '—'}
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                        <Layers className="w-3.5 h-3.5 text-[var(--color-text-muted-light)]" />
                        <span className="font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                          {category.placeCount ?? category.places_count ?? 0}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getStatusColor(category.status)}`}>
                        {isActive ? t('categories.statusActive', 'Active') : t('categories.statusInactive', 'Inactive')}
                      </span>
                    </td>

                    <td className="pl-3 pr-4 py-3.5 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleView(category)}
                          className="p-1.5 text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] hover:bg-[var(--color-purple-badge-bg)] dark:hover:bg-[var(--color-purple-badge-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title={t('categories.tooltipViewDetails', 'View Details')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(category)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title={t('categories.tooltipEdit', 'Edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(category.id)}
                          className="p-1.5 text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-[var(--color-danger-dark-bg)] rounded-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                          title={t('categories.tooltipDelete', 'Delete')}
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
                <td colSpan="6" className="text-center py-12 px-4">
                  <FolderTree className="w-12 h-12 text-blue-500 mx-auto mb-2 opacity-80" />
                  <h3 className="text-base font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mb-1">
                    {t('categories.noCategoriesFound', 'No categories found')}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                    {t('categories.refineSearchFilter', 'Try adjusting your search or filter criteria')}
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
