'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { DEFAULT_HUE } from '~/lib/theme-utils';

interface HuePickerProps {
  isOpen: boolean;
}

export function HuePicker({ isOpen }: HuePickerProps) {
  const { hue, setHue, resetHue } = useTheme();

  return (
    <div
      id="hue-picker-panel"
      className={`
        absolute top-[5.25rem] right-4 w-80
        float-panel px-4 py-4
        transition-all
        ${isOpen ? '' : 'float-panel-closed'}
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 font-bold text-lg text-90 relative ml-3">
          {/* Accent bar */}
          <div className="absolute -left-3 top-[0.33rem] w-1 h-4 rounded-md bg-[var(--primary)]" />
          主题色

          <button
            aria-label="重置为默认"
            className={`
              btn-regular w-7 h-7 rounded-md
              transition-all
              ${hue === DEFAULT_HUE ? 'opacity-0 pointer-events-none' : ''}
            `}
            onClick={resetHue}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="bg-[var(--btn-regular-bg)] w-10 h-7 rounded-md flex items-center justify-center font-bold text-sm text-[var(--btn-content)] transition">
          {hue}
        </div>
      </div>

      {/* Rainbow Slider */}
      <div className="relative w-full h-6 rounded select-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'var(--color-selection-bar)',
          }}
        />
        <input
          type="range"
          min="0"
          max="360"
          step="5"
          value={hue}
          onChange={(e) => setHue(parseInt(e.target.value, 10))}
          aria-label="主题色相"
          className="
            absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-2
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-sm
            [&::-webkit-slider-thumb]:bg-white/70
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:hover:bg-white/80
            [&::-webkit-slider-thumb]:active:bg-white/60
            [&::-webkit-slider-thumb]:transition
            [&::-moz-range-thumb]:w-2
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-sm
            [&::-moz-range-thumb]:bg-white/70
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:hover:bg-white/80
            [&::-moz-range-thumb]:active:bg-white/60
            [&::-moz-range-thumb]:transition
          "
        />
      </div>
    </div>
  );
}
