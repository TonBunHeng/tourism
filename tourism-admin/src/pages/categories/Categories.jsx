import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Landmark } from "lucide-react";
import SimplePagination from "../../components/common/SimplePagination";
import CategoriesHeader from "./CategoriesHeader";
import CategoriesStats from "./CategoriesStats";
import CategoriesToolbar from "./CategoriesToolbar";
import CategoriesList from "./CategoriesList";
import CategoryModal from "./CategoryModal";
import CategoryDetailsModal from "./CategoryDetailsModal";
import categoryService from "../../services/categoryService";
import deletionRequestService from "../../services/deletionRequestService";
import authService, { isSuperAdminRole } from "../../services/authService";
import { useAlert } from "../../context/AlertContext";
import { useSearch } from "../../context/SearchContext";
import { useLanguage } from "../../i18n";
import { getPageCache, setPageCache } from "../../utils/pageCache";

export default function Categories() {
  const location = useLocation();
  const { t } = useLanguage();
  const { showConfirm, showSuccess, showError } = useAlert();
  const { searchTerm } = useSearch();
  const currentUser = authService.getCurrentUser();
  const isSuperAdmin = isSuperAdminRole(currentUser?.role);
  const cachedData = getPageCache('categories_data');
  const [categories, setCategories] = useState(() => cachedData?.categories || []);
  const [isLoading, setIsLoading] = useState(() => !cachedData);

  const [statusFilter, setStatusFilter] = useState("All");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(() => cachedData?.totalRecords || 0);
  const [totalPages, setTotalPages] = useState(() => cachedData?.totalPages || 1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Active",
    color: "#8B5CF6"
  });

  const loadCategories = useCallback(async () => {
    if (!getPageCache('categories_data')) setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: searchTerm || undefined,
      };
      if (statusFilter !== "All") {
        params.status = statusFilter;
      }
      const res = await categoryService.getCategories(params);
      if (res.success && res.data) {
        const formatted = res.data.map(c => ({
          ...c,
          placeCount: c.places_count !== undefined ? Number(c.places_count) : 0,
          icon: Landmark,
          createdAt: c.created_at ? c.created_at.split('T')[0] : '2024-01-01',
        }));
        setCategories(formatted);
        const total = res.meta ? res.meta.total : formatted.length;
        const pages = res.meta ? res.meta.last_page : 1;
        setTotalRecords(total);
        setTotalPages(pages);
        setPageCache('categories_data', { categories: formatted, totalRecords: total, totalPages: pages });
      }
    } catch (e) {
      console.error("Failed to load categories from API", e);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleStatusChange = (val) => { setStatusFilter(val); setCurrentPage(1); };

  const handleView = (category) => {
    setViewingCategory(category);
  };

  const handleDelete = async (id) => {
    const category = categories.find(c => c.id === id);
    const categoryName = category?.name || `Category #${id}`;

    if (isSuperAdmin) {
      const confirmed = await showConfirm({
        title: t('categories.deleteTitle', 'Delete Category'),
        message: t('categories.deletePermanentConfirm', 'Are you sure you want to permanently delete category "{name}"?\n\nThis action cannot be undone.').replace('{name}', categoryName),
        confirmText: t('categories.deletePermanentBtn', 'Delete Permanently'),
        type: 'danger'
      });

      if (!confirmed) return;

      try {
        await categoryService.deleteCategory(id);
        showSuccess(
          t('categories.deleteSuccess', 'Category "{name}" has been permanently deleted.').replace('{name}', categoryName),
          t('categories.deleteSuccessTitle', 'Category Deleted')
        );
        loadCategories();
      } catch (e) {
        showError(e.message || t('categories.deleteFailed', 'Failed to delete category.'), t('categories.deleteFailedTitle', 'Delete Failed'));
      }
      return;
    }

    const confirmed = await showConfirm({
      title: t('categories.deletionRequestTitle', 'Submit Deletion Request'),
      message: t('categories.deletionRequestMessage', 'Are you sure you want to submit a deletion request for category "{name}"?\n\nThis will be submitted to the Super Administrator for review and approval.').replace('{name}', categoryName),
      confirmText: t('categories.submitDeletionBtn', 'Submit Deletion'),
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await deletionRequestService.createRequest({
        request_type: 'item',
        reason: t('categories.deletionRequestReason', 'Request to delete category: {name}').replace('{name}', categoryName),
        urgency: 'medium',
        items: [{
          item_type: 'category',
          item_id: id,
          item_name: categoryName,
          category: 'Category'
        }]
      });
      showSuccess(
        t('categories.deletionRequestSuccess', 'Deletion request for "{name}" has been submitted to Super Admin for approval.').replace('{name}', categoryName),
        t('categories.requestSubmittedTitle', 'Request Submitted')
      );
    } catch (e) {
      showError(e.message || t('categories.submissionFailed', "Failed to submit deletion request."), t('categories.submissionFailedTitle', 'Submission Failed'));
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", status: "Active", color: "#8B5CF6" });
    setIsAddModalOpen(true);
  };

  useEffect(() => {
    if (location.state?.openAdd) {
      openAddModal();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      status: category.status || "Active",
      color: category.color || "#8B5CF6"
    });
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingCategory(null);
  };

  const handleFormChange = (fieldOrData, value) => {
    if (typeof fieldOrData === 'object' && fieldOrData !== null) {
      setFormData(fieldOrData);
    } else {
      setFormData(prev => ({ ...prev, [fieldOrData]: value }));
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
        showSuccess(
          t('categories.categoryUpdatedSuccess', 'Category "{name}" has been updated successfully.').replace('{name}', formData.name),
          t('categories.categoryUpdatedTitle', 'Category Updated')
        );
      } else {
        await categoryService.createCategory(formData);
        showSuccess(
          t('categories.categoryCreatedSuccess', 'Category "{name}" has been created successfully.').replace('{name}', formData.name),
          t('categories.categoryCreatedTitle', 'Category Created')
        );
      }
      closeModal();
      loadCategories();
    } catch (e) {
      showError(e.message || t('categories.saveFailed', "Failed to save category."), t('categories.saveFailedTitle', 'Save Failed'));
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + categories.length, totalRecords);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <CategoriesHeader onOpenAddModal={openAddModal} />

      {/* Stats Cards */}
      <CategoriesStats categories={categories} />

      {/* Main Categories Section */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden flex-1">
        <CategoriesToolbar
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          totalCount={totalRecords}
        />

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 dark:text-zinc-400 font-medium">
            {t('categories.loadingCategories', 'Loading categories from database...')}
          </div>
        ) : (
          <CategoriesList
            categories={categories}
            onView={handleView}
            onViewCategory={handleView}
            onEdit={openEditModal}
            onEditCategory={openEditModal}
            onDelete={handleDelete}
            onDeleteCategory={handleDelete}
            startIndex={startIndex}
          />
        )}

        {/* Simple Pagination Footer */}
        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalRecords={totalRecords}
          label={t('categories.categoryCountPlural', 'categories')}
        />
      </div>

      {/* Modals */}
      <CategoryModal
        isOpen={isAddModalOpen}
        onClose={closeModal}
        editingCategory={editingCategory}
        formData={formData}
        onFormChange={handleFormChange}
        onFormDataChange={handleFormChange}
        onSubmit={handleSubmit}
      />

      <CategoryDetailsModal
        isOpen={Boolean(viewingCategory)}
        category={viewingCategory}
        onClose={() => setViewingCategory(null)}
        onEdit={(cat) => {
          setViewingCategory(null);
          openEditModal(cat);
        }}
        onEditCategory={(cat) => {
          setViewingCategory(null);
          openEditModal(cat);
        }}
      />
    </div>
  );
}
