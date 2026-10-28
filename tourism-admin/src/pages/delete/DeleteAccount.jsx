import { useState, useEffect } from "react";
import SimplePagination from "../../components/common/SimplePagination";
import DeletionHeader from "./DeletionHeader";
import DeletionStats from "./DeletionStats";
import DeletionAlert from "./DeletionAlert";
import DeletionToolbar from "./DeletionToolbar";
import DeletionList from "./DeletionList";
import DeletionDetailsModal from "./DeletionDetailsModal";
import DeletionConfirmModal from "./DeletionConfirmModal";
import deletionRequestService from "../../services/deletionRequestService";
import { useAlert } from "../../context/AlertContext";
import { useSearch } from "../../context/SearchContext";
import { getPageCache, setPageCache } from "../../utils/pageCache";
import { useLanguage } from "../../i18n";

export default function DeleteAccount() {
  const { t } = useLanguage();
  const { showSuccess, showError } = useAlert();
  const { searchTerm, setSearchTerm } = useSearch();

  const [requests, setRequests] = useState(() => getPageCache('deletion_requests_data')?.requests || []);
  const [isLoading, setIsLoading] = useState(() => !getPageCache('deletion_requests_data'));
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedUrgency, setSelectedUrgency] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(() => getPageCache('deletion_requests_data')?.totalRecords || 0);
  const [totalPages, setTotalPages] = useState(() => getPageCache('deletion_requests_data')?.totalPages || 1);
  const itemsPerPage = 10;

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmType, setConfirmType] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const types = ["All", "account", "item"];
  const statuses = ["All", "pending", "approved", "rejected", "archived"];
  const urgencies = ["All", "critical", "high", "medium", "low"];

  const loadRequests = async () => {
    if (requests.length === 0) {
      setIsLoading(true);
    }
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedStatus !== "All") params.status = selectedStatus;

      const res = await deletionRequestService.getRequests(params);
      if (res.success && res.data) {
        const formatted = res.data.map(req => {
          const userObj = req.user || {};
          const itemsList = Array.isArray(req.items) ? req.items : [];
          const itemsToDelete = itemsList.map(item => ({
            name: item.item_name,
            type: item.item_type,
            category: item.category || "General",
            id: item.item_id
          }));
          const targetName = req.target_name || (itemsList.length > 0 ? itemsList.map(i => i.item_name).join(", ") : (req.user_name || userObj.name || "Account"));

          return {
            id: req.id,
            user: {
              name: req.user_name || userObj.name || "App User",
              email: req.user_email || userObj.email || "user@example.com",
              phone: userObj.phone || "",
              avatar: userObj.avatar || null,
              role: userObj.role || "User"
            },
            type: req.request_type || "account",
            targetName: targetName,
            itemsToDelete: itemsToDelete,
            items: itemsList,
            reason: req.reason || "No reason provided",
            additionalInfo: req.additional_info || "",
            status: req.status || "pending",
            urgency: req.urgency || "medium",
            requestedDate: req.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
            processedDate: req.processed_at?.split("T")[0] || null,
            processedBy: req.processed_by_name || null,
            adminNotes: req.admin_notes || ""
          };
        });
        setRequests(formatted);
        const total = res.meta?.total || formatted.length;
        const pages = res.meta?.last_page || Math.ceil(total / itemsPerPage) || 1;
        setTotalRecords(total);
        setTotalPages(pages);

        if (currentPage === 1 && !searchTerm && selectedStatus === "All" && selectedType === "All" && selectedUrgency === "All") {
          setPageCache('deletion_requests_data', { requests: formatted, totalRecords: total, totalPages: pages });
        }
      }
    } catch (e) {
      console.error("Failed to load deletion requests:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    loadRequests();
  }, [currentPage, searchTerm, selectedStatus, selectedType, selectedUrgency, sortBy]);

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.additionalInfo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "All" || req.type === selectedType;
    const matchesStatus = selectedStatus === "All" || req.status === selectedStatus;
    const matchesUrgency = selectedUrgency === "All" || req.urgency === selectedUrgency;

    return matchesSearch && matchesType && matchesStatus && matchesUrgency;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.requestedDate) - new Date(a.requestedDate);
    }
    if (sortBy === "oldest") {
      return new Date(a.requestedDate) - new Date(b.requestedDate);
    }
    if (sortBy === "urgency") {
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (urgencyOrder[a.urgency] || 4) - (urgencyOrder[b.urgency] || 4);
    }
    return 0;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);
  const paginatedRequests = sortedRequests.slice(startIndex, endIndex);

  const handleTypeChange = (val) => { setSelectedType(val); setCurrentPage(1); };
  const handleStatusChange = (val) => { setSelectedStatus(val); setCurrentPage(1); };
  const handleUrgencyChange = (val) => { setSelectedUrgency(val); setCurrentPage(1); };
  const handleSortChange = (val) => { setSortBy(val); setCurrentPage(1); };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || "");
    setIsDetailsOpen(true);
  };

  const handleApprove = (request) => {
    setConfirmAction("approve");
    setConfirmType(request.type === "account" ? "Account Deletion" : "Item Deletion");
    setSelectedRequest(request);
    setIsConfirmOpen(true);
  };

  const handleReject = (request) => {
    setConfirmAction("reject");
    setConfirmType(request.type === "account" ? "Account Deletion" : "Item Deletion");
    setSelectedRequest(request);
    setIsConfirmOpen(true);
  };

  const confirmDecision = async () => {
    if (!selectedRequest || !confirmAction) return;

    const newStatus = confirmAction === "approve" ? "approved" : "rejected";
    try {
      const res = await deletionRequestService.updateStatus(selectedRequest.id, {
        status: newStatus,
        admin_notes: adminNotes
      });
      setIsConfirmOpen(false);
      setIsDetailsOpen(false);
      setConfirmAction(null);
      setAdminNotes("");
      setSelectedRequest(null);
      const msg = res.message || (newStatus === "approved" 
        ? t('deletion.approveSuccess', 'Deletion request approved and item/account deleted.') 
        : t('deletion.rejectSuccess', 'Deletion request rejected.'));
      showSuccess(
        msg, 
        newStatus === "approved" 
          ? t('deletion.approveTitle', 'Request Approved') 
          : t('deletion.rejectTitle', 'Request Rejected')
      );
      loadRequests();
    } catch (e) {
      showError(
        e.message || t('deletion.updateFailed', 'Failed to update request status.'), 
        t('deletion.actionFailedTitle', 'Action Failed')
      );
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedType("All");
    setSelectedStatus("All");
    setSelectedUrgency("All");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || selectedType !== "All" || selectedStatus !== "All" || selectedUrgency !== "All";

  return (
    <div className="flex flex-col">
      {/* Header */}
      <DeletionHeader />

      {/* Stats Cards */}
      <DeletionStats requests={requests} />

      {/* Urgency Alert */}
      <DeletionAlert requests={requests} />

      {/* Main Content */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden flex-1">
        {/* Toolbar */}
        <DeletionToolbar
          totalCount={filteredRequests.length}
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
          types={types}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          statuses={statuses}
          selectedUrgency={selectedUrgency}
          onUrgencyChange={handleUrgencyChange}
          urgencies={urgencies}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          onClearFilters={handleClearFilters}
        />

        {/* Requests List */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 dark:text-zinc-400 font-medium">
            {t('deletion.loadingRequests', 'Loading deletion requests from API...')}
          </div>
        ) : (
          <DeletionList
            requests={paginatedRequests}
            startIndex={startIndex}
            onViewDetails={handleViewDetails}
            onApprove={handleApprove}
            onReject={handleReject}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
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
          label={t('deletion.paginationLabel', 'requests')}
        />
      </div>

      {/* Details Modal */}
      <DeletionDetailsModal
        isOpen={isDetailsOpen}
        request={selectedRequest}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onClose={() => setIsDetailsOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Confirm Modal */}
      <DeletionConfirmModal
        isOpen={isConfirmOpen}
        request={selectedRequest}
        confirmAction={confirmAction}
        confirmType={confirmType}
        onClose={() => {
          setIsConfirmOpen(false);
          setSelectedRequest(null);
          setConfirmAction(null);
        }}
        onConfirm={confirmDecision}
      />
    </div>
  );
}
