'use client';

import React from 'react';

type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: LogoSize;
}

const sizeMap: Record<LogoSize, { container: string; letter: string; text: string }> = {
  sm: { container: 'w-7 h-7 rounded-lg', letter: 'text-lg', text: 'text-base' },
  md: { container: 'w-10 h-10 rounded-xl', letter: 'text-2xl', text: 'text-xl' },
  lg: { container: 'w-20 h-20 rounded-2xl shadow-2xl shadow-blue-500/30', letter: 'text-5xl', text: 'text-3xl' },
};

export const Logo: React.FC<LogoProps> = ({ className = '', iconOnly = false, size = 'md' }) => {
  const s = sizeMap[size];
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`flex-shrink-0 ${s.container} bg-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
      >
        <span
          className={`${s.letter} font-black text-white leading-none select-none`}
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif", letterSpacing: '-0.02em' }}
        >
          P
        </span>
      </div>
      {!iconOnly && (
        <span
          className={`font-black tracking-tight bg-gradient-to-r from-secondary-900 to-primary-700 dark:from-white dark:to-primary-200 bg-clip-text text-transparent font-display ${s.text}`}
        >
          Prephire
        </span>
      )}
    </div>
  );
};
