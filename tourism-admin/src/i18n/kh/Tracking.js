const Tracking = {
  // Header
  title: "តាមដានអ្នកប្រើប្រាស់",
  subtitle: "តាមដានប្រវត្តិ CRUD ការកែប្រែ និងការលុបធាតុនានាទូទាំងតួនាទីទាំងអស់ក្នុងប្រព័ន្ធ",
  exportPdfBtn: "PDF",
  exportPdfTitle: "នាំចេញសកម្មភាពជា PDF",
  exportExcelBtn: "Excel",
  exportExcelTitle: "នាំចេញសកម្មភាពជា Excel",

  // Stats
  statTotalOperations: "ប្រតិបត្តិការសរុប",
  subtextTotalOperations: "សកម្មភាពបុគ្គលិក និងអាជីវកម្មដែលបានតាមដាន",
  statAdminStaff: "បុគ្គលិកអ្នកគ្រប់គ្រង",
  subtextAdminStaff: "ការអនុម័ត ការកែសម្រួល និងការលុបធាតុនានា",
  statContentEditors: "អ្នកកែសម្រួលមាតិកា",
  subtextContentEditors: "ទីកន្លែង ព្រឹត្តិការណ៍ និងមេឌៀដែលបានកែប្រែ",
  statBusinessOwners: "ម្ចាស់អាជីវកម្ម",
  subtextBusinessOwners: "ការកែប្រែប្រវត្តិរូប និងស្ថានភាពការកក់",

  // Toolbar
  allActivities: "សកម្មភាពទាំងអស់",
  pillCount: "{count} សកម្មភាព",
  pillCountSingle: "១ សកម្មភាព",
  
  // Role filter options
  roleAll: "តួនាទីទាំងអស់",
  roleAdmin: "បុគ្គលិកអ្នកគ្រប់គ្រង",
  roleGuideEditor: "អ្នកកែសម្រួលមាតិកា",
  roleBusinessOwner: "ម្ចាស់អាជីវកម្ម",

  // Action filter options
  actionAll: "សកម្មភាពទាំងអស់",
  actionCreate: "បានបង្កើត (ធាតុថ្មី)",
  actionUpdate: "បានកែប្រែ (ការកែសម្រួល)",
  actionDelete: "បានលុប (ការដកចេញ)",
  actionApprove: "បានអនុម័ត និងផ្ទៀងផ្ទាត់",
  actionReject: "បានបដិសេធ និងផ្អាក",
  actionAuth: "ការចូលប្រើ និងសម័យប្រជុំ",

  // Timeframe filter options
  periodAll: "គ្រប់ពេលវេលា",
  periodToday: "ថ្ងៃនេះ",
  period7d: "៧ ថ្ងៃចុងក្រោយ",
  period30d: "៣០ ថ្ងៃចុងក្រោយ",

  // Table Headers
  thIndex: "#",
  thUser: "អ្នកប្រើប្រាស់",
  thRole: "តួនាទី",
  thAction: "សកម្មភាព",
  thTargetItem: "ធាតុគោលដៅ",
  thDescription: "ការពិពណ៌នា",
  thDateTime: "កាលបរិច្ឆេទ និងម៉ោង",
  thActions: "សកម្មភាព",

  // Relative Time
  timeJustNow: "ទើបតែឥឡូវនេះ",
  timeMinAgo: "{min} នាទីមុន",
  timeHrAgo: "{hr} ម៉ោងមុន",
  timeYesterday: "ម្សិលមិញ",
  timeDaysAgo: "{days} ថ្ងៃមុន",

  // Tooltips & Labels
  staffUser: "អ្នកប្រើប្រាស់បុគ្គលិក",
  tooltipViewDetails: "មើលព័ត៌មានលម្អិត",
  tooltipDeleteRecord: "លុបកំណត់ត្រាសកម្មភាព",
  noActivitiesFound: "រកមិនឃើញសកម្មភាពទេ",
  tryAdjustingFilter: "សូមសាកល្បងកែប្រែលក្ខខណ្ឌស្វែងរក ឬតម្រងតួនាទីរបស់អ្នក",
  loadingRecords: "កំពុងផ្ទុកកំណត់ត្រាសកម្មភាពអ្នកប្រើប្រាស់...",
  paginationLabel: "សកម្មភាព",

  // Details Modal
  detailsTitle: "ព័ត៌មានលម្អិតកំណត់ត្រាសកម្មភាព",
  detailsSubtitle: "កំណត់ត្រា #{id} • ប្រវត្តិសកម្មភាពអ្នកប្រើប្រាស់",
  labelUserInitiator: "អ្នកប្រើប្រាស់ / អ្នកផ្តួចផ្តើម",
  systemGuest: "ប្រព័ន្ធ / ភ្ញៀវ",
  labelRole: "តួនាទី៖",
  guest: "ភ្ញៀវ",
  labelOperationItem: "ប្រតិបត្តិការ និងធាតុ",
  labelTarget: "គោលដៅ៖",
  platform: "ប្រព័ន្ធ",
  labelActionDescription: "ការពិពណ៌នាសកម្មភាព",
  noDescription: "មិនមានការពិពណ៌នាលម្អិតអំពីការផ្លាស់ប្តូរត្រូវបានផ្តល់ជូនទេ។",
  labelIpAddress: "អាសយដ្ឋាន IP",
  labelTimestamp: "កាលបរិច្ឆេទ និងម៉ោង",
  labelClientUserAgent: "កម្មវិធីរុករករបស់អ្នកប្រើប្រាស់ (User Agent)",
  labelStateChanges: "ការផ្លាស់ប្តូរស្ថានភាព (Payload Diff)",
  labelPreviousValues: "តម្លៃមុនពេលកែប្រែ",
  labelUpdatedValues: "តម្លៃថ្មីបន្ទាប់ពីកែប្រែ",
  btnClose: "បិទ",

  // Modal (Super Admin / Note)
  modalEditTitle: "កែសម្រួលកំណត់ចំណាំសកម្មភាព",
  modalCreateTitle: "កត់ត្រាសកម្មភាព Super Admin",
  modalEditSubtitle: "ធ្វើបច្ចុប្បន្នភាពការពិពណ៌នា ឬកំណត់ចំណាំសម្រាប់កំណត់ត្រានេះ",
  modalCreateSubtitle: "កត់ត្រាសកម្មភាពរបស់អ្នកគ្រប់គ្រងជាន់ខ្ពស់ដោយដៃ",
  labelActionName: "ឈ្មោះសកម្មភាព / កូដ *",
  labelTargetEntityType: "ប្រភេទធាតុគោលដៅ",
  labelTargetItemId: "លេខសម្គាល់ធាតុគោលដៅ (ជម្រើស)",
  labelDescriptionNote: "ការពិពណ៌នា / កំណត់ចំណាំសកម្មភាព *",
  placeholderDescription: "ពិពណ៌នាអំពីព័ត៌មានលម្អិតនៃសកម្មភាព ឬការកែប្រែធាតុ...",
  btnCancel: "បោះបង់",
  btnSaveChanges: "រក្សាទុកការផ្លាស់ប្តូរ",
  btnRecordAction: "កត់ត្រាសកម្មភាព",

  // Confirmations & Alerts
  deleteConfirmTitle: "លុបកំណត់ត្រាសកម្មភាព",
  deleteConfirmMsg: "តើអ្នកពិតជាចង់លុបកំណត់ត្រាសកម្មភាព #{id} ({action}) ជាអចិន្ត្រៃយ៍មែនទេ?\n\nសកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។",
  deleteConfirmBtn: "លុបកំណត់ត្រា",
  deleteSuccess: "កំណត់ត្រាសកម្មភាពត្រូវបានលុបជាអចិន្ត្រៃយ៍។",
  deleteSuccessTitle: "បានលុបកំណត់ត្រា",
  deleteFailed: "មិនអាចលុបកំណត់ត្រាបានទេ។",

  exportFailedTitle: "ការនាំចេញបានបរាជ័យ",
  noRecordsToExport: "រកមិនឃើញកំណត់ត្រាសម្រាប់នាំចេញទេ។",
  
  exportPdfConfirmTitle: "ការបញ្ជាក់ការនាំចេញរបាយការណ៍ PDF",
  exportPdfConfirmMsg: "តើអ្នកពិតជាចង់នាំចេញទិន្នន័យ \"ការតាមដានអ្នកប្រើប្រាស់\" ({count} ធាតុ) ជាឯកសារ PDF មែនទេ?",
  exportPdfConfirmBtn: "នាំចេញជា PDF",
  exportPdfDocTitle: "របាយការណ៍ប្រវត្តិតាមដានសកម្មភាពអ្នកប្រើប្រាស់",
  exportPdfDocSubtitle: "ប្រតិបត្តិការ CRUD និងប្រវត្តិនៃសកម្មភាពរបស់អ្នកប្រើប្រាស់ទូទាំងតួនាទីទាំងអស់ក្នុងប្រព័ន្ធ ({count} កំណត់ត្រា)។",
  exportPdfSuccess: "ទិន្នន័យ \"ការតាមដានអ្នកប្រើប្រាស់\" ({count} ធាតុ) ត្រូវបាននាំចេញជា PDF ដោយជោគជ័យ។",
  exportPdfSuccessTitle: "បាននាំចេញជា PDF ដោយជោគជ័យ",
  exportPdfFailed: "មិនអាចបង្កើតឯកសាររបាយការណ៍ PDF បានទេ។",

  exportExcelConfirmTitle: "ការបញ្ជាក់ការនាំចេញតារាង Excel",
  exportExcelConfirmMsg: "តើអ្នកពិតជាចង់នាំចេញទិន្នន័យ \"ការតាមដានអ្នកប្រើប្រាស់\" ({count} ធាតុ) ជាតារាង Excel មែនទេ?",
  exportExcelConfirmBtn: "នាំចេញជា Excel",
  exportExcelSheetName: "ការតាមដានអ្នកប្រើប្រាស់",
  exportExcelSuccess: "ទិន្នន័យ \"ការតាមដានអ្នកប្រើប្រាស់\" ({count} ធាតុ) ត្រូវបាននាំចេញជា Excel ដោយជោគជ័យ។",
  exportExcelSuccessTitle: "បាននាំចេញជា Excel ដោយជោគជ័យ",
  exportExcelFailed: "មិនអាចបង្កើតតារាង Excel បានទេ។",
};

export default Tracking;
