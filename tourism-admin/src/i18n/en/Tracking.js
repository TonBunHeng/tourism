const Tracking = {
  // Header
  title: "Users Tracking",
  subtitle: "Track CRUD history, updates, and item deletions across all platform roles",
  exportPdfBtn: "PDF",
  exportPdfTitle: "Export Activity to PDF",
  exportExcelBtn: "Excel",
  exportExcelTitle: "Export Activity to Excel",

  // Stats
  statTotalOperations: "Total Operations",
  subtextTotalOperations: "Tracked staff & business actions",
  statAdminStaff: "Admin Staff",
  subtextAdminStaff: "Approvals, item edits & removals",
  statContentEditors: "Content Editors",
  subtextContentEditors: "Places, events & media modified",
  statBusinessOwners: "Business Owners",
  subtextBusinessOwners: "Profile edits & booking status",

  // Toolbar
  allActivities: "All Activities",
  pillCount: "{count} activities",
  pillCountSingle: "1 activity",
  
  // Role filter options
  roleAll: "All Roles",
  roleAdmin: "Admin Staff",
  roleGuideEditor: "Content Editors",
  roleBusinessOwner: "Business Owners",

  // Action filter options
  actionAll: "All Actions",
  actionCreate: "Created (Items)",
  actionUpdate: "Updated (Edits)",
  actionDelete: "Deleted (Removals)",
  actionApprove: "Approved & Verified",
  actionReject: "Rejected & Suspended",
  actionAuth: "Logins & Sessions",

  // Timeframe filter options
  periodAll: "All Time",
  periodToday: "Today",
  period7d: "Past 7 Days",
  period30d: "Past 30 Days",

  // Table Headers
  thIndex: "#",
  thUser: "USER",
  thRole: "ROLE",
  thAction: "ACTION",
  thTargetItem: "TARGET ITEM",
  thDescription: "DESCRIPTION",
  thDateTime: "DATE & TIME",
  thActions: "ACTIONS",

  // Relative Time
  timeJustNow: "Just now",
  timeMinAgo: "{min}m ago",
  timeHrAgo: "{hr}h ago",
  timeYesterday: "Yesterday",
  timeDaysAgo: "{days}d ago",

  // Tooltips & Labels
  staffUser: "Staff User",
  tooltipViewDetails: "View Details",
  tooltipDeleteRecord: "Delete Activity Record",
  noActivitiesFound: "No activities found",
  tryAdjustingFilter: "Try adjusting your search or role filter criteria",
  loadingRecords: "Loading user activity records...",
  paginationLabel: "activities",

  // Details Modal
  detailsTitle: "Activity Record Details",
  detailsSubtitle: "Record #{id} • User action history",
  labelUserInitiator: "User / Initiator",
  systemGuest: "System / Guest",
  labelRole: "Role:",
  guest: "Guest",
  labelOperationItem: "Operation & Item",
  labelTarget: "Target:",
  platform: "Platform",
  labelActionDescription: "Action Description",
  noDescription: "No detailed change description provided.",
  labelIpAddress: "IP Address",
  labelTimestamp: "Timestamp",
  labelClientUserAgent: "Client User Agent",
  labelStateChanges: "State Changes (Payload Diff)",
  labelPreviousValues: "Previous Values",
  labelUpdatedValues: "Updated Values",
  btnClose: "Close",

  // Modal (Super Admin / Note)
  modalEditTitle: "Edit Activity Note",
  modalCreateTitle: "Log Super Admin Action",
  modalEditSubtitle: "Update the description or note for this record",
  modalCreateSubtitle: "Manually record a privileged administrator action",
  labelActionName: "Action Name / Key *",
  labelTargetEntityType: "Target Entity Type",
  labelTargetItemId: "Target Item ID (Optional)",
  labelDescriptionNote: "Description / Action Note *",
  placeholderDescription: "Describe the action or item modification details...",
  btnCancel: "Cancel",
  btnSaveChanges: "Save Changes",
  btnRecordAction: "Record Action",

  // Confirmations & Alerts
  deleteConfirmTitle: "Delete Activity Record",
  deleteConfirmMsg: "Are you sure you want to permanently delete activity record #{id} ({action})?\n\nThis action cannot be undone.",
  deleteConfirmBtn: "Delete Record",
  deleteSuccess: "Activity record permanently deleted.",
  deleteSuccessTitle: "Record Deleted",
  deleteFailed: "Failed to delete record.",

  exportFailedTitle: "Export Failed",
  noRecordsToExport: "No records found to export.",
  
  exportPdfConfirmTitle: "Export PDF Report Confirmation",
  exportPdfConfirmMsg: "Are you sure you want to export the \"Users Tracking\" dataset ({count} items) as a styled PDF document?",
  exportPdfConfirmBtn: "Export PDF",
  exportPdfDocTitle: "Users Tracking & Activity History Report",
  exportPdfDocSubtitle: "User CRUD operations and action history across all platform roles ({count} records).",
  exportPdfSuccess: "The \"Users Tracking\" dataset ({count} items) has been exported to PDF successfully.",
  exportPdfSuccessTitle: "PDF Exported Successfully",
  exportPdfFailed: "Failed to generate PDF report document.",

  exportExcelConfirmTitle: "Export Excel Spreadsheet Confirmation",
  exportExcelConfirmMsg: "Are you sure you want to export the \"Users Tracking\" dataset ({count} items) as an Excel spreadsheet?",
  exportExcelConfirmBtn: "Export Excel",
  exportExcelSheetName: "Users Tracking",
  exportExcelSuccess: "The \"Users Tracking\" dataset ({count} items) has been exported to Excel successfully.",
  exportExcelSuccessTitle: "Excel Exported Successfully",
  exportExcelFailed: "Failed to generate Excel spreadsheet.",
};

export default Tracking;
