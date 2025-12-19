'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  applyThemeToDocument,
  applyHueToDocument,
  getStoredTheme,
  setStoredTheme,
  getStoredHue,
  setStoredHue,
  DEFAULT_HUE,
  type ThemeMode,
} from '~/lib/theme-utils';
import type { ThemeContextValue } from '~/types/theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [hue, setHueState] = useState<number>(DEFAULT_HUE);
  const [mounted, setMounted] = useState(false);

  // Initialize on mount
  useEffect(() => {
    const storedMode = getStoredTheme();
    const storedHue = getStoredHue();

    setModeState(storedMode);
    setHueState(storedHue);

    applyThemeToDocument(storedMode);
    applyHueToDocument(storedHue);

    setMounted(true);
  }, []);

  // Listen to system color scheme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (mode === 'auto') {
        applyThemeToDocument('auto');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode, mounted]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    setStoredTheme(newMode);
    applyThemeToDocument(newMode);
  };

  const setHue = (newHue: number) => {
    const clampedHue = Math.max(0, Math.min(360, newHue));
    setHueState(clampedHue);
    setStoredHue(clampedHue);
    applyHueToDocument(clampedHue);
  };

  const toggleMode = () => {
    const sequence: ThemeMode[] = ['light', 'dark', 'auto'];
    const currentIndex = sequence.indexOf(mode);
    const nextMode = sequence[(currentIndex + 1) % sequence.length]!;
    setMode(nextMode);
  };

  const resetHue = () => {
    setHue(DEFAULT_HUE);
  };

  const value: ThemeContextValue = {
    mode,
    hue,
    setMode,
    setHue,
    toggleMode,
    resetHue,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
