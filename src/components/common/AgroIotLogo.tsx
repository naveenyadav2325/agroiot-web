import React from 'react';

interface AgroIotLogoProps {
  className?: string;
  showTagline?: boolean;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AgroIotLogo: React.FC<AgroIotLogoProps> = ({
  className = '',
  showTagline = true,
  iconOnly = false,
  size = 'md',
}) => {
  const iconSizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const taglineSizeClasses = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* High-Tech Leaf + IoT Circuit Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizeClasses[size]}`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(34,197,94,0.4)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>
            <linearGradient id="logoNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Circuit connection traces */}
          <path
            d="M50 85 L50 55 L25 40"
            stroke="#22c55e"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M50 55 L75 40"
            stroke="#38bdf8"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M50 35 L50 15"
            stroke="#22c55e"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Telemetry wave rings */}
          <path
            d="M75 25 A35 35 0 0 1 82 55"
            stroke="#4ade80"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M82 18 A45 45 0 0 1 90 62"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
            strokeDasharray="3 3"
          />

          {/* Sprouting Tech Leaf Pair */}
          <path
            d="M50 65 C22 60 12 38 24 18 C35 30 44 42 50 65 Z"
            fill="url(#logoLeafGrad)"
          />
          <path
            d="M50 65 C76 60 86 32 74 12 C64 26 56 42 50 65 Z"
            fill="url(#logoLeafGrad)"
            opacity="0.92"
          />

          {/* Center Stem */}
          <line
            x1="50"
            y1="75"
            x2="50"
            y2="14"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Glowing IoT Nodes */}
          <circle cx="25" cy="40" r="4.5" fill="#38bdf8" />
          <circle cx="75" cy="40" r="4.5" fill="#22c55e" />
          <circle cx="50" cy="14" r="5" fill="#4ade80" />
          <circle cx="50" cy="85" r="4.5" fill="#10b981" />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col">
          <div className={`font-extrabold tracking-tight text-white font-heading leading-tight ${textSizeClasses[size]}`}>
            <span>AGRO</span>
            <span className="text-emerald-500">-</span>
            <span className="text-cyan-400">IOT</span>
          </div>
          {showTagline && (
            <span className={`font-semibold tracking-wider uppercase text-slate-400 font-sans leading-none mt-0.5 ${taglineSizeClasses[size]}`}>
              Smart Farming<span className="text-emerald-500">.</span> Smarter Decisions<span className="text-cyan-400">.</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
