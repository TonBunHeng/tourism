import { useState, useEffect, useCallback } from "react";
import SimplePagination from "../../components/common/SimplePagination";
import GalleryHeader from "./GalleryHeader";
import GalleryStats from "./GalleryStats";
import GalleryToolbar from "./GalleryToolbar";
import GalleryList from "./GalleryList";
import GalleryUploadModal from "./GalleryUploadModal";
import GalleryEditModal from "./GalleryEditModal";
import GalleryPreviewModal from "./GalleryPreviewModal";
import galleryService from "../../services/galleryService";
import categoryService from "../../services/categoryService";
import deletionRequestService from "../../services/deletionRequestService";
import authService, { isSuperAdminRole } from "../../services/authService";
import { useAlert } from "../../context/AlertContext";
import { useSearch } from "../../context/SearchContext";
import { getPageCache, setPageCache, clearPageCache } from "../../utils/pageCache";
import { useLanguage } from "../../i18n";

export default function Gallery() {
  const { t } = useLanguage();
  const { showConfirm, showSuccess, showError } = useAlert();
  const { searchTerm } = useSearch();
  const currentUser = authService.getCurrentUser();
  const isSuperAdmin = isSuperAdminRole(currentUser?.role);

  const [mediaItems, setMediaItems] = useState(() => {
    const cached = getPageCache('gallery_data');
    return cached?.mediaItems || [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    const cached = getPageCache('gallery_data');
    return !cached;
  });

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(() => {
    const cached = getPageCache('gallery_data');
    return cached?.totalRecords || 0;
  });
  const [totalPages, setTotalPages] = useState(() => {
    const cached = getPageCache('gallery_data');
    return cached?.totalPages || 1;
  });
  const itemsPerPage = 10;

  // Render-time state adjustment when searchTerm changes
  const [prevSearch, setPrevSearch] = useState(searchTerm);
  if (prevSearch !== searchTerm) {
    setPrevSearch(searchTerm);
    setCurrentPage(1);
  }

  const [categoriesList, setCategoriesList] = useState(["All", "Temple", "Nature", "Culture", "City", "Festival", "Food"]);
  const types = ["All", "Image", "Video"];

  const loadCategories = async () => {
    await Promise.resolve();
    try {
      const res = await categoryService.getCategories({ per_page: 100 });
      if (res.success && res.data && res.data.length > 0) {
        const catNames = res.data.map(c => c.name);
        setCategoriesList(["All", ...catNames]);
      }
    } catch (e) {
      console.warn("Could not load categories:", e);
    }
  };

  const loadMedia = useCallback(async () => {
    await Promise.resolve();
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (selectedType !== "All") params.type = selectedType.toLowerCase();

      const res = await galleryService.getMedia(params);
      if (res.success && res.data) {
        const formatted = res.data.map(item => ({
          id: item.id,
          title: item.title,
          type: item.type || "image",
          url: item.url,
          category: item.category || item.category_name || "General",
          size: item.size || item.file_size || "N/A",
          dimensions: item.dimensions || "N/A",
          uploadedBy: item.uploader_name || item.user?.name || "Admin",
          uploadDate: item.uploadDate || (item.created_at ? item.created_at.split("T")[0] : "—"),
          views: Number(item.views_count ?? item.views ?? 0),
          likes: Number(item.likes_count ?? item.likes ?? 0),
          status: item.status || "Published",
          tags: Array.isArray(item.tags)
            ? item.tags.map(t => (typeof t === "string" ? t : t.name || "tag"))
            : [item.category?.toLowerCase() || "tourism"]
        }));
        setMediaItems(formatted);
        const total = res.meta?.total || formatted.length;
        const pages = res.meta?.last_page || Math.ceil(total / itemsPerPage) || 1;
        setTotalRecords(total);
        setTotalPages(pages);

        if (currentPage === 1 && !searchTerm && selectedCategory === "All" && selectedType === "All") {
          setPageCache('gallery_data', { mediaItems: formatted, totalRecords: total, totalPages: pages });
        }
      }
    } catch (e) {
      console.error("Failed to load gallery media from API:", e);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory, selectedType, itemsPerPage]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCategories();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMedia();
  }, [loadMedia]);

  const handleCategoryChange = (val) => { setSelectedCategory(val); setCurrentPage(1); };
  const handleTypeChange = (val) => { setSelectedType(val); setCurrentPage(1); };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + mediaItems.length, totalRecords);

  const handleDelete = async (id) => {
    const item = mediaItems.find(m => m.id === id);
    const mediaTitle = item?.title || `Media #${id}`;

    if (isSuperAdmin) {
      const confirmed = await showConfirm({
        title: t('gallery.deleteMediaTitle', 'Delete Media'),
        message: t('gallery.deletePermanentConfirm', 'Are you sure you want to permanently delete "{name}"?\n\nThis action cannot be undone.').replace('{name}', mediaTitle),
        confirmText: t('gallery.deletePermanentBtn', 'Delete Permanently'),
        type: 'danger'
      });

      if (!confirmed) return;

      try {
        await galleryService.deleteMedia(id);
        clearPageCache('gallery_data');
        showSuccess(
          t('gallery.deleteSuccessMsg', 'Media "{name}" has been permanently deleted.').replace('{name}', mediaTitle),
          t('gallery.deleteSuccessTitle', 'Media Deleted')
        );
        loadMedia();
      } catch (e) {
        showError(
          e.message || t('gallery.deleteFailedMsg', 'Failed to delete media.'),
          t('gallery.deleteFailedTitle', 'Delete Failed')
        );
      }
      return;
    }

    const confirmed = await showConfirm({
      title: t('gallery.deletionRequestTitle', 'Submit Deletion Request'),
      message: t('gallery.deletionRequestMessage', 'Are you sure you want to submit a deletion request for "{name}"?\n\nThis will be submitted to the Super Administrator for review and approval.').replace('{name}', mediaTitle),
      confirmText: t('gallery.submitDeletionBtn', 'Submit Deletion'),
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await deletionRequestService.createRequest({
        request_type: 'item',
        reason: t('gallery.deletionRequestReason', 'Request to delete media item: {name}').replace('{name}', mediaTitle),
        urgency: 'low',
        items: [{
          item_type: 'gallery',
          item_id: id,
          item_name: mediaTitle,
          category: item?.category || 'Gallery'
        }]
      });
      showSuccess(
        t('gallery.deletionRequestSuccessMsg', 'Deletion request for "{name}" has been submitted to Super Admin for approval.').replace('{name}', mediaTitle),
        t('gallery.requestSubmittedTitle', 'Request Submitted')
      );
    } catch (e) {
      showError(
        e.message || t('gallery.submissionFailedMsg', 'Failed to submit deletion request.'),
        t('gallery.submissionFailedTitle', 'Submission Failed')
      );
    }
  };

  const handlePreview = (item) => {
    setSelectedMedia(item);
    setIsPreviewOpen(true);
  };

  const handleEdit = (item) => {
    setEditingMedia({ ...item });
    setIsEditOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editingMedia) return;
    try {
      await galleryService.updateMedia(editingMedia.id, {
        title: editingMedia.title,
        type: editingMedia.type || "image",
        category: editingMedia.category,
        url: editingMedia.url,
        file_size: editingMedia.size || editingMedia.file_size || null,
        dimensions: editingMedia.dimensions || null,
        status: editingMedia.status || "Published"
      });
      setIsEditOpen(false);
      setEditingMedia(null);
      clearPageCache('gallery_data');
      showSuccess(
        t('gallery.mediaUpdatedSuccess', 'Media item "{name}" has been updated successfully.').replace('{name}', editingMedia.title),
        t('gallery.mediaUpdatedTitle', 'Media Updated')
      );
      loadMedia();
    } catch (err) {
      showError(
        err.message || t('gallery.updateFailedMsg', "Failed to update media item."),
        t('gallery.updateFailedTitle', 'Update Failed')
      );
    }
  };

  const handleAddMedia = async (newMedia) => {
    try {
      await galleryService.createMedia({
        title: newMedia.title,
        type: newMedia.type || "image",
        url: newMedia.url,
        category: newMedia.category,
        file_size: newMedia.fileSize || newMedia.size || null,
        dimensions: newMedia.dimensions || null,
        status: newMedia.status || "Published"
      });
      setIsUploadModalOpen(false);
      clearPageCache('gallery_data');
      showSuccess(
        t('gallery.mediaUploadedSuccess', 'Media item "{name}" has been created and published successfully.').replace('{name}', newMedia.title),
        t('gallery.mediaUploadedTitle', 'Media Uploaded')
      );
      loadMedia();
    } catch (err) {
      showError(
        err.message || t('gallery.uploadFailedMsg', "Failed to create media item."),
        t('gallery.uploadFailedTitle', 'Upload Failed')
      );
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header Section */}
      <GalleryHeader onOpenUploadModal={() => setIsUploadModalOpen(true)} />

      {/* Stats Cards */}
      <GalleryStats mediaItems={mediaItems} media={mediaItems} />

      {/* Main Content Section */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden flex-1">
        {/* Toolbar */}
        <GalleryToolbar
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          categories={categoriesList}
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
          types={types}
          totalCount={totalRecords}
        />

        {/* Content View */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 dark:text-zinc-400 font-medium">
            {t('gallery.loadingMedia', 'Loading gallery media from database...')}
          </div>
        ) : (
          <GalleryList
            media={mediaItems}
            mediaItems={mediaItems}
            onPreview={handlePreview}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
          label={t('gallery.paginationLabel', 'media items')}
        />
      </div>

      {/* Upload Modal */}
      <GalleryUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        categories={categoriesList}
        onAddMedia={handleAddMedia}
      />

      {/* Edit Modal */}
      <GalleryEditModal
        isOpen={isEditOpen}
        editingMedia={editingMedia}
        onEditingMediaChange={setEditingMedia}
        onClose={() => {
          setIsEditOpen(false);
          setEditingMedia(null);
        }}
        onSubmit={handleUpdateSubmit}
        categories={categoriesList}
      />

      {/* Preview Modal */}
      <GalleryPreviewModal
        isOpen={isPreviewOpen}
        media={selectedMedia}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedMedia(null);
        }}
        onEdit={handleEdit}
      />
    </div>
  );
}
