/**
 * Theme System Type Definitions
 * Based on RealBlog's theming approach
 */

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  mode: ThemeMode;
  hue: number;
}

export interface ThemeContextValue {
  mode: ThemeMode;
  hue: number;
  setMode: (mode: ThemeMode) => void;
  setHue: (hue: number) => void;
  toggleMode: () => void;
  resetHue: () => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  defaultHue?: number;
}
