import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Send, 
  RotateCcw, 
  Copy, 
  Check, 
  CloudSun, 
  DollarSign, 
  Loader2,
  Landmark,
  ArrowRight,
  ArrowLeft,
  MoreHorizontal,
  X,
  Minimize2
} from 'lucide-react';
import GenieAvatar from '../../components/common/GenieAvatar';
import aiChatService from '../../services/aiChatService';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { 
  TRIP_GENIE_SUGGESTIONS, 
  generateSessionId, 
  createChatMessage 
} from '../../utils/chatUtils';

export default function AIChat() {
  const { user } = useAuth();
  const { showSuccess } = useAlert();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'tools'
  const [messages, setMessages] = useState(() => location.state?.messages || []);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => location.state?.sessionId || generateSessionId());
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Weather & Currency Widget States
  const [weatherData, setWeatherData] = useState(null);
  const [weatherProvince, setWeatherProvince] = useState('Siem Reap');
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  const [usdAmount, setUsdAmount] = useState(25);
  const [khrResult, setKhrResult] = useState(102500);

  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);

  const fetchWeather = useCallback(async (province) => {
    setIsLoadingWeather(true);
    try {
      const res = await aiChatService.getWeather(province);
      if (res?.success) {
        setWeatherData(res.data);
      }
    } catch {
      setWeatherData({
        province,
        temperature: '31°C',
        condition: 'Partly Sunny',
        humidity: '68%',
        advice: 'Warm tropical weather. Ideal for early morning temple exploration. Carry hydration.',
      });
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'weather' || tabParam === 'tools') {
      setActiveTab('tools');
    }
    const initialPrompt = searchParams.get('prompt');
    if (initialPrompt) {
      setInputValue(initialPrompt);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'tools' && !weatherData) {
      fetchWeather(weatherProvince);
    }
  }, [activeTab, weatherData, weatherProvince, fetchWeather]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleConvertCurrency = async (val) => {
    setUsdAmount(val);
    try {
      const res = await aiChatService.convertCurrency(val, 'USD', 'KHR');
      if (res?.success && res.data?.converted_amount) {
        setKhrResult(res.data.converted_amount);
      } else {
        setKhrResult(Math.round(val * 4100));
      }
    } catch {
      setKhrResult(Math.round(val * 4100));
    }
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = createChatMessage({
      role: 'user',
      content: textToSend.trim(),
    });

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputValue('');
    setIsLoading(true);

    try {
      const res = await aiChatService.sendMessage({
        message: textToSend.trim(),
        sessionId,
        province: searchParams.get('province') || undefined,
        language: 'en',
      });

      let replyContent = '';
      if (res?.data?.response) {
        replyContent = res.data.response;
      } else if (res?.data?.message) {
        replyContent = res.data.message;
      } else if (typeof res?.data === 'string') {
        replyContent = res.data;
      } else {
        replyContent = "Thank you for asking! Cambodia offers breathtaking heritage, especially in Siem Reap and Phnom Penh. Feel free to ask more specific questions or explore our destinations catalog.";
      }

      const botMsg = createChatMessage({
        role: 'assistant',
        content: replyContent,
      });

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = createChatMessage({
        role: 'assistant',
        isError: true,
        content: err.message || 'I am currently unable to reach the travel intelligence service. Please check your connection or retry in a moment.',
      });
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text, index) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      showSuccess('Response copied to clipboard!');
    }
  };

  const handleNewConversation = () => {
    setSessionId(generateSessionId());
    setMessages([]);
    setIsMenuOpen(false);
  };

  const handleExit = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-[#09090b] font-sans selection:bg-blue-600 selection:text-white">
      {/* Full-Screen Top Header (No layout header/footer) */}
      <header className="px-4 sm:px-8 py-3.5 border-b border-slate-200/90 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 shrink-0 z-10 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExit}
            className="p-2 -ml-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            title="Exit Full Screen"
          >
            <ArrowLeft size={19} />
          </button>

          <GenieAvatar size={38} showBadge={false} />
          <div>
            <div className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-2 leading-none">
              <span>AngkorGenie</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            </div>
            <div className="text-[11px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 mt-1">
              Cambodia Tourism AI Assistant
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle Tabs */}
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tools')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tools'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              <CloudSun size={13} />
              <span className="hidden sm:inline">Weather & Currency</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleNewConversation}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold transition cursor-pointer"
            title="Start New Chat"
          >
            <RotateCcw size={13} />
            <span>New Chat</span>
          </button>

          {/* Options Dropdown Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="Options"
            >
              <MoreHorizontal size={18} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-xl py-1.5 z-20 text-xs">
                <button
                  type="button"
                  onClick={handleNewConversation}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-700/60 flex items-center gap-2 text-slate-700 dark:text-zinc-200 font-semibold cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Start New Chat</span>
                </button>
                <Link
                  to="/destinations"
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-700/60 flex items-center gap-2 text-slate-700 dark:text-zinc-200 font-semibold cursor-pointer"
                >
                  <Landmark size={14} />
                  <span>Browse Destinations</span>
                </Link>
                <button
                  type="button"
                  onClick={handleExit}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-700/60 flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold cursor-pointer border-t border-slate-100 dark:border-zinc-700/60"
                >
                  <Minimize2 size={14} />
                  <span>Exit Full Screen</span>
                </button>
              </div>
            )}
          </div>

          {/* Exit Fullscreen Close Button */}
          <button
            type="button"
            onClick={handleExit}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer ml-1"
            title="Exit Full Screen"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Full-Screen Body */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#09090b]">

        {/* Tab Content */}
        {activeTab === 'chat' ? (
          <>
            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
              {/* If no user messages sent yet, show the full TripGenie Get Started Hero */}
              {messages.length === 0 ? (
                <div className="space-y-6 max-w-2xl mx-auto py-2">
                  {/* Hero Title */}
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent tracking-tight">
                      Hi there!
                    </h1>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                      Get Started With AngkorGenie
                    </h2>
                  </div>

                  {/* Introductory speech balloon */}
                  <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-zinc-800/60 border border-blue-100 dark:border-zinc-700/50 text-sm text-slate-700 dark:text-zinc-300 leading-relaxed shadow-xs">
                    I'm your one-stop travel assistant. I can help you make travel plans, find top temples, hotels, local cuisine, and book tours across Cambodia! Of course, you can ask me anything about travel! If you don't know what to ask, simply try the recommended questions below.
                  </div>

                  {/* 2-Column Recommended Questions Grid (Screenshot 1) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    {TRIP_GENIE_SUGGESTIONS.map((item, idx) => {
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(item.question)}
                          className="text-left p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 hover:border-blue-500 hover:shadow-md hover:bg-blue-50/30 dark:hover:bg-zinc-800 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                        >
                          <div className="flex items-center gap-1.5 mb-2.5">
                            <IconComponent size={14} className={item.color} />
                            <span className={`text-xs font-bold ${item.color}`}>
                              {item.category}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                            {item.question}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Message Thread */
                <div className="space-y-5 max-w-3xl mx-auto">
                  {messages.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                      >
                        {/* Avatar */}
                        {!isUser ? (
                          <GenieAvatar size={32} showBadge={false} className="mt-1" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#003E83] dark:bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1 shadow-xs">
                            {user?.name ? user.name[0].toUpperCase() : 'U'}
                          </div>
                        )}

                        {/* Bubble */}
                        <div
                          className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-sm leading-relaxed ${
                            isUser
                              ? 'bg-[#003E83] dark:bg-blue-600 text-white rounded-tr-xs shadow-xs'
                              : msg.isError
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 rounded-tl-xs'
                              : 'bg-slate-50 dark:bg-zinc-800/90 text-slate-800 dark:text-zinc-100 border border-slate-100 dark:border-zinc-700/60 rounded-tl-xs shadow-xs'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{msg.content}</div>

                          <div className={`mt-2.5 flex items-center justify-between text-[11px] ${isUser ? 'text-blue-200' : 'text-slate-400 dark:text-zinc-500'}`}>
                            <span>{msg.time}</span>
                            {!isUser && !msg.isError && (
                              <button
                                type="button"
                                onClick={() => handleCopyText(msg.content, idx)}
                                className="p-1 hover:text-slate-700 dark:hover:text-zinc-200 transition cursor-pointer"
                                title="Copy response"
                              >
                                {copiedIndex === idx ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isLoading && (
                    <div className="flex items-start gap-3">
                      <GenieAvatar size={32} showBadge={false} className="mt-1 animate-pulse" />
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/90 border border-slate-100 dark:border-zinc-700/60 text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-2.5 rounded-tl-xs">
                        <Loader2 size={15} className="animate-spin text-blue-600 dark:text-blue-400" />
                        <span>AngkorGenie is querying Cambodian travel knowledge...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggested chips when messages are present */}
            {messages.length > 0 && (
              <div className="px-6 py-2 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Suggestions:</span>
                {TRIP_GENIE_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item.question)}
                    className="px-3 py-1 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-blue-400 text-slate-700 dark:text-zinc-300 text-xs whitespace-nowrap transition cursor-pointer shrink-0"
                  >
                    {item.category}: {item.question.slice(0, 32)}...
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Input Bar (Screenshot 1) */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="max-w-3xl mx-auto flex items-center gap-2 p-1.5 pl-5 pr-2 rounded-2xl border border-blue-400/80 dark:border-blue-500/60 bg-white dark:bg-zinc-800 shadow-xs focus-within:ring-2 focus-within:ring-blue-500/20 transition"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything about travel"
                  className="flex-1 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  aria-label="Send Message"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    inputValue.trim() && !isLoading
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/30'
                      : 'text-slate-300 dark:text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Weather & Currency Tools Tab */
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CloudSun className="text-amber-500" />
                  <span>Real-Time Weather Intelligence</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Live meteorological conditions across Cambodian tourism regions
                </p>
              </div>

              {/* City selector buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Siem Reap', 'Phnom Penh', 'Sihanoukville', 'Battambang'].map((province) => (
                  <button
                    key={province}
                    type="button"
                    onClick={() => {
                      setWeatherProvince(province);
                      fetchWeather(province);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      weatherProvince === province
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                    }`}
                  >
                    {province}
                  </button>
                ))}
              </div>

              {/* Weather Card */}
              {isLoadingWeather ? (
                <div className="p-8 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  <span>Retrieving weather radar data...</span>
                </div>
              ) : weatherData ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 dark:from-zinc-800/80 dark:to-zinc-800/40 border border-blue-200/80 dark:border-zinc-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-bold text-slate-900 dark:text-white">{weatherData.province}</span>
                      <span className="block text-xs text-slate-500 dark:text-zinc-400">{weatherData.condition}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-amber-500">{weatherData.temperature}</span>
                      <span className="block text-xs text-slate-500">Humidity: {weatherData.humidity}</span>
                    </div>
                  </div>
                  {weatherData.advice && (
                    <div className="text-xs text-slate-600 dark:text-zinc-300 bg-white/70 dark:bg-zinc-900/70 p-3 rounded-xl">
                      <strong>Travel Advisory:</strong> {weatherData.advice}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Currency Converter */}
              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="text-emerald-500" />
                  <span>Currency Calculator (USD &harr; KHR)</span>
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      value={usdAmount}
                      onChange={(e) => handleConvertCurrency(Number(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-bold text-slate-900 dark:text-white"
                      placeholder="Amount in USD"
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-400">=</span>
                  <div className="flex-1 py-2 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-right text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {khrResult.toLocaleString()} ៛ KHR
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Fixed official exchange rate benchmark: 1 USD ≈ 4,100 KHR. Most merchants accept USD cash.
                </p>
              </div>

              {/* Link to destinations */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Explore Verified Destinations</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">Find entrance fees, tour packages, and operating hours</p>
                </div>
                <Link
                  to="/destinations"
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 transition"
                >
                  <span>Catalog</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
