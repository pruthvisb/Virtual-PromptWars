import React from 'react';

interface PlantAvatarProps {
  username: string;
  className?: string;
}

export default function PlantAvatar({ username, className = "w-10 h-10" }: PlantAvatarProps) {
  let hash = 0;
  const name = username || 'User';
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 5;

  const gradients = [
    <radialGradient id="grad0" cx="50%" cy="50%" r="50%" key="g0">
      <stop offset="0%" stopColor="#d1fae5" />
      <stop offset="100%" stopColor="#a7f3d0" />
    </radialGradient>,
    <radialGradient id="grad1" cx="50%" cy="50%" r="50%" key="g1">
      <stop offset="0%" stopColor="#ecfdf5" />
      <stop offset="100%" stopColor="#d1fae5" />
    </radialGradient>,
    <radialGradient id="grad2" cx="50%" cy="50%" r="50%" key="g2">
      <stop offset="0%" stopColor="#fffbeb" />
      <stop offset="100%" stopColor="#fef3c7" />
    </radialGradient>,
    <radialGradient id="grad3" cx="50%" cy="50%" r="50%" key="g3">
      <stop offset="0%" stopColor="#fdf2f8" />
      <stop offset="100%" stopColor="#fce7f3" />
    </radialGradient>,
    <radialGradient id="grad4" cx="50%" cy="50%" r="50%" key="g4">
      <stop offset="0%" stopColor="#ecfeff" />
      <stop offset="100%" stopColor="#cffafe" />
    </radialGradient>
  ];

  switch (index) {
    case 0:
      return (
        <svg viewBox="0 0 100 100" className={`${className} rounded-full overflow-hidden shadow-inner`}>
          <defs>{gradients[0]}</defs>
          <circle cx="50" cy="50" r="48" fill="url(#grad0)" />
          <path d="M 30 75 Q 50 68 70 75 Z" fill="#78350f" />
          <path d="M 50 70 Q 52 50 48 35" fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" />
          <path d="M 50 55 Q 35 45 42 35 Q 50 45 50 55" fill="#34d399" />
          <path d="M 50 45 Q 65 35 58 25 Q 50 35 50 45" fill="#10b981" />
        </svg>
      );
    case 1:
      return (
        <svg viewBox="0 0 100 100" className={`${className} rounded-full overflow-hidden shadow-inner`}>
          <defs>{gradients[1]}</defs>
          <circle cx="50" cy="50" r="48" fill="url(#grad1)" />
          <path d="M 50 80 Q 50 50 50 30" fill="none" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
          <path d="M 50 80 Q 30 40 35 60 C 40 70 48 78 50 80 Q 70 40 65 60 C 60 70 52 78 50 80 Z" fill="#10b981" />
          <circle cx="42" cy="50" r="3" fill="#ecfdf5" />
          <circle cx="58" cy="50" r="3" fill="#ecfdf5" />
          <circle cx="45" cy="62" r="3" fill="#ecfdf5" />
          <circle cx="55" cy="62" r="3" fill="#ecfdf5" />
        </svg>
      );
    case 2:
      return (
        <svg viewBox="0 0 100 100" className={`${className} rounded-full overflow-hidden shadow-inner`}>
          <defs>{gradients[2]}</defs>
          <circle cx="50" cy="50" r="48" fill="url(#grad2)" />
          <rect x="46" y="32" width="8" height="28" rx="4" fill="#059669" />
          <path d="M 46 45 H 38 V 38" fill="none" stroke="#059669" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 54 48 H 62 V 41" fill="none" stroke="#059669" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 36 68 L 41 82 H 59 L 64 68 Z" fill="#d97706" />
          <rect x="34" y="63" width="32" height="5" rx="2" fill="#b45309" />
        </svg>
      );
    case 3:
      return (
        <svg viewBox="0 0 100 100" className={`${className} rounded-full overflow-hidden shadow-inner`}>
          <defs>{gradients[3]}</defs>
          <circle cx="50" cy="50" r="48" fill="url(#grad3)" />
          <path d="M 50 78 Q 53 60 50 48" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="34" r="9" fill="#ec4899" />
          <circle cx="50" cy="52" r="9" fill="#ec4899" />
          <circle cx="41" cy="43" r="9" fill="#ec4899" />
          <circle cx="59" cy="43" r="9" fill="#ec4899" />
          <circle cx="50" cy="43" r="7" fill="#fbbf24" />
        </svg>
      );
    case 4:
    default:
      return (
        <svg viewBox="0 0 100 100" className={`${className} rounded-full overflow-hidden shadow-inner`}>
          <defs>{gradients[4]}</defs>
          <circle cx="50" cy="50" r="48" fill="url(#grad4)" />
          <rect x="47" y="68" width="6" height="14" rx="2" fill="#78350f" />
          <polygon points="50,22 33,43 67,43" fill="#065f46" />
          <polygon points="50,36 30,57 70,57" fill="#047857" />
          <polygon points="50,48 26,69 74,69" fill="#10b981" />
        </svg>
      );
  }
}
