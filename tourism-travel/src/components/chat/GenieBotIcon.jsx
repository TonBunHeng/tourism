import { useId } from 'react';

export default function GenieBotIcon({ className = 'w-full h-full', animate = true }) {
  const uid = useId();
  const bgId = `genieBg-${uid}`;
  const bodyGradId = `genieBodyGrad-${uid}`;
  const highlightId = `genieHighlight-${uid}`;
  const badgeGradId = `badgeGrad-${uid}`;
  const eyeGradId = `eyeGrad-${uid}`;
  const badgeShadowId = `badgeShadow-${uid}`;

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Deep royal blue circular background */}
          <radialGradient id={bgId} cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1e58c8" />
            <stop offset="65%" stopColor="#0d3580" />
            <stop offset="100%" stopColor="#07235b" />
          </radialGradient>

          {/* Genie character body gradient */}
          <linearGradient id={bodyGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#64a5ff" />
            <stop offset="45%" stopColor="#438eff" />
            <stop offset="100%" stopColor="#256eec" />
          </linearGradient>

          {/* Soft top highlight */}
          <linearGradient id={highlightId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Pill Badge gradient */}
          <linearGradient id={badgeGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          {/* Eye gradient */}
          <linearGradient id={eyeGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#0f2b66" />
          </linearGradient>

          {/* Inner shadow filter */}
          <filter id={badgeShadowId} x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Circular Background */}
        <circle
          cx="50"
          cy="50"
          r="47"
          fill={`url(#${bgId})`}
          stroke="#3b82f6"
          strokeWidth="2"
          strokeOpacity="0.5"
        />

        {/* Floating Genie Group */}
        <g className={animate ? 'animate-genie-float' : ''}>
          {/* Genie Head / Body with Top Tuft */}
          <path
            d="M 50 17 
               C 53 19, 55 24, 57 27 
               C 67 31, 74 41, 73 54 
               C 72 65, 63 71, 50 71 
               C 37 71, 28 65, 27 54 
               C 26 41, 33 31, 43 27 
               C 45 24, 47 19, 50 17 Z"
            fill={`url(#${bodyGradId})`}
            filter="drop-shadow(0 2px 3px rgba(0,0,0,0.25))"
          />

          {/* Head 3D Highlight Curve */}
          <path
            d="M 50 20 
               C 47 22, 45 26, 44 29 
               C 36 33, 30 42, 31 52 
               C 32 43, 38 34, 47 30 
               C 49 26, 50 22, 50 20 Z"
            fill={`url(#${highlightId})`}
          />

          {/* Face Visor Area (White/Pale Ice Blue) */}
          <path
            d="M 35 45 
               C 35 38, 41 33, 50 33 
               C 59 33, 65 38, 65 45 
               C 65 53, 59 58, 50 58 
               C 41 58, 35 53, 35 45 Z"
            fill="#f0f7ff"
            filter="drop-shadow(0 1px 1px rgba(0,0,0,0.1))"
          />

          {/* Eyes Group with Blinking */}
          <g
            className={animate ? 'animate-genie-blink' : ''}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            {/* Left Eye */}
            <ellipse cx="43.5" cy="44.5" rx="3.2" ry="5.2" fill={`url(#${eyeGradId})`} />
            <circle cx="44.8" cy="42.8" r="1.3" fill="#ffffff" />

            {/* Right Eye */}
            <ellipse cx="56.5" cy="44.5" rx="3.2" ry="5.2" fill={`url(#${eyeGradId})`} />
            <circle cx="57.8" cy="42.8" r="1.3" fill="#ffffff" />
          </g>

          {/* GENIE Capsule Badge */}
          <g filter={`url(#${badgeShadowId})`}>
            <rect
              x="29"
              y="60"
              width="42"
              height="16"
              rx="8"
              fill={`url(#${badgeGradId})`}
              stroke="#ffffff"
              strokeWidth="1.2"
            />
            {/* GENIE Text */}
            <text
              x="50"
              y="71.5"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="8.5"
              fontWeight="900"
              letterSpacing="1"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            >
              GENIE
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
