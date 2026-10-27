import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, 
  Send, 
  MoreHorizontal, 
  Maximize2, 
  RotateCcw, 
  Copy, 
  Check, 
  Loader2, 
  CloudSun,
  DollarSign
} from 'lucide-react';
import GenieAvatar from './GenieAvatar';
import aiChatService from '../../services/aiChatService';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { 
  TRIP_GENIE_SUGGESTIONS, 
  generateSessionId, 
  createChatMessage 
} from '../../utils/chatUtils';

export default function AngkorGenieFloatingWidget() {
  const { user } = useAuth();
  const { showSuccess } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(generateSessionId);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showToolsModal, setShowToolsModal] = useState(false);

  // Weather & Currency quick state
  const [weatherCity, setWeatherCity] = useState('Siem Reap');
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [usdVal, setUsdVal] = useState(20);
  const [khrVal, setKhrVal] = useState(82000);

  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);

  // Hide the floating widget if user is already on the dedicated /ai-chat page
  const isAIChatPage = location.pathname === '/ai-chat';

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Close options menu on outside click
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

  const handleSendMessage = async (textToSend = null) => {
    const prompt = (textToSend || inputValue).trim();
    if (!prompt || isLoading) return;

    const userMsg = createChatMessage({
      role: 'user',
      content: prompt,
    });

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const res = await aiChatService.sendMessage({
        message: prompt,
        sessionId,
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

  const handleResetSession = () => {
    setSessionId(generateSessionId());
    setMessages([]);
    setIsMenuOpen(false);
  };

  const handleCopyText = (text, index) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      showSuccess('Response copied to clipboard!');
    }
  };

  const fetchWeather = async (city) => {
    setWeatherCity(city);
    try {
      const res = await aiChatService.getWeather(city);
      if (res?.success) setWeatherInfo(res.data);
    } catch {
      setWeatherInfo({
        province: city,
        temperature: '31°C',
        condition: 'Partly Sunny',
        humidity: '70%',
      });
    }
  };

  const handleConvertCurrency = async (val) => {
    setUsdVal(val);
    try {
      const res = await aiChatService.convertCurrency(val, 'USD', 'KHR');
      if (res?.success && res.data?.converted_amount) {
        setKhrVal(res.data.converted_amount);
      } else {
        setKhrVal(Math.round(val * 4100));
      }
    } catch {
      setKhrVal(Math.round(val * 4100));
    }
  };

  if (isAIChatPage) {
    return null; // Don't show floating widget when on /ai-chat page
  }

  return (
    <>
      {/* Floating Action Button (Screenshot 2) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open AngkorGenie AI Assistant"
            className="group relative flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-none"
          >
            {/* Glowing pulse halo */}
            <span className="absolute -inset-1.5 rounded-full bg-blue-500/30 animate-pulse blur-xs" />
            <span className="absolute -inset-3 rounded-full bg-blue-600/15 animate-ping pointer-events-none" />

            {/* Genie circular avatar with GENIE badge */}
            <GenieAvatar size={66} showBadge={true} className="drop-shadow-[0_12px_24px_rgba(29,78,216,0.45)]" />

            {/* Hover Tooltip */}
            <span className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg backdrop-blur-xs">
              Chat with AngkorGenie
            </span>
          </button>
        </div>
      )}

      {/* Floating Drawer / Card Widget (Screenshot 1) */}
      {isOpen && (
        <div 
          className="fixed bottom-5 right-5 z-50 w-[94vw] sm:w-[460px] md:w-[480px] h-[640px] max-h-[88vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 shrink-0">
            <div className="flex items-center gap-2.5">
              <GenieAvatar size={34} showBadge={false} />
              <div>
                <div className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 leading-none">
                  <span>AngkorGenie</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 mt-0.5">
                  Travel Assistant
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Expand to Full Page */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/ai-chat', { state: { sessionId, messages } });
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Full Screen"
              >
                <Maximize2 size={16} />
              </button>

              {/* More options menu */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  title="More Options"
                >
                  <MoreHorizontal size={18} />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-xl py-1.5 z-20 text-xs">
                    <button
                      type="button"
                      onClick={handleResetSession}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-700/60 flex items-center gap-2 text-slate-700 dark:text-zinc-200 font-semibold cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      <span>Start New Chat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowToolsModal(true);
                        setIsMenuOpen(false);
                        if (!weatherInfo) fetchWeather('Siem Reap');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-700/60 flex items-center gap-2 text-slate-700 dark:text-zinc-200 font-semibold cursor-pointer"
                    >
                      <CloudSun size={14} />
                      <span>Weather & Currency</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/ai-chat', { state: { sessionId, messages } });
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-700/60 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold cursor-pointer"
                    >
                      <Maximize2 size={14} />
                      <span>Open Full Screen</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer ml-0.5"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Body & Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {/* If no chat messages yet, show the full TripGenie Get Started Hero */}
            {messages.length === 0 ? (
              <div className="space-y-4">
                {/* Hero Title */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent tracking-tight">
                    Hi there!
                  </h2>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                    Get Started With AngkorGenie
                  </h3>
                </div>

                {/* Friendly Intro speech paragraph */}
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-zinc-800/60 border border-blue-100 dark:border-zinc-700/50 text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                  I'm your one-stop travel assistant. I can help you make travel plans, find top temples, hotels, local cuisine, and book tours across Cambodia! Of course, you can ask me anything about travel! If you don't know what to ask, simply try the recommended questions below.
                </div>

                {/* Category Question Cards Grid (Screenshot 1) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {TRIP_GENIE_SUGGESTIONS.map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(item.question)}
                        className="text-left p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/70 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md hover:bg-blue-50/30 dark:hover:bg-zinc-800 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <IconComponent size={13} className={item.color} />
                          <span className={`text-[11px] font-bold ${item.color}`}>
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                          {item.question}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Message Thread */
              <div className="space-y-4">
                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      {!isUser ? (
                        <GenieAvatar size={28} showBadge={false} className="mt-1" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#003E83] dark:bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">
                          {user?.name ? user.name[0].toUpperCase() : 'U'}
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                          isUser
                            ? 'bg-[#003E83] dark:bg-blue-600 text-white rounded-tr-xs shadow-xs'
                            : msg.isError
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 rounded-tl-xs'
                            : 'bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-slate-100 dark:border-zinc-700/60 rounded-tl-xs shadow-xs'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>

                        <div className={`mt-2 flex items-center justify-between text-[10px] ${isUser ? 'text-blue-200' : 'text-slate-400 dark:text-zinc-500'}`}>
                          <span>{msg.time}</span>
                          {!isUser && !msg.isError && (
                            <button
                              type="button"
                              onClick={() => handleCopyText(msg.content, idx)}
                              className="p-1 hover:text-slate-700 dark:hover:text-zinc-200 transition cursor-pointer"
                              title="Copy response"
                            >
                              {copiedIndex === idx ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-start gap-2.5">
                    <GenieAvatar size={28} showBadge={false} className="mt-1 animate-pulse" />
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700/60 text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-2 rounded-tl-xs">
                      <Loader2 size={13} className="animate-spin text-blue-600 dark:text-blue-400" />
                      <span>AngkorGenie is thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions pill list when messages exist */}
          {messages.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Try:</span>
              {TRIP_GENIE_SUGGESTIONS.slice(0, 3).map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(item.question)}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-blue-400 text-slate-700 dark:text-zinc-300 text-[11px] whitespace-nowrap transition cursor-pointer shrink-0"
                >
                  {item.category}: {item.question.slice(0, 24)}...
                </button>
              ))}
            </div>
          )}

          {/* Bottom Input Bar (Screenshot 1) */}
          <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 p-1 pl-4 pr-1.5 rounded-2xl border border-blue-400/80 dark:border-blue-500/60 bg-white dark:bg-zinc-800/90 shadow-xs focus-within:ring-2 focus-within:ring-blue-500/20 transition"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about travel"
                className="flex-1 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                aria-label="Send Message"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  inputValue.trim() && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/30'
                    : 'text-slate-300 dark:text-zinc-600 cursor-not-allowed'
                }`}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Weather & Currency Tools Modal */}
      {showToolsModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CloudSun size={18} className="text-amber-500" />
                <span>Travel Tools: Weather & Currency</span>
              </div>
              <button
                type="button"
                onClick={() => setShowToolsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* City Weather Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Cambodia Province Weather
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {['Siem Reap', 'Phnom Penh', 'Sihanoukville'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => fetchWeather(city)}
                    className={`py-1.5 px-2 rounded-xl border text-center transition cursor-pointer ${
                      weatherCity === city
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                        : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    {city.split(' ')[0]}
                  </button>
                ))}
              </div>
              {weatherInfo && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{weatherInfo.province}</span>
                    <span className="block text-slate-500 dark:text-zinc-400">{weatherInfo.condition}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-amber-500">{weatherInfo.temperature}</span>
                    <span className="block text-[10px] text-slate-400">Humidity {weatherInfo.humidity}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Currency Converter */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                <DollarSign size={13} className="text-emerald-500" />
                <span>USD to Cambodian Riel (KHR)</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2 text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    value={usdVal}
                    onChange={(e) => handleConvertCurrency(Number(e.target.value) || 0)}
                    className="w-full pl-6 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold"
                  />
                </div>
                <span className="text-xs font-bold text-slate-400">=</span>
                <div className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-right text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {khrVal.toLocaleString()} ៛
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowToolsModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
