const Users = {
  // Header
  title: "អ្នកប្រើប្រាស់",
  subtitle: "គ្រប់គ្រង និងតាមដានអ្នកប្រើប្រាស់ប្រព័ន្ធទាំងអស់",
  addUserBtn: "បន្ថែមអ្នកប្រើប្រាស់ថ្មី",

  // Stats
  statTotalUsers: "អ្នកប្រើប្រាស់ចុះឈ្មោះសរុប",
  subtextTotalUsers: "គណនីភ្ញៀវទេសចរ និងបុគ្គលិក",
  statActiveAccounts: "គណនីសកម្ម",
  subtextActiveAccounts: "{pct}% ការចូលរួមយ៉ាងសកម្ម",
  statInactiveAccounts: "អសកម្ម / ផ្អាកដំណើរការ",
  subtextInactiveAccounts: "គណនីសមាជិកដែលអសកម្ម",
  statAdmins: "អ្នកគ្រប់គ្រងប្រព័ន្ធ",
  subtextAdmins: "សិទ្ធិចូលដំណើរការប្រព័ន្ធពេញលេញ",

  // Toolbar
  allUsers: "អ្នកប្រើប្រាស់ទាំងអស់",
  pillCount: "{count} អ្នកប្រើប្រាស់",
  pillCountSingle: "១ អ្នកប្រើប្រាស់",
  tabAllUsers: "អ្នកប្រើប្រាស់ទាំងអស់",
  tabAdminStaff: "បុគ្គលិកអ្នកគ្រប់គ្រង",
  allRoles: "តួនាទីទាំងអស់",
  allStatuses: "ស្ថានភាពទាំងអស់",

  // Roles
  roleSuperAdmin: "Super Admin",
  roleAdmin: "Admin",
  roleGuideEditor: "អ្នកកែសម្រួលមាតិកាទេសចរណ៍",
  roleBusinessOwner: "ម្ចាស់អាជីវកម្ម",
  roleUser: "អ្នកប្រើប្រាស់ទូទៅ",
  roleTourist: "ភ្ញៀវទេសចរ",

  // Statuses
  statusActive: "សកម្ម",
  statusInactive: "អសកម្ម",
  statusSuspended: "បានផ្អាក",
  statusOnline: "លើបណ្តាញ",
  statusOffline: "ក្រៅបណ្តាញ",

  // Table & List Headers
  thIndex: "#",
  thUser: "អ្នកប្រើប្រាស់",
  thRole: "តួនាទី",
  thStatus: "ស្ថានភាព",
  thLastActive: "សកម្មភាពចុងក្រោយ",
  thPhone: "លេខទូរស័ព្ទ",
  thActions: "សកម្មភាព",

  // Actions & Tooltips
  tooltipViewDetails: "មើលព័ត៌មានលម្អិត",
  tooltipEditUser: "កែសម្រួលអ្នកប្រើប្រាស់",
  tooltipDeleteUser: "លុបអ្នកប្រើប្រាស់",
  tooltipSuperAdminProtected: "មានតែ Super Admin ប៉ុណ្ណោះដែលអាចកែប្រែគណនី Super Admin បាន",
  tooltipSuperAdminProtectedDelete: "មានតែ Super Admin ប៉ុណ្ណោះដែលអាចលុបគណនី Super Admin បាន",

  // Empty & Loading
  loadingUsers: "កំពុងផ្ទុកគណនីអ្នកប្រើប្រាស់...",
  noUsersFound: "រកមិនឃើញអ្នកប្រើប្រាស់ទេ",
  tryAdjustingFilter: "សូមសាកល្បងកែប្រែលក្ខខណ្ឌស្វែងរក ឬតម្រងរបស់អ្នក",
  paginationLabel: "អ្នកប្រើប្រាស់",

  // Grid View
  reviewsCount: "ការវាយតម្លៃ",
  favoritesCount: "ចំណូលចិត្ត",
  placesCount: "ទីកន្លែង",
  subFree: "ឥតគិតថ្លៃ",
  subBasic: "កម្រិតមូលដ្ឋាន",
  subPremium: "កម្រិតពិសេស",

  // Details Modal
  detailsModalTitle: "ព័ត៌មានលម្អិតគណនីអ្នកប្រើប្រាស់",
  labelFullName: "ឈ្មោះពេញ",
  badgeVerified: "បានផ្ទៀងផ្ទាត់",
  labelEmail: "អ៊ីមែល",
  labelPhone: "លេខទូរស័ព្ទ",
  labelRoleStatus: "តួនាទី និងស្ថានភាព",
  labelSubscription: "កញ្ចប់សមាជិកភាព",
  labelLocationActivity: "ទីតាំង និងសកម្មភាព",
  lastActiveLabel: "សកម្មភាពចុងក្រោយ៖ {time}",
  timeJustNow: "ទើបតែឥឡូវនេះ",
  timeOnlineNow: "លើបណ្តាញឥឡូវនេះ",
  btnClose: "បិទ",
  btnEditUser: "កែសម្រួលអ្នកប្រើប្រាស់",

  // Create / Edit User Modal
  modalAddTitle: "បង្កើតគណនីអ្នកប្រើប្រាស់ថ្មី",
  modalEditTitle: "កែសម្រួលគណនីអ្នកប្រើប្រាស់",
  modalAddSubtitle: "បន្ថែមអ្នកប្រើប្រាស់ថ្មីជាមួយនឹងតួនាទីដែលបានកំណត់ក្នុងប្រព័ន្ធ។",
  modalEditSubtitle: "ធ្វើបច្ចុប្បន្នភាពតួនាទីប្រព័ន្ធ ព័ត៌មានប្រវត្តិរូប និងការអនុញ្ញាត។",
  superAdminProtected: "ត្រូវបានការពារដោយ Super Admin",
  superAdminProtectedMsg: "មានតែ Super Admin ប៉ុណ្ណោះដែលអាចកែប្រែគណនី Super Admin បាន។",
  uploadPhoto: "បញ្ចូលរូបភាព",
  uploading: "កំពុងបញ្ចូល...",
  removePhoto: "លុបរូបភាព",
  avatarHelp: "PNG, JPG, WEBP ទំហំអតិបរមា 5MB",
  labelFullNameReq: "ឈ្មោះពេញ *",
  placeholderFullName: "ឧ. សុភា ទេសចរ",
  labelEmailReq: "អាសយដ្ឋានអ៊ីមែល *",
  placeholderEmail: "user@example.com",
  placeholderPhone: "+855 12 345 678",
  labelLocationReq: "ទីតាំង / ខេត្ត",
  placeholderLocation: "ឧ. រាជធានីភ្នំពេញ",
  labelPasswordReq: "ពាក្យសម្ងាត់ *",
  labelPasswordEdit: "ពាក្យសម្ងាត់ថ្មី (ទុកនៅទំនេរប្រសិនបើមិនផ្លាស់ប្តូរ)",
  placeholderPassword: "បញ្ចូលពាក្យសម្ងាត់ (យ៉ាងតិច ៦ តួអក្សរ)",
  placeholderPasswordEdit: "បញ្ចូលពាក្យសម្ងាត់ថ្មីប្រសិនបើចង់ផ្លាស់ប្តូរ",
  labelRoleReq: "តួនាទីក្នុងប្រព័ន្ធ *",
  labelStatusReq: "ស្ថានភាពគណនី *",
  btnCancel: "បោះបង់",
  btnSaveChanges: "រក្សាទុកការផ្លាស់ប្តូរ",
  btnCreateUser: "បង្កើតអ្នកប្រើប្រាស់",

  // Alerts & Confirmations
  validationErrorRequired: "សូមបញ្ចូលឈ្មោះពេញ និងអាសយដ្ឋានអ៊ីមែល។",
  cannotDeleteOwnAccount: "អ្នកមិនអាចលុបគណនីផ្ទាល់ខ្លួនដែលកំពុងចូលប្រើប្រាស់បានទេ។",
  actionBlocked: "សកម្មភាពត្រូវបានរារាំង",
  superAdminDeleteDenied: "មានតែ Super Admin ប៉ុណ្ណោះដែលអាចលុបគណនី Super Admin បាន។",
  superAdminEditDenied: "មានតែ Super Admin ប៉ុណ្ណោះដែលអាចកែប្រែគណនី Super Admin បាន។",
  accessDenied: "ការចូលដំណើរការត្រូវបានបដិសេធ",
  deleteConfirmTitle: "លុបគណនីអ្នកប្រើប្រាស់",
  deleteConfirmMsg: "តើអ្នកពិតជាចង់លុបគណនីអ្នកប្រើប្រាស់ \"{name}\" ({email}) ជាអចិន្ត្រៃយ៍មែនទេ?\n\nសកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។",
  deleteConfirmBtn: "លុបអ្នកប្រើប្រាស់",
  deleteSuccess: "គណនីអ្នកប្រើប្រាស់ \"{name}\" ត្រូវបានលុបដោយជោគជ័យ។",
  deleteSuccessTitle: "បានលុបអ្នកប្រើប្រាស់",
  deleteFailed: "មិនអាចលុបអ្នកប្រើប្រាស់បានទេ។",
  createSuccess: "គណនីអ្នកប្រើប្រាស់ \"{name}\" ត្រូវបានបង្កើតដោយជោគជ័យ។",
  createSuccessTitle: "បានបង្កើតអ្នកប្រើប្រាស់",
  updateSuccess: "គណនីអ្នកប្រើប្រាស់ \"{name}\" ត្រូវបានកែសម្រួលដោយជោគជ័យ។",
  updateSuccessTitle: "បានកែសម្រួលអ្នកប្រើប្រាស់",
  saveFailed: "មិនអាចរក្សាទុកទិន្នន័យអ្នកប្រើប្រាស់បានទេ។",
};

export default Users;
