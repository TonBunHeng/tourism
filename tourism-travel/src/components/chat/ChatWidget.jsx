import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  X,
  User,
  Trash2,
  ArrowUp,
  RotateCw,
  Sparkles,
  HelpCircle,
  ChevronUp,
} from 'lucide-react';
import { chatService } from '../../services/chatService';
import { useTravel } from '../../context/TravelContext';
import GenieBotIcon from './GenieBotIcon';

// Comprehensive pool of Cambodia & Angkor travel questions (clean text without emojis)
const QUESTION_BANK = [
  // Temples & Heritage
  'Top must-see temples in Angkor Archaeological Park',
  'Where is the best spot for sunrise at Angkor Wat?',
  'What is the required dress code for visiting sacred temples?',
  'How much does the Angkor Pass cost and where to buy it?',
  'History behind the famous Ta Prohm (Tomb Raider) temple',
  'What is the meaning of the smiling stone faces at Bayon?',
  'Hidden gem temples in Siem Reap with fewer tourists',
  'Can I visit Banteay Srei temple on a tuk-tuk?',

  // Itinerary & Day Trips
  'Plan a 3-day travel itinerary for Siem Reap',
  'What are the top things to do in Phnom Penh in 2 days?',
  'Best beaches and islands: Koh Rong or Koh Rong Sanloem?',
  'How to visit the floating villages on Tonle Sap Lake?',
  'What essentials should I pack for traveling in Cambodia?',
  'What is the best way to travel from Siem Reap to Phnom Penh?',

  // Food & Dining
  'What are the top traditional Khmer dishes to try?',
  'What is authentic Fish Amok and how is it prepared?',
  'Top recommended restaurants and nightlife on Pub Street',
  'Where can I find delicious vegetarian or vegan Khmer food?',
  'Guide to trying safe and tasty Cambodian street food',
  'Best specialty coffee shops and bakeries in Siem Reap',

  // Currency, Weather & Practical Tips
  'Can I use US Dollars in Cambodia or do I need Riel (KHR)?',
  'What is the current weather and best season to visit?',
  'What is the reasonable price for a tuk-tuk ride per day?',
  'What is the best tourist eSIM or local SIM card to get?',
  'Are credit cards widely accepted in Siem Reap and Phnom Penh?',
  'What are the emergency numbers for tourists in Cambodia?',

  // Culture & Festivals
  'When is Khmer New Year (Choul Chnam Thmey) celebrated?',
  'What happens during the Water Festival (Bon Om Touk)?',
  'Best authentic souvenirs to buy at Siem Reap Old Market',
  'Polite Cambodian greetings, body language, and local customs',
  'Where can I watch an authentic live Apsara dance performance?',
];

// Helper to strip any emojis from text
const removeEmojis = (str) => {
  if (!str) return '';
  return str.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '').trim();
};

const QUESTIONS_PER_BATCH = 4;

export default function ChatWidget() {
  const { chatOpen, setChatOpen, toggleChat } = useTravel();
  const location = useLocation();

  // Question refresh states
  const [batchIndex, setBatchIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Scroll to Top state & handler
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  // Pick questions according to batch index
  const getBatchQuestions = (idx) => {
    const start = (idx * QUESTIONS_PER_BATCH) % QUESTION_BANK.length;
    let selected = QUESTION_BANK.slice(start, start + QUESTIONS_PER_BATCH);
    if (selected.length < QUESTIONS_PER_BATCH) {
      selected = [...selected, ...QUESTION_BANK.slice(0, QUESTIONS_PER_BATCH - selected.length)];
    }
    return selected;
  };

  const [currentQuestions, setCurrentQuestions] = useState(() => getBatchQuestions(0));

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('angkor_travel_chat_msgs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m) => ({
            ...m,
            message: removeEmojis(m.message || ''),
          }));
        }
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'welcome',
        sender: 'assistant',
        message:
          '**Choum Reap Sour!** Welcome to AngkorVerses AI Guide.\n\nI am your intelligent Cambodia travel companion. I can help you discover Angkor temples, craft customized day-by-day itineraries, check live weather, convert currency, and recommend top local spots.',
        created_at: new Date().toISOString(),
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('angkor_chat_session_id');
    if (!id) {
      id = 'tourist_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('angkor_chat_session_id', id);
    }
    return id;
  });

  // True if user has sent at least one message in the chat
  const hasUserAsked = messages.some((m) => m.sender === 'user');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const toggleButtonRef = useRef(null);

  // Automatically close chat on route/page change
  useEffect(() => {
    if (chatOpen && setChatOpen) {
      setChatOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Prevent background page from scrolling when chat is open (allow scroll only inside chat)
  useEffect(() => {
    if (chatOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          if (setChatOpen) setChatOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow || 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [chatOpen, setChatOpen]);

  // Handle Refresh Questions with smooth spinning animation
  const handleRefreshQuestions = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const totalBatches = Math.ceil(QUESTION_BANK.length / QUESTIONS_PER_BATCH);
      const nextIdx = (batchIndex + 1) % totalBatches;
      setBatchIndex(nextIdx);
      setCurrentQuestions(getBatchQuestions(nextIdx));
      setIsRefreshing(false);
    }, 280);
  };

  // Helper to format timestamps to current locale 12h time
  const formatTime = (timeVal) => {
    try {
      const d = timeVal ? new Date(timeVal) : new Date();
      if (isNaN(d.getTime())) return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      return d.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    }
  };

  // Save to session storage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem('angkor_travel_chat_msgs', JSON.stringify(messages));
      } catch (e) {
        console.warn('Could not save chat history', e);
      }
    }
  }, [messages]);

  // Focus and scroll when chat opens
  useEffect(() => {
    if (chatOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [chatOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendPrompt = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    setInputMessage('');
    const nowISO = new Date().toISOString();
    const userMsg = {
      id: `usr_${crypto.randomUUID()}`,
      sender: 'user',
      message: text,
      created_at: nowISO,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await chatService.sendAiMessage(text, sessionId);
      const answer =
        res?.data?.response ||
        res?.data?.reply ||
        res?.data?.answer ||
        res?.response ||
        res?.reply ||
        res?.answer ||
        res?.data?.data?.response ||
        res?.data?.data?.reply ||
        res?.data?.data?.answer ||
        (res?.data && typeof res.data === 'string' ? res.data : null) ||
        (typeof res === 'string' ? res : null) ||
        (res?.message && res.message !== 'AI response generated successfully.' ? res.message : null) ||
        'Thank you! Let me know what else you would like to know about Cambodia.';
      const respISO = new Date().toISOString();

      const botMsg = {
        id: `bot_${crypto.randomUUID()}`,
        sender: 'assistant',
        message: answer,
        created_at: respISO,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errISO = new Date().toISOString();
      const isRateLimit = err?.status === 429 || err?.message?.toLowerCase().includes('too many');
      const errorMsg = isRateLimit
        ? 'You are sending messages too quickly. Please wait a moment before sending another message.'
        : 'Angkor Verse AI is currently syncing. You can explore destinations, temples, and festival guides in the menu above!';
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${crypto.randomUUID()}`,
          sender: 'assistant',
          message: errorMsg,
          created_at: errISO,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    const freshWelcome = [
      {
        id: `welcome_${Date.now()}`,
        sender: 'assistant',
        message:
          'Conversation cleared! How can I assist your Cambodia adventure today? Feel free to ask anything or select a suggested question below.',
        created_at: new Date().toISOString(),
      },
    ];
    setMessages(freshWelcome);
    sessionStorage.removeItem('angkor_travel_chat_msgs');
  };

  // Helper to format simple markdown (bold, lists, breaks)
  const renderFormattedText = (text) => {
    if (!text) return null;
    const cleanStr = removeEmojis(text);
    const lines = cleanStr.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
      const isNumbered = /^\d+\.\s/.test(trimmed);

      // Strip leading bullet prefix (*, -, •) or number prefix if it's a list item
      let contentToParse = line;
      if (isBullet) {
        contentToParse = trimmed.replace(/^(\*|-|•)\s+/, '');
      } else if (isNumbered) {
        contentToParse = trimmed.replace(/^\d+\.\s+/, '');
      }

      const parts = contentToParse.split(/(\*\*.*?\*\*)/g);
      const renderedContent = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-blue-600 dark:text-blue-400">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={i} className="ml-4 list-disc my-1 leading-relaxed">
            {renderedContent}
          </li>
        );
      }

      if (isNumbered) {
        const match = trimmed.match(/^(\d+)\.\s/);
        const num = match ? match[1] : '';
        return (
          <div key={i} className="ml-4 my-1 flex gap-2 leading-relaxed">
            <span className="font-semibold text-blue-600 dark:text-blue-400 shrink-0">{num}.</span>
            <span className="flex-1">{renderedContent}</span>
          </div>
        );
      }

      if (!trimmed) {
        return <div key={i} className="h-1.5" />;
      }

      return (
        <span key={i} className="block leading-relaxed min-h-[1.1rem]">
          {renderedContent}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Action Controls (Scroll to Top & Genie Bot) */}
      <div
        className={`fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3 transition-all duration-300 ${
          chatOpen ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'
        }`}
      >
        {/* Scroll to Top Button */}
        <button
          type="button"
          onClick={handleScrollToTop}
          className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-white dark:bg-zinc-800 border border-gray-200/90 dark:border-zinc-700 shadow-md hover:shadow-xl text-gray-800 dark:text-zinc-100 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 ${
            showScrollTop
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          title="Scroll to top"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6 stroke-[2.8]" />
        </button>

        {/* Floating Action Button - Animated AI Genie Mascot */}
        <button
          ref={toggleButtonRef}
          onClick={toggleChat}
          className="w-14 h-14 sm:w-15 sm:h-15 rounded-full p-0 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-xl animate-genie-pulse group overflow-visible relative"
          title="Open Angkor Verse AI Genie"
          aria-label="Open AI Travel Chat"
        >
          <GenieBotIcon className="w-full h-full" animate={true} />
          {/* Online green indicator dot */}
          <span className="absolute top-0 right-0 sm:top-0.5 sm:right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-zinc-900"></span>
          </span>
        </button>
      </div>

      {/* Backdrop Overlay (closes chat smoothly on click outside) */}
      <div
        onClick={() => setChatOpen(false)}
        className={`fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px] z-50 transition-opacity duration-300 cursor-pointer ${
          chatOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!chatOpen}
        aria-label="Close Chat Overlay"
      />

      {/* 50% Screen Chatbot UI Side Panel (Smooth slide in & out) */}
      <aside
        ref={chatContainerRef}
        aria-label="AI Travel Assistant Panel"
        aria-hidden={!chatOpen}
        className={`fixed top-0 right-0 bottom-0 h-screen z-50 bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out w-full sm:w-[90vw] md:w-1/2 lg:w-1/2 overscroll-contain ${
          chatOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
          {/* Header */}
          <div className="px-4 sm:px-6 py-3.5 bg-[#003E83] text-white flex items-center justify-between border-b border-[#002e62] shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
                <GenieBotIcon className="w-full h-full" animate={true} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold leading-tight tracking-tight text-white flex items-center gap-1.5">
                    Angkor Verse AI Guide
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <span className="text-xs text-blue-100/90 block mt-0.5">
                  AI Tourism Companion
                </span>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              {/* Clear History */}
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Clear Conversation"
                aria-label="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer ml-1"
                title="Close AI Assistant"
                aria-label="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-4 text-xs bg-gray-50/70 dark:bg-zinc-950/80">

            {/* Message Bubbles */}
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className={`flex gap-3 max-w-[90%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs mt-0.5 overflow-hidden shadow-xs ${
                        isUser
                          ? 'bg-[#003E83] text-white'
                          : 'bg-transparent'
                      }`}
                    >
                      {isUser ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <GenieBotIcon className="w-full h-full" animate={false} />
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-xl text-xs sm:text-[13px] leading-relaxed ${
                        isUser
                          ? 'bg-[#003E83] text-white rounded-tr-none shadow-sm'
                          : 'bg-white dark:bg-zinc-800/95 text-gray-800 dark:text-zinc-100 border border-gray-200/90 dark:border-zinc-700/80 rounded-tl-none shadow-xs'
                      }`}
                    >
                      <div>{renderFormattedText(m.message)}</div>
                    </div>
                  </div>

                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1.5 px-11 font-medium">
                    {formatTime(m.created_at)}
                  </span>
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {loading && (
              <div className="flex items-center gap-3 pl-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                  <GenieBotIcon className="w-full h-full" animate={true} />
                </div>
                <div className="px-4 py-3 bg-white dark:bg-zinc-800/95 border border-gray-200 dark:border-zinc-700 rounded-xl rounded-tl-none flex items-center gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#003E83] dark:bg-[#60a5fa] animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-[#003E83] dark:bg-[#60a5fa] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#003E83] dark:bg-[#60a5fa] animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-xs text-gray-500 dark:text-zinc-400 ml-1 font-medium">
                    Angkor AI is thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Questions Bar (Shown only for the first time when user hasn't asked anything yet; hidden once chat starts) */}
          {!hasUserAsked && (
            <div className="p-3 sm:px-5 sm:py-3 bg-gray-50/90 dark:bg-zinc-900/90 border-t border-gray-200 dark:border-zinc-800 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-gray-600 dark:text-zinc-400 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#003E83] dark:text-[#60a5fa]" />
                  Suggested Questions
                </span>

                {/* Refresh Questions Button */}
                <button
                  type="button"
                  onClick={handleRefreshQuestions}
                  disabled={isRefreshing}
                  className="text-[11px] font-semibold text-[#003E83] dark:text-[#60a5fa] hover:text-[#002e62] dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 px-2 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Get new questions"
                >
                  <RotateCw
                    className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                  <span>Refresh Questions</span>
                </button>
              </div>

              {/* Questions Grid / Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {currentQuestions.map((question, qIdx) => (
                  <button
                    key={qIdx}
                    type="button"
                    onClick={() => handleSendPrompt(removeEmojis(question))}
                    disabled={loading}
                    className="text-left text-[11px] sm:text-xs px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-gray-700 dark:text-zinc-200 hover:text-[#003E83] dark:hover:text-blue-300 border border-gray-200/90 dark:border-zinc-700 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer line-clamp-2 leading-relaxed"
                    title={removeEmojis(question)}
                  >
                    {removeEmojis(question)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input Form (Pill Shape matching design without + icon) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="p-3 sm:px-5 sm:py-3.5 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 shrink-0"
          >
            <div className="flex items-center gap-3 pl-5 pr-2 py-1.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-full focus-within:border-[#93b3f9] dark:focus-within:border-[#93b3f9] focus-within:ring-2 focus-within:ring-[#93b3f9]/20 transition-all shadow-2xs">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask something about Cambodia."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={loading}
                className="flex-1 bg-transparent text-gray-800 dark:text-zinc-100 text-xs sm:text-sm focus:outline-none placeholder-gray-400 dark:placeholder-zinc-400 py-2 font-normal"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="w-9 h-9 rounded-full bg-[#93b3f9] hover:bg-[#7b9ff3] dark:bg-[#93b3f9] dark:hover:bg-[#7b9ff3] disabled:opacity-75 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
                title="Send message"
                aria-label="Send message"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        </aside>
    </>
  );
}
