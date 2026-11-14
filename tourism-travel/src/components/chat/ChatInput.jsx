import { useState, useRef, useEffect } from 'react';
import { Plus, ArrowUp, Square, X, Paperclip } from 'lucide-react';

export default function ChatInput({
  isLoading = false,
  language = 'en',
  isCentered = false,
  onSendMessage,
  onStopGenerating,
}) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const isKm = language === 'km';

  const canSubmit = (text.trim().length > 0 || attachments.length > 0) && !isLoading;

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = Math.min(textareaRef.current.scrollHeight, 144);
      textareaRef.current.style.height = `${scrollH}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            data: event.target.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!canSubmit) return;

    const trimmed = text.trim();
    const currentAttachments = [...attachments];

    setText('');
    setAttachments([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    if (onSendMessage) {
      onSendMessage(trimmed, currentAttachments);
    }
  };

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  return (
    <div className={`w-full ${isCentered ? 'px-2 py-0' : 'bg-transparent py-2.5 px-3 sm:px-4 sticky bottom-0 z-20'}`}>
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="relative bg-white dark:bg-[#212121] border border-zinc-300/90 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-600 focus-within:border-zinc-600 dark:focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-400/20 dark:focus-within:ring-zinc-600/30 rounded-sm px-3.5 py-1.5 sm:py-2 transition-all duration-200 shadow-xs">
          {/* File Attachment Badges */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 px-1 pt-1">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 rounded-full text-xs text-zinc-800 dark:text-zinc-200"
                >
                  <Paperclip size={13} className="text-zinc-600 dark:text-zinc-400" />
                  <span className="truncate max-w-[120px] font-medium">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="text-zinc-400 hover:text-rose-500 p-0.5 rounded-full transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Form Composer Row */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.md"
              className="hidden"
            />

            {/* Plus / Add Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 shrink-0 cursor-pointer active:scale-90 group disabled:opacity-50"
              title={isKm ? 'ភ្ជាប់ឯកសារ ឬរូបភាព' : 'Add attachment'}
            >
              <Plus size={17} className="group-hover:scale-110 transition-transform duration-200" />
            </button>

            {/* Auto-growing Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={
                isKm
                  ? 'សួរអ្វីមួយអំពីកម្ពុជា ឬប្រធានបទណាមួយ...'
                  : 'Message AngkorVers AI...'
              }
              disabled={isLoading}
              className={`w-full bg-transparent text-[14px] sm:text-[15px] leading-relaxed text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none resize-none px-1 py-1 max-h-36 min-h-[28px] ${
                isKm || /[\u1780-\u17FF]/.test(text) ? 'font-khmer' : ''
              }`}
            />

            {/* Submit or Stop Button */}
            {isLoading ? (
              <button
                type="button"
                onClick={onStopGenerating}
                className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 flex items-center justify-center shrink-0 shadow-xs transition-all duration-200 active:scale-90 cursor-pointer"
                title={isKm ? 'បញ្ឈប់ការបង្កើត' : 'Stop generating'}
                aria-label="Stop generating"
              >
                <Square size={11} className="fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 active:scale-90 ${
                  canSubmit
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-xs cursor-pointer'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                }`}
                title={isKm ? 'ផ្ញើសារ' : 'Send message'}
                aria-label="Send message"
              >
                <ArrowUp size={17} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Disclaimer footer under input */}
        {!isCentered && (
          <p className="text-[11px] text-center text-zinc-400 dark:text-zinc-500 mt-2 select-none">
            {isKm
              ? 'AngkorVers AI អាចមានកំហុសឆ្គង។ សូមផ្ទៀងផ្ទាត់ព័ត៌មានសំខាន់ៗ។'
              : 'AngkorVers AI can make mistakes. Verify important facts.'}
          </p>
        )}
      </form>
    </div>
  );
}

