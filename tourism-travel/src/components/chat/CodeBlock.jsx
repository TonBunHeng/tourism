import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CodeBlock({ code = '', lang = '', isKhmer = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy code:', e);
    }
  };

  return (
    <div className="my-3 rounded-sm overflow-hidden border border-zinc-800 bg-[#1e1e1e] shadow-md">
      {/* Code Header Bar with macOS-style window dots */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#252526] border-b border-zinc-800 text-xs">
        <div className="flex items-center space-x-2">
          <span className="flex space-x-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </span>
          <span className="font-mono text-zinc-400 text-[11px] font-medium lowercase">
            {lang || 'code'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[11px] font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 transition-all cursor-pointer active:scale-95"
          title={copied ? (isKhmer ? 'បានចម្លង!' : 'Copied!') : (isKhmer ? 'ចម្លងកូដ' : 'Copy code')}
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span>{isKhmer ? 'បានចម្លង' : 'Copied!'}</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>{isKhmer ? 'ចម្លង' : 'Copy code'}</span>
            </>
          )}
        </button>
      </div>

      {/* Code Block Content */}
      <div className="p-3.5 overflow-x-auto font-mono text-[13px] leading-relaxed text-zinc-100">
        <pre className="m-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

