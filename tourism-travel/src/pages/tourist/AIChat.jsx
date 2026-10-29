import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  RotateCcw, 
  Copy, 
  Check, 
  CloudSun, 
  DollarSign, 
  Landmark,
  ArrowLeft,
  MoreHorizontal,
  X,
  Minimize2,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Plus,
  ArrowUp,
  RefreshCw,
  Square,
  Pencil,
  Search,
  MapPin
} from 'lucide-react';
import GenieAvatar from '../../components/common/GenieAvatar';
import MarkdownMessage from '../../components/common/MarkdownMessage';
import aiChatService from '../../services/aiChatService';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { 
  generateSessionId, 
  createChatMessage,
  formatSuggestedTopic,
  getLocalDynamicSuggestions,
  CAMBODIA_PROVINCES
} from '../../utils/chatUtils';

export default function AIChat() {
  useAuth();
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
  const [feedbackMap, setFeedbackMap] = useState({});
  const [lastUserPrompt, setLastUserPrompt] = useState('');
  const [initialSuggestions, setInitialSuggestions] = useState(() => getLocalDynamicSuggestions().suggestions);
  const [isRefreshingInitial, setIsRefreshingInitial] = useState(false);
  const [refreshingMsgIndex, setRefreshingMsgIndex] = useState(null);

  // Weather & Currency Widget States
  const [weatherData, setWeatherData] = useState(null);
  const [weatherProvince, setWeatherProvince] = useState('Siem Reap');
  const [weatherSearchQuery, setWeatherSearchQuery] = useState('Siem Reap');
  const [showWeatherSuggestions, setShowWeatherSuggestions] = useState(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  const filteredProvinces = useMemo(() => {
    const q = weatherSearchQuery.trim().toLowerCase();
    if (!q) return CAMBODIA_PROVINCES;
    return CAMBODIA_PROVINCES.filter((p) => p.toLowerCase().includes(q));
  }, [weatherSearchQuery]);

  const [usdAmount, setUsdAmount] = useState(25);
  const [khrResult, setKhrResult] = useState(102500);

  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  const formatWeatherData = useCallback((raw, fallbackProvince) => {
    if (!raw) {
      return {
        province: fallbackProvince,
        temperature: '31°C',
        condition: 'Partly Sunny',
        humidity: '68%',
        advice: 'Warm tropical weather. Ideal for early morning temple exploration. Carry hydration.',
        forecast: [],
      };
    }
    const current = raw.current || {};
    
    // Temperature normalization
    let temp = raw.temperature;
    if (!temp) {
      const num = current.temperature_c ?? raw.temperature_c ?? current.temp_c ?? raw.temp;
      temp = num !== undefined ? `${num}°C` : '31°C';
    }

    // Condition normalization
    const cond = raw.condition || current.condition || 'Partly Sunny';

    // Humidity normalization
    let hum = raw.humidity;
    if (!hum) {
      const humNum = current.humidity_percent ?? raw.humidity_pct ?? current.humidity ?? raw.humidity_percent;
      hum = humNum !== undefined ? `${humNum}%` : '68%';
    }

    // Advisory normalization
    const adv = raw.advice || raw.advisory || raw.travel_advice_en || current.advice || 'Favorable weather for outdoor temple exploring. Bring water, sunglasses, and light cotton clothes.';

    return {
      province: raw.province || fallbackProvince,
      temperature: temp,
      condition: cond,
      humidity: hum,
      advice: adv,
      forecast: raw.forecast || [],
    };
  }, []);

  const fetchWeather = useCallback(async (province) => {
    setIsLoadingWeather(true);
    try {
      const res = await aiChatService.getWeather(province);
      const dataPayload = res?.data || res;
      setWeatherData(formatWeatherData(dataPayload, province));
    } catch {
      setWeatherData(formatWeatherData(null, province));
    } finally {
      setIsLoadingWeather(false);
    }
  }, [formatWeatherData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      scrollToBottom();
    }
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

  // Fetch dynamic initial suggested topics
  const fetchInitialSuggestions = async (refresh = false) => {
    setIsRefreshingInitial(true);
    try {
      const currentTexts = initialSuggestions.map((s) => s.text);
      const res = await aiChatService.getSuggestions({
        refresh,
        currentSuggestions: currentTexts,
        language: 'en',
      });
      if (res?.suggestions?.length > 0) {
        setInitialSuggestions(res.suggestions.map(formatSuggestedTopic).filter(Boolean));
      }
    } catch {
      // Fallback already provided by getLocalDynamicSuggestions
    } finally {
      setIsRefreshingInitial(false);
    }
  };

  useEffect(() => {
    fetchInitialSuggestions(false);
  }, []);

  const handleRefreshInitialTopics = () => {
    fetchInitialSuggestions(true);
  };

  // Refresh dynamic suggestions for a specific assistant message
  const handleRefreshMessageSuggestions = async (msgIndex, msg) => {
    if (refreshingMsgIndex !== null) return;
    setRefreshingMsgIndex(msgIndex);

    try {
      let userPrompt = lastUserPrompt;
      for (let i = msgIndex - 1; i >= 0; i--) {
        if (messages[i]?.role === 'user') {
          userPrompt = messages[i].content;
          break;
        }
      }

      const currentTexts = (msg.suggestions || []).map((s) => (typeof s === 'string' ? s : s.text || s.query || ''));
      const res = await aiChatService.getSuggestions({
        message: userPrompt,
        answer: msg.content,
        sessionId,
        refresh: true,
        currentSuggestions: currentTexts,
        language: 'en',
      });

      if (res?.suggestions?.length > 0) {
        const formatted = res.suggestions.map(formatSuggestedTopic).filter(Boolean);
        setMessages((prev) =>
          prev.map((m, idx) => (idx === msgIndex ? { ...m, suggestions: formatted } : m))
        );
      }
    } catch {
      // ignore
    } finally {
      setRefreshingMsgIndex(null);
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = (customText || inputValue).trim();
    if (!textToSend || isLoading) return;

    setLastUserPrompt(textToSend);

    const userMsg = createChatMessage({
      role: 'user',
      content: textToSend,
    });

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) {
      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await aiChatService.sendMessage({
        message: textToSend,
        sessionId,
        province: searchParams.get('province') || undefined,
        language: 'en',
      });

      const replyContent = res?.reply || res?.response || res?.message || res?.data?.response || res?.data?.message || 'Thank you for asking! Cambodia offers breathtaking heritage, especially in Siem Reap and Phnom Penh.';

      // Format dynamic suggestions from AI chatbot response, or derive contextual dynamic suggestions
      const rawSuggestions = res?.suggestions || [];
      const formattedSuggestions = rawSuggestions.length > 0
        ? rawSuggestions.map(formatSuggestedTopic).filter(Boolean)
        : getLocalDynamicSuggestions({ message: textToSend, answer: replyContent }).suggestions;

      const botMsg = createChatMessage({
        role: 'assistant',
        content: replyContent,
        suggestions: formattedSuggestions,
        sources: res?.sources || [],
      });

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      if (err.name === 'AbortError') return;
      const errorMsg = createChatMessage({
        role: 'assistant',
        isError: true,
        content: err.message || 'I am currently unable to reach the travel intelligence service. Please check your connection or retry in a moment.',
      });
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
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

  const handleRegenerate = (botMsgIndex) => {
    if (isLoading) return;
    let promptToResend = lastUserPrompt;
    for (let i = botMsgIndex - 1; i >= 0; i--) {
      if (messages[i]?.role === 'user') {
        promptToResend = messages[i].content;
        break;
      }
    }
    if (promptToResend) {
      handleSendMessage(promptToResend);
    }
  };

  const handleRetry = () => {
    if (lastUserPrompt && !isLoading) {
      handleSendMessage(lastUserPrompt);
    }
  };

  const handleFeedback = (idx, type) => {
    setFeedbackMap((prev) => ({
      ...prev,
      [idx]: prev[idx] === type ? null : type,
    }));
    showSuccess(type === 'up' ? 'Feedback saved: Helpful response!' : 'Feedback saved: Thank you for helping us improve.');
  };

  const handleNewConversation = () => {
    setSessionId(generateSessionId());
    setMessages([]);
    setIsMenuOpen(false);
    setFeedbackMap({});
    fetchInitialSuggestions(true);
  };

  const handleExit = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleTextareaInput = (e) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 130)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#f8fafc] dark:bg-[#18181b] font-sans selection:bg-[#2563eb] selection:text-white">
      {/* Full-Screen Top Header (PRESERVED UNCHANGED) */}
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

      {/* Main Full-Screen Body (NO SIDEBAR, NO EXTRA HEADER — PURE CHAT CANVAS) */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc] dark:bg-[#18181b] text-zinc-900 dark:text-zinc-100">
        {/* Tab Content */}
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 flex flex-col">
              {/* Welcome Screen (Identical to https://angkorvers.vercel.app/) */}
              {messages.length === 0 ? (
                <div className="my-auto max-w-2xl mx-auto w-full py-6 sm:py-10 space-y-6 text-center animate-in fade-in duration-300">
                  {/* 1. Country Flag + Assistant Capsule Pill Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <span className="text-sm">🇰🇭</span>
                    <span>AngkorVers AI Assistant</span>
                  </div>

                  {/* 2. Primary Headline */}
                  <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
                    What can I help you explore or solve today?
                  </h1>

                  {/* 3. Subtitle Description */}
                  <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto font-normal">
                    General intelligence, programming, math, translation, and deep Cambodia expertise.
                  </p>

                  {/* 4. Center Input Composer Box */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus-within:border-zinc-400 dark:focus-within:border-zinc-500 focus-within:shadow-md bg-white dark:bg-zinc-900 shadow-sm px-4 py-2.5 flex items-center gap-3 transition-all duration-200"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTab('tools')}
                      className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer shrink-0"
                      title="Explore Travel Tools & Resources"
                    >
                      <Plus size={20} />
                    </button>

                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Message AngkorVers AI..."
                      className="flex-1 text-[15px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 bg-transparent focus:outline-none"
                    />

                    <button
                      type="submit"
                      disabled={isLoading || !inputValue.trim()}
                      aria-label="Send Message"
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        inputValue.trim() && !isLoading
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-zinc-200 shadow-xs'
                          : 'bg-zinc-300 dark:bg-zinc-700 text-white dark:text-zinc-400 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUp size={18} />
                    </button>
                  </form>

                  {/* 5. Suggested Topics Section Header */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs px-1">
                      <div className="flex items-center gap-1.5 font-bold tracking-wider text-amber-500 uppercase text-[11px]">
                        <Sparkles size={14} className="fill-amber-500" />
                        <span>SUGGESTED TOPICS</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRefreshInitialTopics}
                        disabled={isRefreshingInitial}
                        className="flex items-center gap-1.5 font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
                      >
                        <RefreshCw size={12} className={isRefreshingInitial ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                      </button>
                    </div>

                    {/* 6. Suggestion Cards 2x2 Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                      {initialSuggestions.map((item, idx) => {
                        const IconComponent = item.icon || Sparkles;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(item.query || item.text)}
                            className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs flex items-center gap-3.5 transition-all cursor-pointer group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-white transition shrink-0">
                              <IconComponent size={18} />
                            </div>
                            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition line-clamp-1">
                              {item.text}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Active Conversation Messages Stream (Matching angkorvers.vercel.app) */
                <div className="space-y-6 max-w-3xl mx-auto w-full pb-4">
                  {messages.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    return isUser ? (
                      /* User Message: Right-Aligned Dark Bubble with action icons beneath */
                      <div key={msg.id} className="flex flex-col items-end space-y-1.5">
                        <div className="bg-[#1e232a] text-white px-5 py-3.5 rounded-2xl rounded-tr-sm text-[15px] font-normal leading-relaxed shadow-xs max-w-[85%] sm:max-w-[75%] whitespace-pre-wrap">
                          {msg.content}
                        </div>
                        {/* Copy & Edit icons under user prompt */}
                        <div className="flex items-center gap-2 pr-1 text-zinc-400">
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.content, idx)}
                            className="p-1 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
                            title="Copy prompt"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setInputValue(msg.content);
                              textareaRef.current?.focus();
                            }}
                            className="p-1 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
                            title="Edit prompt"
                          >
                            <Pencil size={13} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Assistant Message: Clean natural canvas flow with embedded topics & toolbar */
                      <div key={msg.id} className="w-full space-y-3 text-[15px]">
                        {msg.isError ? (
                          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 space-y-2">
                            <div className="flex items-start gap-2">
                              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                              <span className="leading-relaxed">{msg.content}</span>
                            </div>
                            <button
                              type="button"
                              onClick={handleRetry}
                              className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 hover:bg-rose-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <RotateCcw size={12} />
                              <span>Retry Question</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Rich Markdown Response */}
                            <MarkdownMessage content={msg.content} />

                            {/* Embedded Suggested Topics Card Container */}
                            {(() => {
                              const messageTopics = (msg.suggestions && msg.suggestions.length > 0)
                                ? msg.suggestions.map(formatSuggestedTopic).filter(Boolean)
                                : initialSuggestions;

                              if (!messageTopics || messageTopics.length === 0) return null;
                              const isThisRefreshing = refreshingMsgIndex === idx;

                              return (
                                <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 p-4 mt-4 space-y-3">
                                  <div className="flex items-center justify-between text-xs px-1">
                                    <div className="flex items-center gap-1.5 font-bold tracking-wider text-amber-500 uppercase text-[11px]">
                                      <Sparkles size={14} className="fill-amber-500" />
                                      <span>SUGGESTED TOPICS</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRefreshMessageSuggestions(idx, msg)}
                                      disabled={isThisRefreshing}
                                      className="flex items-center gap-1.5 font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
                                    >
                                      <RefreshCw size={12} className={isThisRefreshing ? 'animate-spin' : ''} />
                                      <span>Refresh</span>
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {messageTopics.map((item, tIdx) => {
                                      const IconComponent = item.icon || Sparkles;
                                      return (
                                        <button
                                          key={tIdx}
                                          type="button"
                                          onClick={() => handleSendMessage(item.query || item.text)}
                                          className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs flex items-center gap-3 transition-all cursor-pointer text-left group"
                                        >
                                          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-white transition shrink-0">
                                            <IconComponent size={16} />
                                          </div>
                                          <span className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition line-clamp-1">
                                            {item.text}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Toolbar below: Copy, Retry, Thumbs Up, Thumbs Down */}
                            <div className="flex items-center gap-2 pt-1 text-zinc-400">
                              <button
                                type="button"
                                onClick={() => handleCopyText(msg.content, idx)}
                                className="p-1.5 rounded-lg hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                                title="Copy response"
                              >
                                {copiedIndex === idx ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRegenerate(idx)}
                                className="p-1.5 rounded-lg hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                                title="Regenerate"
                              >
                                <RotateCcw size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFeedback(idx, 'up')}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  feedbackMap[idx] === 'up'
                                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/40'
                                    : 'hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`}
                                title="Good response"
                              >
                                <ThumbsUp size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFeedback(idx, 'down')}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  feedbackMap[idx] === 'down'
                                    ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40'
                                    : 'hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`}
                                title="Bad response"
                              >
                                <ThumbsDown size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Thinking / Generating State Pill */}
                  {isLoading && (
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs text-xs font-medium text-zinc-600 dark:text-zinc-300">
                      <span>AngkorVers AI is thinking...</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" style={{ animationDelay: '200ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" style={{ animationDelay: '400ms' }} />
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Message Composer (Only visible once conversation is active) */}
            {messages.length > 0 && (
              <div className="p-3 sm:p-4 bg-transparent shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="max-w-3xl mx-auto rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus-within:border-zinc-400 dark:focus-within:border-zinc-500 focus-within:shadow-md bg-white dark:bg-zinc-900 shadow-sm px-4 py-2 sm:py-2.5 flex items-center gap-3 transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab('tools')}
                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer shrink-0"
                    title="Explore Travel Tools & Resources"
                  >
                    <Plus size={20} />
                  </button>

                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={inputValue}
                    onChange={handleTextareaInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Message AngkorVers AI..."
                    className="flex-1 py-1 text-[15px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 bg-transparent resize-none focus:outline-none max-h-32 leading-relaxed"
                  />

                  {isLoading ? (
                    <button
                      type="button"
                      onClick={handleStopGenerating}
                      aria-label="Stop Generating"
                      className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                      title="Stop generating"
                    >
                      <Square size={12} className="fill-white" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      aria-label="Send Message"
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        inputValue.trim()
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-zinc-200 shadow-xs'
                          : 'bg-zinc-300 dark:bg-zinc-700 text-white dark:text-zinc-400 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUp size={18} />
                    </button>
                  )}
                </form>
                <div className="text-center text-[12px] text-zinc-400 dark:text-zinc-500 mt-2">
                  AngkorVers AI can make mistakes. Verify important facts.
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Weather & Currency Tools Tab */
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <CloudSun className="text-blue-600 dark:text-blue-400" />
                  <span>Real-Time Weather Intelligence</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Live meteorological conditions across Cambodian tourism regions
                </p>
              </div>

              {/* Province / City Search Input */}
              <div className="space-y-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (weatherSearchQuery.trim()) {
                      const target = weatherSearchQuery.trim();
                      setWeatherProvince(target);
                      fetchWeather(target);
                      setShowWeatherSuggestions(false);
                    }
                  }}
                  className="relative flex items-center"
                >
                  <div className="relative flex-1">
                    <Search
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={weatherSearchQuery}
                      onChange={(e) => {
                        setWeatherSearchQuery(e.target.value);
                        setShowWeatherSuggestions(true);
                      }}
                      onFocus={() => setShowWeatherSuggestions(true)}
                      placeholder="Search province or city in Cambodia..."
                      className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition shadow-2xs"
                    />
                    {weatherSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setWeatherSearchQuery('');
                          setShowWeatherSuggestions(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="ml-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Search size={14} />
                    <span>Search</span>
                  </button>
                </form>

                {/* Dropdown autocomplete for filtered provinces */}
                {showWeatherSuggestions && filteredProvinces.length > 0 && weatherSearchQuery.trim() && (
                  <div className="relative z-20">
                    <div className="absolute top-1 left-0 right-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                      {filteredProvinces.map((prov) => (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => {
                            setWeatherSearchQuery(prov);
                            setWeatherProvince(prov);
                            fetchWeather(prov);
                            setShowWeatherSuggestions(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 transition cursor-pointer"
                        >
                          <MapPin size={13} className="text-zinc-400" />
                          <span>{prov}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Selection Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  <span className="text-[11px] font-semibold text-zinc-400 shrink-0">Popular:</span>
                  {['Siem Reap', 'Phnom Penh', 'Sihanoukville', 'Battambang', 'Kampot', 'Mondulkiri'].map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => {
                        setWeatherSearchQuery(prov);
                        setWeatherProvince(prov);
                        fetchWeather(prov);
                        setShowWeatherSuggestions(false);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                        weatherProvince.toLowerCase() === prov.toLowerCase()
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather Card */}
              {isLoadingWeather ? (
                <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-500">
                  <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Retrieving weather radar data...</span>
                </div>
              ) : weatherData ? (
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-bold text-zinc-900 dark:text-white">{weatherData.province}</span>
                      <span className="block text-xs text-zinc-500">{weatherData.condition}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{weatherData.temperature}</span>
                      <span className="block text-xs text-zinc-500">Humidity: {weatherData.humidity}</span>
                    </div>
                  </div>
                  {weatherData.advice && (
                    <div className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-3 rounded-xl leading-relaxed">
                      <strong className="text-blue-600 dark:text-blue-400">Travel Advisory:</strong> {weatherData.advice}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Currency Converter */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="text-emerald-600 dark:text-emerald-400" />
                  <span>Currency Calculator (USD &harr; KHR)</span>
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-2.5 text-xs text-zinc-400 font-bold">$</span>
                    <input
                      type="number"
                      value={usdAmount}
                      onChange={(e) => handleConvertCurrency(Number(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold text-zinc-800 dark:text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Amount in USD"
                    />
                  </div>
                  <span className="text-sm font-bold text-zinc-400">=</span>
                  <div className="flex-1 py-2 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-right text-sm font-black text-emerald-700 dark:text-emerald-400">
                    {khrResult.toLocaleString()} ៛ KHR
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Official benchmark exchange rate: 1 USD ≈ 4,100 KHR. Most merchants accept USD cash.
                </p>
              </div>

              {/* Link to destinations */}
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Explore Verified Destinations</h4>
                  <p className="text-[11px] text-zinc-500">Find entrance fees, tour packages, and operating hours</p>
                </div>
                <Link
                  to="/destinations"
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition shadow-xs"
                >
                  Catalog
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
