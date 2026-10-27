import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  User, 
  Plus, 
  Copy, 
  Check, 
  CloudSun, 
  DollarSign, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import aiChatService from '../../services/aiChatService';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SUGGESTED_QUESTIONS = [
  'What are the best temples to visit for sunrise in Siem Reap?',
  'Recommend a 3-day cultural itinerary for first-time visitors in Cambodia.',
  'What traditional Khmer foods and street dishes should I not miss?',
  'What is the current currency exchange rate between USD and Cambodian Riel (KHR)?',
  'What is the dress code required when visiting ancient Angkor temples?',
  'How do local Tuk-Tuk transport rates and PassApp work in Phnom Penh?'
];

export default function AIChat() {
  const { user } = useAuth();
  const { showSuccess } = useAlert();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'itinerary', 'weather'
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${user?.name ? user.name : 'there'}! Welcome to the **AngkorVerses AI Tourism Assistant**.\n\nI can help you discover ancient Khmer temples, local cuisines, Tuk-Tuk transportation tips, weather forecasts, or generate a tailored travel itinerary for your trip to Cambodia. How can I assist your journey today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => 'sess_' + Date.now().toString(36));
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Weather & Currency Widget States
  const [weatherData, setWeatherData] = useState(null);
  const [weatherProvince, setWeatherProvince] = useState('Siem Reap');
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  const [usdAmount, setUsdAmount] = useState(25);
  const [khrResult, setKhrResult] = useState(102500);

  const messagesEndRef = useRef(null);

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

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle URL query parameters for direct prompts or tabs
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'itinerary' || tabParam === 'weather') {
      setActiveTab(tabParam);
    }
    const initialPrompt = searchParams.get('prompt');
    if (initialPrompt) {
      setInputValue(initialPrompt);
    }
  }, [searchParams]);

  // Fetch Weather when Weather tab opens
  useEffect(() => {
    if (activeTab === 'weather' && !weatherData) {
      fetchWeather(weatherProvince);
    }
  }, [activeTab, weatherData, weatherProvince, fetchWeather]);

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

    const userMsg = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

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

      const botMsg = {
        id: 'bot_' + Date.now(),
        role: 'assistant',
        content: replyContent,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        isError: true,
        content: err.message || 'I am currently unable to reach the travel intelligence service. Please check your connection or retry in a moment.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
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
    setSessionId('sess_' + Date.now().toString(36));
    setMessages([
      {
        id: 'welcome_new',
        role: 'assistant',
        content: `New conversation started! How can I help you plan your journey in Cambodia today?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-[#003E83] dark:text-blue-400 uppercase tracking-wider">
              Cambodia Tourism Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>AngkorVerses AI Assistant</span>
            <Sparkles size={22} className="text-amber-500 fill-amber-400" />
          </h1>
        </div>

        {/* Navigation Tabs & Actions */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-slate-200/80 dark:bg-zinc-800 flex items-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-zinc-900 text-[#003E83] dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Chat Assistant
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('weather')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'weather'
                  ? 'bg-white dark:bg-zinc-900 text-[#003E83] dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Weather & Currency
            </button>
          </div>

          <button
            type="button"
            onClick={handleNewConversation}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            title="Start New Conversation"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      {activeTab === 'chat' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Interface */}
          <div className="lg:col-span-3 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col h-[650px] overflow-hidden">
            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                        isUser
                          ? 'bg-[#003E83] text-white'
                          : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                      }`}
                    >
                      {isUser ? <User size={16} /> : <Sparkles size={16} />}
                    </div>

                    {/* Chat Bubble */}
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-[#003E83] text-white rounded-tr-none'
                          : msg.isError
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 rounded-tl-none'
                          : 'bg-slate-50 dark:bg-zinc-800/70 text-slate-800 dark:text-zinc-100 border border-slate-100 dark:border-zinc-700/60 rounded-tl-none shadow-xs'
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
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles size={16} className="animate-spin" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-100 dark:border-zinc-700/60 text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-[#003E83] dark:text-blue-400" />
                    <span>Searching Cambodian heritage datasets and compiling response...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask anything about Cambodia (e.g. Angkor sunrise, food, dress codes)..."
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003E83]"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="px-5 py-3 rounded-2xl bg-[#003E83] hover:bg-[#002e62] disabled:opacity-40 text-white font-semibold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send size={15} />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Suggested Questions & Destination Shortcuts */}
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                <span>Suggested Questions</span>
              </div>
              <div className="space-y-2">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200/70 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/70 dark:bg-zinc-800/40 text-xs text-slate-700 dark:text-zinc-300 hover:text-[#003E83] dark:hover:text-blue-400 transition cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50/40 dark:from-zinc-900 dark:to-zinc-800/40 border border-blue-200/80 dark:border-zinc-800 space-y-2 text-xs">
              <span className="font-bold text-[#003E83] dark:text-blue-400 block">Verified Landmark Links</span>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                When you discover an attraction in your conversation, visit our destination catalog to check official opening hours and book tours.
              </p>
              <Link to="/destinations" className="font-bold text-[#003E83] dark:text-blue-400 hover:underline flex items-center gap-1 pt-1">
                <span>Browse All Places</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Weather & Currency Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weather Widget */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudSun size={20} className="text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Live Tourism Weather Advisory
                </h3>
              </div>
              <select
                value={weatherProvince}
                onChange={(e) => {
                  setWeatherProvince(e.target.value);
                  fetchWeather(e.target.value);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-800 dark:text-white"
              >
                <option value="Siem Reap">Siem Reap (Angkor)</option>
                <option value="Phnom Penh">Phnom Penh</option>
                <option value="Kampot">Kampot</option>
                <option value="Preah Sihanouk">Koh Rong / Sihanouk</option>
                <option value="Battambang">Battambang</option>
                <option value="Mondulkiri">Mondulkiri</option>
              </select>
            </div>

            {isLoadingWeather ? (
              <LoadingSpinner text="Fetching weather satellite data..." />
            ) : weatherData ? (
              <div className="p-5 rounded-2xl bg-gradient-to-tr from-sky-50 to-blue-50 dark:from-zinc-800 dark:to-zinc-800/50 border border-sky-200 dark:border-zinc-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-zinc-400">Province</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white">
                      {weatherData.province || weatherProvince}
                    </div>
                  </div>
                  <div className="text-3xl font-black text-[#003E83] dark:text-blue-400">
                    {weatherData.temperature || '31°C'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-zinc-300 pt-2 border-t border-sky-100 dark:border-zinc-700">
                  <div><strong>Condition:</strong> {weatherData.condition || 'Sunny with light clouds'}</div>
                  <div><strong>Humidity:</strong> {weatherData.humidity || '68%'}</div>
                </div>

                <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                  <strong className="block text-[#003E83] dark:text-blue-400 mb-0.5">Practical Travel Advice:</strong>
                  {weatherData.advice || 'Early morning sunrise viewing at Angkor Wat has clear visibility. Use sunscreen and light cotton clothing.'}
                </div>
              </div>
            ) : null}
          </div>

          {/* Currency Converter */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign size={20} className="text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cambodia Currency Converter (USD / KHR)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Both US Dollars ($) and Cambodian Riel (៛) are widely accepted across the country. Standard rate is approximately 1 USD ≈ 4,100 KHR.
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Amount in USD ($)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={usdAmount}
                  onChange={(e) => handleConvertCurrency(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase">
                  Equivalent Cambodian Riel
                </div>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                  {khrResult.toLocaleString()} ៛ KHR
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
