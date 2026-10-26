import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CarouselSlider({
  children,
  className = '',
  itemClassName = 'w-[85vw] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-12px)] shrink-0 snap-start',
}) {
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // tolerance of 4px for fractional zoom/subpixel rounding
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScroll();

    const resizeObserver = new ResizeObserver(() => checkScroll());
    resizeObserver.observe(el);

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, children]);

  const scroll = (direction) => {
    const el = containerRef.current;
    if (!el) return;
    // Scroll by roughly 85% of visible width for a natural paginated feel
    const scrollDistance = el.clientWidth * 0.85;
    el.scrollBy({
      left: direction === 'left' ? -scrollDistance : scrollDistance,
      behavior: 'smooth',
    });
  };

  const childArray = Array.isArray(children) ? children : [children];

  return (
    <div className={`relative group/carousel ${className}`}>
      {/* Left Navigation Button */}
      <button
        type="button"
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        className={`absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 dark:bg-zinc-800/95 border border-gray-200/90 dark:border-zinc-700 shadow-md hover:shadow-xl text-gray-800 dark:text-zinc-100 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
          canScrollLeft
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 -translate-x-2 pointer-events-none'
        }`}
        aria-label="Previous items"
        title="Scroll left"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
      </button>

      {/* Horizontal Scroll Container */}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1 no-scrollbar overscroll-x-contain"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {childArray.map((child, idx) => (
          <div key={idx} className={itemClassName}>
            {child}
          </div>
        ))}
      </div>

      {/* Right Navigation Button */}
      <button
        type="button"
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        className={`absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 dark:bg-zinc-800/95 border border-gray-200/90 dark:border-zinc-700 shadow-md hover:shadow-xl text-gray-800 dark:text-zinc-100 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
          canScrollRight
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 translate-x-2 pointer-events-none'
        }`}
        aria-label="Next items"
        title="Scroll right"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
      </button>
    </div>
  );
}
