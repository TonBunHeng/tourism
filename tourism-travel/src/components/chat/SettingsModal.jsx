import { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Search, 
  Settings as SettingsIcon, 
  User, 
  Sparkles, 
  Info, 
  Sun, 
  Moon, 
  Check, 
  ShieldCheck, 
  Database 
} from 'lucide-react';

const DESTINATIONS_LIST = [
  { id: 'siem_reap', nameEn: 'Siem Reap (Angkor)', nameKm: 'សៀមរាប (អង្គរ)' },
  { id: 'phnom_penh', nameEn: 'Phnom Penh', nameKm: 'ភ្នំពេញ' },
  { id: 'kampot', nameEn: 'Kampot & Kep', nameKm: 'កំពត និង កែប' },
  { id: 'islands', nameEn: 'Koh Rong & Islands', nameKm: 'កោះរ៉ុង និង កោះកែប' },
];

const TRAVEL_STYLES_LIST = [
  { id: 'cultural', nameEn: 'Cultural & Heritage', nameKm: 'វប្បធម៌ និង បេតិកភណ្ឌ' },
  { id: 'foodie', nameEn: 'Food & Culinary', nameKm: 'ម្ហូបអាហារ និង ភេសជ្ជៈ' },
  { id: 'adventure', nameEn: 'Nature & Adventure', nameKm: 'ធម្មជាតិ និង ផ្សងព្រេង' },
  { id: 'luxury', nameEn: 'Relaxation & Resorts', nameKm: 'លំហែកាយ និង សម្រាក' },
];

const SETTINGS_TABS = [
  { id: 'general', labelEn: 'General', labelKm: 'ទូទៅ', icon: SettingsIcon },
  { id: 'profile', labelEn: 'Account', labelKm: 'គណនី', icon: User },
  { id: 'travel', labelEn: 'Personalization', labelKm: 'ចំណូលចិត្តផ្ទាល់ខ្លួន', icon: Sparkles },
  { id: 'about', labelEn: 'About', labelKm: 'អំពីប្រព័ន្ធ', icon: Info },
];

export default function SettingsModal({
  isOpen = false,
  language = 'en',
  userProfile = {
    name: 'Traveler',
    email: '',
    travelStyle: 'cultural',
    preferredDestinations: ['siem_reap'],
  },
  isDarkMode = false,
  onClose,
  onUpdateLanguage,
  onUpdateProfile,
  onToggleTheme,
}) {
  const [activeTab, setActiveTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const isKm = language === 'km';

  const destinationsList = DESTINATIONS_LIST;
  const travelStylesList = TRAVEL_STYLES_LIST;

  const filteredTabs = useMemo(() => {
    if (!searchQuery.trim()) return SETTINGS_TABS;
    const q = searchQuery.toLowerCase();
    return SETTINGS_TABS.filter((t) => t.labelEn.toLowerCase().includes(q) || t.labelKm.includes(q));
  }, [searchQuery]);

  const handleUpdate = (field, val) => {
    if (onUpdateProfile) {
      onUpdateProfile({
        ...userProfile,
        [field]: val,
      });
    }
  };

  const toggleDestination = (destId) => {
    const current = userProfile?.preferredDestinations || [];
    const next = current.includes(destId)
      ? current.filter((d) => d !== destId)
      : [...current, destId];
    handleUpdate('preferredDestinations', next);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose && onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#18181b] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-[#27272a] w-full max-w-[680px] h-[520px] max-h-[88vh] flex flex-col sm:flex-row overflow-hidden"
      >
        {/* Left Tabs Column */}
        <div className="w-full sm:w-[220px] bg-slate-50 dark:bg-[#141416] border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-[#27272a] p-3 flex flex-col shrink-0">
          <div className="flex items-center space-x-2 pb-2 mb-2 border-b border-slate-200/80 dark:border-[#27272a]">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-[#27272a] transition-colors cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {isKm ? 'ការកំណត់' : 'Settings'}
            </span>
          </div>

          {/* Search Settings input */}
          <div className="relative mb-2">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isKm ? 'ស្វែងរក...' : 'Search settings'}
              className="w-full pl-8 pr-2.5 py-1.5 bg-white dark:bg-[#1f1f23] border border-slate-200 dark:border-[#27272a] rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
            />
          </div>

          {/* Tabs List */}
          <div className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible">
            {filteredTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer shrink-0 sm:w-full ${
                    isSelected
                      ? 'bg-slate-200/80 dark:bg-[#27272a] text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-[#27272a]/50'
                  }`}
                >
                  <TabIcon size={15} />
                  <span>{isKm ? tab.labelKm : tab.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Tab Content Panel */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white dark:bg-[#18181b] text-slate-900 dark:text-slate-100">
          
          {/* 1. GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-sm sm:text-base mb-1">
                  {isKm ? 'រូបរាង និងស្បែកពណ៌' : 'Appearance'}
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  {isKm ? 'ជ្រើសរើសស្បែកពណ៌ភ្លឺ ឬងងឹត' : 'Customize theme mode'}
                </p>

                <div className="grid grid-cols-2 gap-3 max-w-xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (isDarkMode && onToggleTheme) onToggleTheme();
                    }}
                    className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      !isDarkMode
                        ? 'border-[#002D62] dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-[#002D62] dark:text-blue-400 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <Sun size={15} />
                    <span>Light Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isDarkMode && onToggleTheme) onToggleTheme();
                    }}
                    className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isDarkMode
                        ? 'border-[#002D62] dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-[#002D62] dark:text-blue-400 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <Moon size={15} />
                    <span>Dark Mode</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm sm:text-base mb-1">
                  {isKm ? 'ភាសាប្រព័ន្ធ' : 'Language'}
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  {isKm ? 'ជ្រើសរើសភាសាសម្រាប់ឆ្លើយតប' : 'Select your preferred assistant language'}
                </p>

                <div className="grid grid-cols-2 gap-3 max-w-xs">
                  <button
                    type="button"
                    onClick={() => onUpdateLanguage && onUpdateLanguage('en')}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      language === 'en'
                        ? 'border-[#002D62] dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-[#002D62] dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <Check size={14} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateLanguage && onUpdateLanguage('km')}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      language === 'km'
                        ? 'border-[#002D62] dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-[#002D62] dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span>ភាសាខ្មែរ</span>
                    {language === 'km' && <Check size={14} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm sm:text-base mb-1">
                {isKm ? 'ព័ត៌មានគណនី' : 'Account Details'}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {isKm ? 'ព័ត៌មាននេះជួយឱ្យ AI ស្គាល់អ្នកកាន់តែច្បាស់' : 'Information used to personalize responses'}
              </p>

              <div className="space-y-3 max-w-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKm ? 'ឈ្មោះអ្នកដំណើរ' : 'Traveler Name'}
                  </label>
                  <input
                    type="text"
                    value={userProfile.name || ''}
                    onChange={(e) => handleUpdate('name', e.target.value)}
                    placeholder="e.g. Bunheng"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isKm ? 'អ៊ីមែល' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={userProfile.email || ''}
                    onChange={(e) => handleUpdate('email', e.target.value)}
                    placeholder="traveler@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. PERSONALIZATION TAB */}
          {activeTab === 'travel' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-sm sm:text-base mb-1">
                  {isKm ? 'រចនាប័ទ្មដំណើរកម្សាន្ត' : 'Travel Style'}
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  {isKm ? 'ជ្រើសរើសចំណូលចិត្តចម្បងរបស់អ្នក' : 'Your primary travel interest'}
                </p>

                <div className="grid grid-cols-2 gap-2 max-w-md">
                  {travelStylesList.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => handleUpdate('travelStyle', style.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                        userProfile.travelStyle === style.id
                          ? 'border-[#002D62] dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-[#002D62] dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {isKm ? style.nameKm : style.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm sm:text-base mb-1">
                  {isKm ? 'គោលដៅទេសចរណ៍ដែលចាប់អារម្មណ៍' : 'Preferred Destinations'}
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  {isKm ? 'ជ្រើសរើសតំបន់ដែលអ្នកចង់ទៅទស្សនា' : 'Select top Cambodian destinations'}
                </p>

                <div className="grid grid-cols-2 gap-2 max-w-md">
                  {destinationsList.map((dest) => {
                    const isSelected = (userProfile.preferredDestinations || []).includes(dest.id);
                    return (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => toggleDestination(dest.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#002D62] dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-[#002D62] dark:text-blue-400'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <span>{isKm ? dest.nameKm : dest.nameEn}</span>
                        {isSelected && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 4. ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                  AV
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    AngkorVers AI Assistant
                  </h4>
                  <span className="text-[11px] text-slate-500">Version 1.0.0 • Online Mode</span>
                </div>
              </div>

              <div className="space-y-2.5 leading-relaxed text-slate-600 dark:text-slate-300">
                <p>
                  {isKm
                    ? 'AngkorVers AI គឺជាជំនួយការសិប្បនិម្មិតកម្រិតខ្ពស់សម្រាប់ទេសចរណ៍ វប្បធម៌ និងចំណេះដឹងទូទៅនៃព្រះរាជាណាចក្រកម្ពុជា។'
                    : "Cambodia's Advanced AI Assistant for Tourism, Code, Knowledge & Culture."}
                </p>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center space-x-2 font-semibold text-slate-800 dark:text-zinc-200">
                    <Database size={13} className="text-[#003E83] dark:text-blue-400" />
                    <span>Cambodia Tourism Official Database</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Features real-time weather integration, live USD-to-KHR currency rates, 25 Cambodian provinces, official temple admission guides, and AI grounding.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center space-x-2 font-semibold text-slate-800 dark:text-zinc-200">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    <span>Powered by Cloud AI models (Online Only)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Streaming Server-Sent Events (SSE) enabled with real-time response generation and offline backup engine.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
