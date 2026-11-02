import { useState, useRef } from 'react';
import { 
  Copy, 
  Check, 
  Pencil, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles, 
  Paperclip,
  RefreshCw 
} from 'lucide-react';
import MarkdownMessage from '../common/MarkdownMessage';
import WeatherCard from './WeatherCard';
import ItineraryCard from './ItineraryCard';
import RecommendationsCard from './RecommendationsCard';
import CurrencyCard from './CurrencyCard';
import SourcesCard from './SourcesCard';
import { formatSuggestedTopic } from '../../utils/chatUtils';

export default function ChatMessageItem({
  message,
  language = 'en',
  isLatest = false,
  onRegenerate,
  onSelectSuggestion,
  onEditMessage,
}) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'like' | 'dislike'
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [isRefreshingSuggestions, setIsRefreshingSuggestions] = useState(false);
  const editTextareaRef = useRef(null);

  const isKm = language === 'km';
  const isUser = message.sender === 'user' || message.role === 'user';
  const textContent = message.content || message.message || '';
  const isKhmerText = isKm || /[\u1780-\u17FF]/.test(textContent);

  const hasCards = !!(
    message.weather ||
    message.itinerary ||
    (message.recommendations && message.recommendations.length > 0) ||
    message.currency ||
    (message.sources && message.sources.length > 0)
  );

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textContent);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textContent;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy message:', e);
    }
  };

  const startEdit = () => {
    setEditText(textContent);
    setIsEditing(true);
    setTimeout(() => {
      editTextareaRef.current?.focus();
    }, 50);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditText('');
  };

  const submitEdit = () => {
    if (!editText.trim()) return;
    if (onEditMessage) {
      onEditMessage({
        id: message.id,
        newText: editText.trim(),
        message,
      });
    }
    setIsEditing(false);
  };

  const handleRefreshSuggestions = (e) => {
    e.stopPropagation();
    setIsRefreshingSuggestions(true);
    setTimeout(() => {
      setIsRefreshingSuggestions(false);
    }, 500);
  };

  return (
    <div className={`flex w-full mb-5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] sm:max-w-[80%] group relative ${isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
        
        {/* Assistant Header Badge */}
        {!isUser && (textContent.trim() || hasCards) && (
          <div className="flex flex-wrap items-center gap-1.5 mb-1 px-1 text-[11px]">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">AngkorVers AI</span>
            <span className="text-zinc-400">•</span>
            <span className="inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-[10px]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span>Online</span>
            </span>
          </div>
        )}

        {/* Message Bubble Container */}
        {(isUser || textContent.trim() || hasCards) && (
          <div
            className={`px-4 py-3 rounded-2xl text-[14.5px] sm:text-[15px] ${
              isKhmerText ? 'leading-[1.75]' : 'leading-relaxed'
            } ${
              isUser
                ? 'bg-zinc-800 dark:bg-zinc-700 text-white rounded-2xl font-normal sm:font-medium shadow-xs'
                : 'bg-white dark:bg-[#18181b] text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl rounded-tl-xs w-full shadow-2xs'
            }`}
          >
            {/* User Attachments Preview */}
            {isUser && message.attachments && message.attachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {message.attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center space-x-1 bg-white/15 px-2 py-0.5 rounded-md text-xs text-white">
                    <Paperclip size={12} />
                    <span className="truncate max-w-[120px]">{file.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* User Edit Mode */}
            {isUser && isEditing ? (
              <div className="w-full min-w-[220px] sm:min-w-[300px]">
                <textarea
                  ref={editTextareaRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={2}
                  className="w-full bg-transparent text-white placeholder-white/60 focus:outline-none resize-none text-[15px] leading-relaxed py-1"
                  placeholder={isKm ? 'បញ្ចូលសារកែប្រែ...' : 'Edit your message...'}
                />
                <div className="flex items-center justify-end space-x-2 mt-2 pt-2 border-t border-white/20">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-3 py-1 text-xs rounded-full font-medium bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    {isKm ? 'បោះបង់' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={submitEdit}
                    disabled={!editText.trim()}
                    className="px-3 py-1 text-xs rounded-full font-medium bg-white text-zinc-900 hover:bg-zinc-100 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                  >
                    {isKm ? 'ផ្ញើ' : 'Send'}
                  </button>
                </div>
              </div>
            ) : isUser ? (
              <div className="whitespace-pre-wrap break-words leading-relaxed">
                {textContent}
              </div>
            ) : (
              <div className="message-text">
                <MarkdownMessage content={textContent} isKhmer={isKhmerText} />
              </div>
            )}

            {/* Rich Interactive Cards */}
            {!isUser && message.weather && (
              <WeatherCard weather={message.weather} language={language} />
            )}

            {!isUser && message.itinerary && (
              <ItineraryCard itinerary={message.itinerary} language={language} />
            )}

            {!isUser && !message.itinerary && message.recommendations && message.recommendations.length > 0 && (
              <RecommendationsCard recommendations={message.recommendations} language={language} />
            )}

            {!isUser && message.currency && (
              <CurrencyCard currency={message.currency} language={language} />
            )}

            {!isUser && !hasCards && message.sources && message.sources.length > 0 && (
              <SourcesCard sources={message.sources} language={language} />
            )}

            {/* Dynamic Suggested Topics under Latest Assistant Message */}
            {!isUser && isLatest && message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between px-0.5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                    <Sparkles size={12} className="text-amber-500" />
                    <span>{message.topic || (isKm ? 'ប្រធានបទណែនាំបន្ត' : 'Suggested Topics')}</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleRefreshSuggestions}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400 hover:text-[#003E83] dark:hover:text-blue-400 px-2 py-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer group active:scale-95"
                    title={isKm ? 'ប្តូរសំណួរថ្មី' : 'Refresh questions'}
                  >
                    <RefreshCw
                      size={11}
                      className={`transition-transform duration-500 ${
                        isRefreshingSuggestions ? 'animate-spin text-[#003E83] dark:text-blue-400' : 'group-hover:-rotate-90'
                      }`}
                    />
                    <span>{isKm ? 'ប្តូរសំណួរ' : 'Refresh'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {message.suggestions.map((item, sIdx) => {
                    const formatted = formatSuggestedTopic(item, language);
                    if (!formatted) return null;
                    const IconComp = formatted.icon;

                    return (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => onSelectSuggestion && onSelectSuggestion(formatted.prompt || formatted.title)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#212121] border border-slate-200/90 dark:border-zinc-800 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 hover:border-[#003E83] dark:hover:border-blue-500 hover:text-[#003E83] dark:hover:text-blue-400 shadow-2xs hover:shadow-xs transition-all duration-200 active:scale-95 cursor-pointer text-left group"
                      >
                        <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-400 group-hover:text-[#003E83] dark:group-hover:text-blue-400 transition-colors">
                          <IconComp size={14} className="group-hover:scale-110 transition-transform duration-200" />
                        </div>
                        <span className="font-medium line-clamp-2 leading-snug">
                          {formatted.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message Action Buttons Row */}
        {isUser && !isEditing ? (
          <div className="flex items-center space-x-1 mt-1 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center p-1 rounded-md hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs"
              title={copied ? (isKm ? 'បានចម្លង!' : 'Copied!') : (isKm ? 'ចម្លង' : 'Copy')}
            >
              {copied ? (
                <>
                  <Check size={13} className="text-blue-500 dark:text-blue-400" />
                  <span className="ml-1 text-[11px] text-blue-500 dark:text-blue-400">
                    {isKm ? 'បានចម្លង' : 'Copied'}
                  </span>
                </>
              ) : (
                <Copy size={13} />
              )}
            </button>
            <button
              type="button"
              onClick={startEdit}
              className="p-1 rounded-md hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs"
              title={isKm ? 'កែប្រែសារ' : 'Edit message'}
            >
              <Pencil size={13} />
            </button>
          </div>
        ) : !isUser && textContent.trim() ? (
          <div className="flex items-center space-x-1 mt-1.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center space-x-1 p-1 rounded-md hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
              title={copied ? 'Copied!' : 'Copy response'}
            >
              {copied ? (
                <>
                  <Check size={12} className="text-blue-500" />
                  <span className="text-[11px] text-blue-500 font-medium">
                    {isKm ? 'បានចម្លង' : 'Copied'}
                  </span>
                </>
              ) : (
                <Copy size={12} />
              )}
            </button>

            <button
              type="button"
              onClick={onRegenerate}
              className="p-1 rounded-md hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
              title={isKm ? 'បង្កើតចម្លើយឡើងវិញ' : 'Regenerate response'}
            >
              <RotateCcw size={12} />
            </button>

            <button
              type="button"
              onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                feedback === 'like'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
                  : 'hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Good response"
            >
              <ThumbsUp size={12} />
            </button>

            <button
              type="button"
              onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                feedback === 'dislike'
                  ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                  : 'hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Poor response"
            >
              <ThumbsDown size={12} />
            </button>
          </div>
        ) : null}

      </div>
    </div>
  );
}

