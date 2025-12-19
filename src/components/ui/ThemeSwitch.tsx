'use client';

import React, { useState } from 'react';
import { Sun, Moon, Circle } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeSwitch() {
  const { mode, setMode } = useTheme();
  const [showPanel, setShowPanel] = useState(false);

  const getIcon = () => {
    switch (mode) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'auto':
        return <Circle className="h-5 w-5" />;
    }
  };

  const getModeLabel = (m: typeof mode) => {
    switch (m) {
      case 'light':
        return '浅色模式';
      case 'dark':
        return '深色模式';
      case 'auto':
        return '跟随系统';
    }
  };

  return (
    <div
      className="relative z-50"
      onMouseEnter={() => setShowPanel(true)}
      onMouseLeave={() => setShowPanel(false)}
    >
      <button
        aria-label="切换主题"
        className="btn-plain scale-animation h-11 w-11 rounded-lg"
        onClick={() => {
          const sequence: Array<typeof mode> = ['light', 'dark', 'auto'];
          const currentIndex = sequence.indexOf(mode);
          const nextMode = sequence[(currentIndex + 1) % sequence.length]!;
          setMode(nextMode);
        }}
      >
        {getIcon()}
      </button>

      {/* Floating Panel */}
      <div
        className={`
          absolute top-11 -right-2 pt-5
          hidden lg:block
          transition-all
          ${showPanel ? '' : 'float-panel-closed'}
        `}
      >
        <div className="card-base float-panel p-2 min-w-[10rem]">
          {(['light', 'dark', 'auto'] as const).map((m) => (
            <button
              key={m}
              className={`
                flex items-center justify-start w-full
                btn-plain scale-animation rounded-lg h-9 px-3
                font-medium mb-0.5 last:mb-0
                ${mode === m ? 'current-theme-btn' : ''}
              `}
              onClick={() => setMode(m)}
            >
              {m === 'light' && <Sun className="h-5 w-5 mr-3" />}
              {m === 'dark' && <Moon className="h-5 w-5 mr-3" />}
              {m === 'auto' && <Circle className="h-5 w-5 mr-3" />}
              {getModeLabel(m)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
