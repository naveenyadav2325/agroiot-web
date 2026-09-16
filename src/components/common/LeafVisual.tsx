import React from 'react';

interface LeafVisualProps {
  type: string;
  className?: string;
}

export const LeafVisual: React.FC<LeafVisualProps> = ({ type, className = 'w-16 h-16' }) => {
  switch (type) {
    case 'early_blight':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 90 C25 80 15 50 30 20 C42 32 50 45 50 90 Z" fill="#65a30d" />
          <path d="M50 90 C75 80 85 45 70 15 C58 28 50 45 50 90 Z" fill="#4d7c0f" />
          <line x1="50" y1="90" x2="50" y2="18" stroke="#365314" strokeWidth="2" />
          {/* Concentric rings lesions */}
          <circle cx="38" cy="45" r="9" fill="#78350f" opacity="0.8" />
          <circle cx="38" cy="45" r="5" fill="#451a03" />
          <circle cx="38" cy="45" r="11" stroke="#facc15" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
          <circle cx="62" cy="38" r="8" fill="#78350f" opacity="0.8" />
          <circle cx="62" cy="38" r="4" fill="#451a03" />
          <circle cx="62" cy="38" r="10" stroke="#facc15" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
          <circle cx="48" cy="62" r="6" fill="#78350f" opacity="0.7" />
        </svg>
      );
    case 'late_blight':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 90 C25 80 15 50 30 20 C42 32 50 45 50 90 Z" fill="#4d7c0f" />
          <path d="M50 90 C75 80 85 45 70 15 C58 28 50 45 50 90 Z" fill="#3f6212" />
          <line x1="50" y1="90" x2="50" y2="18" stroke="#1c1917" strokeWidth="2" />
          {/* Dark water-soaked necrotic patches */}
          <path d="M35 30 Q45 25 55 35 Q40 50 30 40 Z" fill="#1c1917" opacity="0.9" />
          <path d="M45 55 Q65 48 70 65 Q55 72 45 55 Z" fill="#292524" opacity="0.95" />
          {/* White spore mold edges */}
          <path d="M52 35 Q58 40 60 48" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <path d="M68 62 Q72 68 65 72" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
        </svg>
      );
    case 'spider_mites':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 90 C25 80 15 50 30 20 C42 32 50 45 50 90 Z" fill="#84cc16" />
          <path d="M50 90 C75 80 85 45 70 15 C58 28 50 45 50 90 Z" fill="#65a30d" />
          <line x1="50" y1="90" x2="50" y2="18" stroke="#3f6212" strokeWidth="2" />
          {/* Fine yellow stippling */}
          <g fill="#fef08a">
            <circle cx="35" cy="35" r="1.5" /><circle cx="42" cy="38" r="1.5" />
            <circle cx="38" cy="48" r="1.5" /><circle cx="45" cy="52" r="1.5" />
            <circle cx="60" cy="32" r="1.5" /><circle cx="65" cy="42" r="1.5" />
            <circle cx="58" cy="50" r="1.5" /><circle cx="68" cy="55" r="1.5" />
          </g>
          {/* Webbing lines */}
          <path d="M32 40 L50 48 L65 38" stroke="#f1f5f9" strokeWidth="1" opacity="0.75" />
          <path d="M38 52 L55 58 L70 50" stroke="#f1f5f9" strokeWidth="1" opacity="0.75" />
        </svg>
      );
    case 'nitrogen':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Chlorotic yellowing from bottom */}
          <defs>
            <linearGradient id="nitroGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#a3e635" />
              <stop offset="100%" stopColor="#4d7c0f" />
            </linearGradient>
          </defs>
          <path d="M50 90 C25 80 15 50 30 20 C42 32 50 45 50 90 Z" fill="url(#nitroGrad)" />
          <path d="M50 90 C75 80 85 45 70 15 C58 28 50 45 50 90 Z" fill="url(#nitroGrad)" opacity="0.9" />
          <line x1="50" y1="90" x2="50" y2="18" stroke="#ca8a04" strokeWidth="2" />
        </svg>
      );
    case 'healthy':
    default:
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="healthyGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>
          </defs>
          <path d="M50 90 C25 80 15 50 30 20 C42 32 50 45 50 90 Z" fill="url(#healthyGrad)" />
          <path d="M50 90 C75 80 85 45 70 15 C58 28 50 45 50 90 Z" fill="url(#healthyGrad)" opacity="0.9" />
          <line x1="50" y1="90" x2="50" y2="18" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <path d="M50 45 Q40 40 32 38" stroke="#ffffff" strokeWidth="1.5" opacity="0.5" />
          <path d="M50 60 Q60 55 68 52" stroke="#ffffff" strokeWidth="1.5" opacity="0.5" />
        </svg>
      );
  }
};
