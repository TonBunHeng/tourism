const Deletion = {
  // Header
  title: "Deletion Requests",
  subtitle: "Manage account deletion and item removal requests from users",

  // Stats
  statTotalRequests: "Total Requests",
  subtextTotalRequests: "Logged privacy & removal tickets",
  statPendingReviews: "Pending Reviews",
  subtextAllResolved: "All tickets resolved",
  subtextAwaitingAdmin: "{count} tickets awaiting admin action",
  statAccountDeletions: "Account Deletions",
  subtextAccountDeletions: "GDPR / user erasure requests",
  statItemDeletions: "Item Deletions",
  subtextItemDeletions: "Specific content removal requests",

  // Alert Banner
  alertCriticalTitle: "{count} Critical Request(s) Need Immediate Attention",
  alertCriticalSubtext: "These requests require urgent action due to security or privacy concerns",

  // Toolbar
  allRequests: "All Requests",
  pillCount: "{count} requests",
  pillCountSingle: "1 request",
  typeAll: "All Types",
  typeAccount: "Account",
  typeItem: "Item",
  statusAll: "All Statuses",
  statusPending: "Pending",
  statusApproved: "Approved",
  statusRejected: "Rejected",
  statusArchived: "Archived",
  urgencyAll: "All Urgencies",
  urgencyCritical: "Critical",
  urgencyHigh: "High",
  urgencyMedium: "Medium",
  urgencyLow: "Low",
  sortNewest: "Newest First",
  sortOldest: "Oldest First",
  sortUrgency: "By Urgency",
  btnReset: "Reset",
  titleReset: "Reset all filters",

  // Table Headers
  thIndex: "#",
  thUserAccount: "User & Account",
  thType: "Type",
  thUrgency: "Urgency",
  thReason: "Reason",
  thStatus: "Status",
  thActions: "Actions",

  // Badge labels
  labelAccountDeletion: "Account Deletion",
  labelItemDeletion: "Item Deletion",
  userDefault: "User",

  // Tooltips
  tooltipViewDetails: "View Details",
  tooltipApprove: "Approve",
  tooltipReject: "Reject",

  // Empty state & Loading
  noRequestsFound: "No requests found",
  tryAdjustingFilter: "Try adjusting your search or filter criteria",
  clearFiltersBtn: "Clear all filters",
  loadingRequests: "Loading deletion requests from API...",
  paginationLabel: "requests",

  // Details Modal
  detailsTitle: "Request Details",
  detailsId: "ID: #{id}",
  labelUser: "User",
  labelRequestType: "Request Type",
  labelStatusUrgency: "Status & Urgency",
  labelReason: "Reason",
  labelAdditionalInfo: "Additional Information",
  labelItemsToDelete: "Items to Delete",
  labelAdminNotes: "Admin Notes",
  placeholderAdminNotes: "Add admin notes...",
  btnApprove: "Approve",
  btnReject: "Reject",
  btnClose: "Close",

  // Confirmation Modal
  confirmTitleApprove: "Confirm Approval",
  confirmTitleReject: "Confirm Rejection",
  confirmMessage: "Are you sure you want to {action} this {type} request for {name}?",
  permanentWarning: "This action will permanently execute the deletion. This cannot be undone.",
  btnCancel: "Cancel",
  btnConfirmApprove: "Confirm Approve",
  btnConfirmReject: "Confirm Reject",
  actionApproveText: "approve",
  actionRejectText: "reject",

  // Notifications & Toasts
  approveSuccess: "Deletion request approved and item/account deleted.",
  rejectSuccess: "Deletion request rejected.",
  approveTitle: "Request Approved",
  rejectTitle: "Request Rejected",
  updateFailed: "Failed to update request status.",
  actionFailedTitle: "Action Failed",
};

export default Deletion;
