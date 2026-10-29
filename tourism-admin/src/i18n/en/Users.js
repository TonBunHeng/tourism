const Users = {
  // Header
  title: "Users",
  subtitle: "Manage and monitor all platform users",
  addUserBtn: "Add New User",

  // Stats
  statTotalUsers: "Total Registered Users",
  subtextTotalUsers: "Tourist & staff accounts",
  statActiveAccounts: "Active Accounts",
  subtextActiveAccounts: "{pct}% active engagement",
  statInactiveAccounts: "Inactive / Suspended",
  subtextInactiveAccounts: "Inactive member accounts",
  statAdmins: "Administrators",
  subtextAdmins: "Full system access permissions",

  // Toolbar
  allUsers: "All Users",
  pillCount: "{count} users",
  pillCountSingle: "1 user",
  tabAllUsers: "All Users",
  tabAdminStaff: "Admin Staff",
  allRoles: "All Roles",
  allStatuses: "All Statuses",

  // Roles
  roleSuperAdmin: "Super Admin",
  roleAdmin: "Admin",
  roleGuideEditor: "Tourism Content Editor",
  roleBusinessOwner: "Business Owner",
  roleUser: "User",
  roleTourist: "Tourist",

  // Statuses
  statusActive: "Active",
  statusInactive: "Inactive",
  statusSuspended: "Suspended",
  statusOnline: "Online",
  statusOffline: "Offline",

  // Table & List Headers
  thIndex: "#",
  thUser: "User",
  thRole: "Role",
  thStatus: "Status",
  thLastActive: "Last Active",
  thPhone: "Phone",
  thActions: "Actions",

  // Actions & Tooltips
  tooltipViewDetails: "View Details",
  tooltipEditUser: "Edit User",
  tooltipDeleteUser: "Delete User",
  tooltipSuperAdminProtected: "Only Super Admin can modify Super Admin accounts",
  tooltipSuperAdminProtectedDelete: "Only Super Admin can delete Super Admin accounts",

  // Empty & Loading
  loadingUsers: "Loading user accounts...",
  noUsersFound: "No users found",
  tryAdjustingFilter: "Try adjusting your search or filter criteria",
  paginationLabel: "users",

  // Grid View
  reviewsCount: "Reviews",
  favoritesCount: "Favorites",
  placesCount: "Places",
  subFree: "Free",
  subBasic: "Basic",
  subPremium: "Premium",

  // Details Modal
  detailsModalTitle: "User Account Details",
  labelFullName: "Full Name",
  badgeVerified: "Verified",
  labelEmail: "Email",
  labelPhone: "Phone",
  labelRoleStatus: "Role & Status",
  labelSubscription: "Subscription",
  labelLocationActivity: "Location & Activity",
  lastActiveLabel: "Last active: {time}",
  timeJustNow: "Just now",
  timeOnlineNow: "Online Now",
  btnClose: "Close",
  btnEditUser: "Edit User",

  // Create / Edit User Modal
  modalAddTitle: "Create New User Account",
  modalEditTitle: "Edit User Account",
  modalAddSubtitle: "Add a new user with assigned system role.",
  modalEditSubtitle: "Update system role, profile details and permissions.",
  superAdminProtected: "Super Admin Protected",
  superAdminProtectedMsg: "Only Super Administrators can modify Super Admin accounts.",
  uploadPhoto: "Upload Photo",
  uploading: "Uploading...",
  removePhoto: "Remove Photo",
  avatarHelp: "PNG, JPG, WEBP up to 5MB",
  labelFullNameReq: "Full Name *",
  placeholderFullName: "e.g., Sophea Traveler",
  labelEmailReq: "Email Address *",
  placeholderEmail: "user@example.com",
  placeholderPhone: "+855 12 345 678",
  labelLocationReq: "Location / Province",
  placeholderLocation: "e.g., Phnom Penh",
  labelPasswordReq: "Password *",
  labelPasswordEdit: "New Password (Leave blank to keep current)",
  placeholderPassword: "Enter password (min. 6 characters)",
  placeholderPasswordEdit: "Enter new password if changing",
  labelRoleReq: "System Role *",
  labelStatusReq: "Account Status *",
  btnCancel: "Cancel",
  btnSaveChanges: "Save Changes",
  btnCreateUser: "Create User",

  // Alerts & Confirmations
  validationErrorRequired: "Please enter full name and email address.",
  cannotDeleteOwnAccount: "You cannot delete your own logged-in account.",
  actionBlocked: "Action Blocked",
  superAdminDeleteDenied: "Only Super Administrators can delete Super Admin accounts.",
  superAdminEditDenied: "Only Super Administrators can modify Super Admin accounts.",
  accessDenied: "Access Denied",
  deleteConfirmTitle: "Delete User Account",
  deleteConfirmMsg: "Are you sure you want to permanently delete user account \"{name}\" ({email})?\n\nThis action cannot be undone.",
  deleteConfirmBtn: "Delete User",
  deleteSuccess: "User account \"{name}\" has been deleted successfully.",
  deleteSuccessTitle: "User Deleted",
  deleteFailed: "Failed to delete user.",
  createSuccess: "User account \"{name}\" created successfully.",
  createSuccessTitle: "User Created",
  updateSuccess: "User account \"{name}\" updated successfully.",
  updateSuccessTitle: "User Updated",
  saveFailed: "Failed to save user.",
};

export default Users;
