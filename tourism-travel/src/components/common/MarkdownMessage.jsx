// Safely parse inline formatting: bold, italic, inline-code, and links
function parseInline(text) {
  if (!text) return null;

  // Regex to split on bold (**...**), inline code (`...`), links ([...](...)), and italics (*...*)
  const tokens = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // 1. Bold: **text**
    const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
    if (boldMatch) {
      tokens.push(
        <strong key={keyIndex++} className="font-semibold text-zinc-900 dark:text-white">
          {boldMatch[2]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // 2. Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      tokens.push(
        <code 
          key={keyIndex++} 
          className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-mono text-xs border border-zinc-200 dark:border-zinc-700"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // 3. Link: [text](url)
    const linkMatch = remaining.match(/^\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      tokens.push(
        <a
          key={keyIndex++}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline font-medium transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // 4. Italic: *text* (single asterisk)
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      tokens.push(
        <em key={keyIndex++} className="text-zinc-600 dark:text-zinc-300 italic">
          {italicMatch[1]}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Regular plain text up to next special char
    const nextSpecial = remaining.search(/(\*\*|__|`|\[|\*)/);
    if (nextSpecial === -1) {
      tokens.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      tokens.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      tokens.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return tokens;
}

export default function MarkdownMessage({ content = '' }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let i = 0;
  let blockKey = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Empty line
    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Headers
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={blockKey++} className="text-base font-bold text-zinc-900 dark:text-white mt-4 mb-2 tracking-tight">
          {parseInline(trimmed.slice(4))}
        </h4>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={blockKey++} className="text-xl font-bold text-zinc-900 dark:text-white mt-5 mb-2.5 tracking-tight">
          {parseInline(trimmed.slice(3))}
        </h3>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={blockKey++} className="text-2xl font-black text-zinc-900 dark:text-white mt-6 mb-3 tracking-tight">
          {parseInline(trimmed.slice(2))}
        </h2>
      );
      i++;
      continue;
    }

    // 2. Blockquotes
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote
          key={blockKey++}
          className="my-3 border-l-2 border-zinc-400 dark:border-zinc-600 pl-4 py-1 text-zinc-600 dark:text-zinc-300 text-[14px] italic bg-zinc-50 dark:bg-zinc-900/50 rounded-r-xl"
        >
          {parseInline(trimmed.slice(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    // 3. Tables: lines containing "|"
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableRows = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        const rowStr = lines[i].trim();
        // Skip separator row |---|---|
        if (!rowStr.match(/^\|(?:\s*:?-+:?\s*\|)+$/)) {
          const cells = rowStr
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());
          tableRows.push(cells);
        }
        i++;
      }

      if (tableRows.length > 0) {
        const headerCells = tableRows[0];
        const bodyRows = tableRows.slice(1);

        elements.push(
          <div key={blockKey++} className="my-3 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  {headerCells.map((cell, cIdx) => (
                    <th key={cIdx} className="px-3.5 py-2.5 text-zinc-800 dark:text-zinc-100">
                      {parseInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3.5 py-2.5 text-zinc-700 dark:text-zinc-300">
                        {parseInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // 4. Bullet lists: * or -
    if (trimmed.match(/^(\*|-)\s+/)) {
      const listItems = [];
      while (i < lines.length && lines[i].trim().match(/^(\*|-)\s+/)) {
        const itemText = lines[i].trim().replace(/^(\*|-)\s+/, '');
        listItems.push(itemText);
        i++;
      }

      elements.push(
        <ul key={blockKey++} className="my-2.5 space-y-2 pl-0.5">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="flex items-start gap-2.5 text-[15px] text-zinc-800 dark:text-zinc-200 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 dark:bg-zinc-400 mt-2.5 shrink-0" />
              <div className="flex-1">{parseInline(item)}</div>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 5. Numbered lists: 1. 2. etc.
    if (trimmed.match(/^\d+\.\s+/)) {
      const listItems = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s+/)) {
        const itemText = lines[i].trim().replace(/^\d+\.\s+/, '');
        listItems.push(itemText);
        i++;
      }

      elements.push(
        <ol key={blockKey++} className="my-2.5 space-y-2 pl-0.5">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="flex items-start gap-2.5 text-[15px] text-zinc-800 dark:text-zinc-200 leading-relaxed">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-md px-1.5 py-0.5 mt-0.5 shrink-0 border border-zinc-200 dark:border-zinc-700">
                {lIdx + 1}
              </span>
              <div className="flex-1">{parseInline(item)}</div>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 6. Regular paragraph
    elements.push(
      <p key={blockKey++} className="my-2 text-[15px] text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal">
        {parseInline(trimmed)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}
