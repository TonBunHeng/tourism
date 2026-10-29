const Deletion = {
  // Header
  title: "សំណើសុំលុបទិន្នន័យ",
  subtitle: "គ្រប់គ្រងសំណើសុំលុបគណនី និងការដកចេញនូវធាតុផ្សេងៗពីអ្នកប្រើប្រាស់",

  // Stats
  statTotalRequests: "សំណើសរុប",
  subtextTotalRequests: "សំបុត្រឯកជនភាព និងការដកចេញដែលបានកត់ត្រា",
  statPendingReviews: "ការពិនិត្យដែលកំពុងរង់ចាំ",
  subtextAllResolved: "សំបុត្រទាំងអស់ត្រូវបានដោះស្រាយ",
  subtextAwaitingAdmin: "{count} សំបុត្រកំពុងរង់ចាំចំណាត់ការរបស់អ្នកគ្រប់គ្រង",
  statAccountDeletions: "ការលុបគណនី",
  subtextAccountDeletions: "សំណើសុំលុបទិន្នន័យ/គណនីរបស់អ្នកប្រើប្រាស់",
  statItemDeletions: "ការលុបធាតុ",
  subtextItemDeletions: "សំណើសុំដកចេញមាតិកាជាក់លាក់",

  // Alert Banner
  alertCriticalTitle: "{count} សំណើបន្ទាន់បំផុតត្រូវការការយកចិត្តទុកដាក់ភ្លាមៗ",
  alertCriticalSubtext: "សំណើទាំងនេះតម្រូវឱ្យមានចំណាត់ការជាបន្ទាន់ដោយសារបញ្ហាសុវត្ថិភាព ឬឯកជនភាព",

  // Toolbar
  allRequests: "សំណើទាំងអស់",
  pillCount: "{count} សំណើ",
  pillCountSingle: "១ សំណើ",
  typeAll: "ប្រភេទទាំងអស់",
  typeAccount: "គណនី",
  typeItem: "ធាតុ",
  statusAll: "ស្ថានភាពទាំងអស់",
  statusPending: "កំពុងរង់ចាំ",
  statusApproved: "បានអនុម័ត",
  statusRejected: "បានបដិសេធ",
  statusArchived: "បានរក្សាទុកក្នុងបណ្ណសារ",
  urgencyAll: "កម្រិតបន្ទាន់ទាំងអស់",
  urgencyCritical: "បន្ទាន់បំផុត",
  urgencyHigh: "ខ្ពស់",
  urgencyMedium: "មធ្យម",
  urgencyLow: "ទាប",
  sortNewest: "ថ្មីបំផុតមុន",
  sortOldest: "ចាស់បំផុតមុន",
  sortUrgency: "តាមកម្រិតបន្ទាន់",
  btnReset: "កំណត់ឡើងវិញ",
  titleReset: "កំណត់តម្រងទាំងអស់ឡើងវិញ",

  // Table Headers
  thIndex: "#",
  thUserAccount: "អ្នកប្រើប្រាស់ និងគណនី",
  thType: "ប្រភេទ",
  thUrgency: "កម្រិតបន្ទាន់",
  thReason: "មូលហេតុ",
  thStatus: "ស្ថានភាព",
  thActions: "សកម្មភាព",

  // Badge labels
  labelAccountDeletion: "ការលុបគណនី",
  labelItemDeletion: "ការលុបធាតុ",
  userDefault: "អ្នកប្រើប្រាស់",

  // Tooltips
  tooltipViewDetails: "មើលព័ត៌មានលម្អិត",
  tooltipApprove: "អនុម័ត",
  tooltipReject: "បដិសេធ",

  // Empty state & Loading
  noRequestsFound: "រកមិនឃើញសំណើទេ",
  tryAdjustingFilter: "សូមសាកល្បងកែប្រែលក្ខខណ្ឌស្វែងរក ឬតម្រងរបស់អ្នក",
  clearFiltersBtn: "សម្អាតតម្រងទាំងអស់",
  loadingRequests: "កំពុងផ្ទុកសំណើសុំលុបទិន្នន័យពី API...",
  paginationLabel: "សំណើ",

  // Details Modal
  detailsTitle: "ព័ត៌មានលម្អិតនៃសំណើ",
  detailsId: "លេខសម្គាល់៖ #{id}",
  labelUser: "អ្នកប្រើប្រាស់",
  labelRequestType: "ប្រភេទសំណើ",
  labelStatusUrgency: "ស្ថានភាព និងកម្រិតបន្ទាន់",
  labelReason: "មូលហេតុ",
  labelAdditionalInfo: "ព័ត៌មានបន្ថែម",
  labelItemsToDelete: "ធាតុដែលត្រូវលុប",
  labelAdminNotes: "កំណត់ចំណាំរបស់អ្នកគ្រប់គ្រង",
  placeholderAdminNotes: "បន្ថែមកំណត់ចំណាំរបស់អ្នកគ្រប់គ្រង...",
  btnApprove: "អនុម័ត",
  btnReject: "បដិសេធ",
  btnClose: "បិទ",

  // Confirmation Modal
  confirmTitleApprove: "បញ្ជាក់ការអនុម័ត",
  confirmTitleReject: "បញ្ជាក់ការបដិសេធ",
  confirmMessage: "តើអ្នកពិតជាចង់ {action} សំណើ {type} នេះសម្រាប់ {name} មែនទេ?",
  permanentWarning: "សកម្មភាពនេះនឹងដំណើរការការលុបជាអចិន្ត្រៃយ៍។ សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។",
  btnCancel: "បោះបង់",
  btnConfirmApprove: "បញ្ជាក់ការអនុម័ត",
  btnConfirmReject: "បញ្ជាក់ការបដិសេធ",
  actionApproveText: "អនុម័ត",
  actionRejectText: "បដិសេធ",

  // Notifications & Toasts
  approveSuccess: "សំណើសុំលុបត្រូវបានអនុម័ត ហើយធាតុ/គណនីត្រូវបានលុបដោយជោគជ័យ។",
  rejectSuccess: "សំណើសុំលុបត្រូវបានបដិសេធ។",
  approveTitle: "បានអនុម័តសំណើ",
  rejectTitle: "បានបដិសេធសំណើ",
  updateFailed: "មិនអាចធ្វើបច្ចុប្បន្នភាពស្ថានភាពសំណើបានទេ។",
  actionFailedTitle: "សកម្មភាពបានបរាជ័យ",
};

export default Deletion;
