const Notifications = {
  // Header
  title: "ការជូនដំណឹង",
  subtitle: "បច្ចុប្បន្នភាពជាក់ស្តែងសម្រាប់ការប្រកាសអាសន្នសន្តិសុខ ការវាយតម្លៃរបស់ភ្ញៀវទេសចរ សារ និងព្រឹត្តិការណ៍ប្រព័ន្ធ",
  markAllRead: "សម្គាល់ថាបានអានទាំងអស់",
  clearAll: "សម្អាតទាំងអស់",

  // Stats
  statTotal: "ការជូនដំណឹងសរុប",
  subtextTotal: "ព្រឹត្តិការណ៍ប្រព័ន្ធដែលបានកត់ត្រា",
  statUnread: "ការប្រកាសអាសន្នមិនទាន់អាន",
  subtextUnreadAllRead: "បានអានការជូនដំណឹងទាំងអស់",
  subtextUnreadCount: "{count} ត្រូវការការយកចិត្តទុកដាក់",
  statReviews: "ការវាយតម្លៃ និងមតិកែលម្អ",
  subtextReviews: "ពិន្ទុ និងមតិយោបល់របស់ភ្ញៀវទេសចរ",
  statSecurity: "សន្តិសុខ និងប្រព័ន្ធ",
  subtextSecurity: "កំណត់ត្រា និងការប្រកាសអាសន្នហេដ្ឋារចនាសម្ព័ន្ធ",

  // Toolbar
  sectionTitle: "ការជូនដំណឹងទាំងអស់",
  pillCount: "{count} ការជូនដំណឹង",
  pillCountSingle: "១ ការជូនដំណឹង",
  allCategories: "ប្រភេទទាំងអស់",
  allStatus: "ស្ថានភាពទាំងអស់",
  unreadOnly: "មិនទាន់អានតែប៉ុណ្ណោះ ({count})",
  readStatus: "បានអាន / ទទួលស្គាល់",

  // Categories
  catAll: "ទាំងអស់",
  catAlerts: "ការប្រកាសអាសន្ន",
  catReviews: "ការវាយតម្លៃ",
  catMessages: "សារ",
  catUsers: "អ្នកប្រើប្រាស់",
  catSystem: "ប្រព័ន្ធ",
  catGeneral: "ទូទៅ",

  // Status Badges & Times
  badgeUnread: "មិនទាន់អាន",
  badgeRead: "បានអាន",
  timeJustNow: "ទើបតែឥឡូវនេះ",
  timeMinsAgo: "{count} នាទីមុន",
  timeMinsAgoPlural: "{count} នាទីមុន",
  timeHoursAgo: "{count} ម៉ោងមុន",
  timeHoursAgoPlural: "{count} ម៉ោងមុន",
  timeYesterday: "ម្សិលមិញ",
  timeDaysAgo: "{count} ថ្ងៃមុន",
  timeRecent: "ថ្មីៗ",

  // Table Headers
  thIndex: "#",
  thNotificationEvent: "ការជូនដំណឹង និងព្រឹត្តិការណ៍",
  thCategory: "ប្រភេទ",
  thTime: "ពេលវេលា",
  thStatus: "ស្ថានភាព",
  thActions: "សកម្មភាព",

  // Empty & Loading
  loadingNotifs: "កំពុងទាញយកការជូនដំណឹងពីមូលដ្ឋានទិន្នន័យ...",
  noNotificationsFound: "រកមិនឃើញការជូនដំណឹង {category} ទេ",
  allCaughtUp: "អ្នកបានពិនិត្យមើលព្រឹត្តិការណ៍ថ្មីៗទាំងអស់រួចរាល់ហើយ!",

  // Actions & Tooltips
  tooltipViewDetails: "មើលព័ត៌មានលម្អិត",
  tooltipMarkRead: "សម្គាល់ថាបានអាន",
  tooltipDelete: "លុប",
  paginationLabel: "ការជូនដំណឹង",

  // Confirmations & Alerts
  markAllConfirmTitle: "សម្គាល់ថាបានអានទាំងអស់",
  markAllConfirmMsg: "តើអ្នកពិតជាចង់សម្គាល់ការជូនដំណឹងទាំងអស់ថាបានអានមែនទេ?",
  markAllConfirmBtn: "សម្គាល់ថាបានអានទាំងអស់",
  deleteConfirmTitle: "លុបការជូនដំណឹង",
  deleteConfirmMsg: "តើអ្នកពិតជាចង់លុបការជូនដំណឹងនេះជាអចិន្ត្រៃយ៍មែនទេ?",
  deleteConfirmBtn: "លុប",
  deleteSuccess: "បានលុបការជូនដំណឹងដោយជោគជ័យ។",
  clearAllConfirmTitle: "សម្អាតការជូនដំណឹងទាំងអស់",
  clearAllConfirmMsg: "តើអ្នកពិតជាចង់លុបការជូនដំណឹងទាំងអស់មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។",
  clearAllConfirmBtn: "សម្អាតទាំងអស់",
  clearAllSuccess: "បានសម្អាតការជូនដំណឹងទាំងអស់ដោយជោគជ័យ។",

  // Modal Details
  modalTitle: "ព័ត៌មានលម្អិតការជូនដំណឹង",
  closeModal: "បិទ",
  goToPage: "ទៅកាន់ទំព័រ",
  incidentParams: "ប៉ារ៉ាម៉ែត្រឧប្បត្តិហេតុសន្តិសុខ",
  targetAccount: "គណនីគោលដៅ",
  sourceIP: "អាសយដ្ឋាន IP ប្រភព",
  failedAttempts: "ការប៉ុនប៉ងមិនបានសម្រេច",
  failedTries: "ការប៉ុនប៉ងបរាជ័យ {count} ដង",
  clientUserAgent: "កម្មវិធីរុករករបស់អ្នកប្រើប្រាស់ (User Agent)",
  eventData: "ទិន្នន័យព្រឹត្តិការណ៍",
  noDescription: "មិនមានការពិពណ៌នាបន្ថែមត្រូវបានផ្តល់ជូនទេ។",
};

export default Notifications;
