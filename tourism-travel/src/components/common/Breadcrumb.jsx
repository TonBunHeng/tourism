import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 font-medium overflow-x-auto no-scrollbar py-0.5">
      <Link to="/" className="hover:text-[#003E83] dark:hover:text-[#60a5fa] transition-colors shrink-0">
        Home
      </Link>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const target = item.to || item.path || item.href;
        return (
          <span key={idx} className="flex items-center gap-1.5 shrink-0">
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />
            {isLast || !target ? (
              <span className="text-gray-900 dark:text-white font-bold truncate max-w-xs sm:max-w-md">
                {item.label}
              </span>
            ) : (
              <Link to={target} className="hover:text-[#003E83] dark:hover:text-[#60a5fa] transition-colors truncate">
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
