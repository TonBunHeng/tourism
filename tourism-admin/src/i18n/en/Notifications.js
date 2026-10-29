const Notifications = {
  // Header
  title: "Notifications",
  subtitle: "Real-time updates for security alerts, tourist reviews, chat messages, and system events",
  markAllRead: "Mark All Read",
  clearAll: "Clear All",

  // Stats
  statTotal: "Total Notifications",
  subtextTotal: "Logged system events",
  statUnread: "Unread Alerts",
  subtextUnreadAllRead: "All notifications read",
  subtextUnreadCount: "{count} requiring attention",
  statReviews: "Reviews & Feedback",
  subtextReviews: "Traveler ratings & comments",
  statSecurity: "Security & System",
  subtextSecurity: "Infrastructure alarms & logs",

  // Toolbar
  sectionTitle: "All Notifications",
  pillCount: "{count} notifications",
  pillCountSingle: "1 notification",
  allCategories: "All Categories",
  allStatus: "All Status",
  unreadOnly: "Unread Only ({count})",
  readStatus: "Read / Acknowledged",

  // Categories
  catAll: "All",
  catAlerts: "Alerts",
  catReviews: "Reviews",
  catMessages: "Messages",
  catUsers: "Users",
  catSystem: "System",
  catGeneral: "General",

  // Status Badges & Times
  badgeUnread: "Unread",
  badgeRead: "Read",
  timeJustNow: "Just now",
  timeMinsAgo: "{count} min ago",
  timeMinsAgoPlural: "{count} mins ago",
  timeHoursAgo: "{count} hour ago",
  timeHoursAgoPlural: "{count} hours ago",
  timeYesterday: "Yesterday",
  timeDaysAgo: "{count} days ago",
  timeRecent: "Recent",

  // Table Headers
  thIndex: "#",
  thNotificationEvent: "Notification & Event",
  thCategory: "Category",
  thTime: "Time",
  thStatus: "Status",
  thActions: "Actions",

  // Empty & Loading
  loadingNotifs: "Fetching real notifications from database...",
  noNotificationsFound: "No {category} notifications found",
  allCaughtUp: "You are all caught up with recent database events!",

  // Actions & Tooltips
  tooltipViewDetails: "View Details",
  tooltipMarkRead: "Mark as Read",
  tooltipDelete: "Delete",
  paginationLabel: "notifications",

  // Confirmations & Alerts
  markAllConfirmTitle: "Mark All as Read",
  markAllConfirmMsg: "Are you sure you want to mark all notifications as read?",
  markAllConfirmBtn: "Mark All Read",
  deleteConfirmTitle: "Delete Notification",
  deleteConfirmMsg: "Are you sure you want to permanently remove this notification?",
  deleteConfirmBtn: "Delete",
  deleteSuccess: "Notification deleted.",
  clearAllConfirmTitle: "Clear All Notifications",
  clearAllConfirmMsg: "Are you sure you want to delete all notifications? This cannot be undone.",
  clearAllConfirmBtn: "Clear All",
  clearAllSuccess: "All notifications cleared.",

  // Modal Details
  modalTitle: "Notification Details",
  closeModal: "Close",
  goToPage: "Go to Page",
  incidentParams: "Security Incident Parameters",
  targetAccount: "Target Account",
  sourceIP: "Source IP",
  failedAttempts: "Failed Attempts",
  failedTries: "{count} Failed Tries",
  clientUserAgent: "Client User Agent",
  eventData: "Event Data",
  noDescription: "No additional description provided.",
};

export default Notifications;
