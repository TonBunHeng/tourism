export default function GenieAvatar({ size = 48, showBadge = false, className = '' }) {
  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="genieBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="crestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>

        {/* Circular base */}
        <circle cx="50" cy="50" r="48" fill="url(#genieBg)" />

        {/* Outer glowing halo ring inside circle */}
        <circle cx="50" cy="50" r="44" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.4" />

        {/* Cute Genie Head with Top Crest / Curl */}
        <path
          d="M 50 14 C 44 14, 38 19, 41 26 C 29 30, 20 42, 20 56 C 20 74, 34 86, 50 86 C 66 86, 80 74, 80 56 C 80 42, 71 30, 59 26 C 62 19, 56 14, 50 14 Z"
          fill="url(#crestGrad)"
        />

        {/* Smooth Inner Face Visor Plate */}
        <path
          d="M 28 54 C 28 41, 37 34, 50 34 C 63 34, 72 41, 72 54 C 72 67, 63 73, 50 73 C 37 73, 28 67, 28 54 Z"
          fill="#F0F9FF"
        />

        {/* Cute Friendly Vertical Oval Eyes */}
        <rect x="39" y="47" width="6" height="13" rx="3" fill="#1D4ED8" />
        <rect x="55" y="47" width="6" height="13" rx="3" fill="#1D4ED8" />

        {/* Specular eye sparkles */}
        <circle cx="41" cy="50.5" r="1.5" fill="#BFDBFE" />
        <circle cx="57" cy="50.5" r="1.5" fill="#BFDBFE" />

        {/* Subtle friendly smile / chin curve */}
        <path
          d="M 45 65 Q 50 68 55 65"
          stroke="#93C5FD"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Floating pill badge "GENIE" at bottom */}
        {showBadge && (
          <g>
            <rect
              x="18"
              y="73"
              width="64"
              height="22"
              rx="11"
              fill="url(#badgeGrad)"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            <text
              x="50"
              y="88.5"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="11"
              fontWeight="900"
              letterSpacing="1"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              GENIE
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
