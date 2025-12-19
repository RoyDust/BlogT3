/**
 * Theme Utility Functions
 * Handles theme mode (light/dark/auto) and hue customization
 * Based on RealBlog's theming system
 */

export const DEFAULT_HUE = 250;
export const THEME_STORAGE_KEY = 'theme-mode';
export const HUE_STORAGE_KEY = 'theme-hue';

export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * Get system color scheme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply theme mode to document
 */
export function applyThemeToDocument(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;

  const effectiveTheme = mode === 'auto' ? getSystemTheme() : mode;

  if (effectiveTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Apply hue value to document
 */
export function applyHueToDocument(hue: number): void {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--hue', hue.toString());
}

/**
 * Get stored theme from localStorage
 */
export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'auto';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored;
  }
  return 'auto';
}

/**
 * Save theme to localStorage
 */
export function setStoredTheme(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_STORAGE_KEY, mode);
}

/**
 * Get stored hue from localStorage
 */
export function getStoredHue(): number {
  if (typeof window === 'undefined') return DEFAULT_HUE;
  const stored = localStorage.getItem(HUE_STORAGE_KEY);
  const parsed = stored ? parseInt(stored, 10) : DEFAULT_HUE;
  return isNaN(parsed) ? DEFAULT_HUE : Math.max(0, Math.min(360, parsed));
}

/**
 * Save hue to localStorage
 */
export function setStoredHue(hue: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HUE_STORAGE_KEY, hue.toString());
}

/**
 * Initialize theme (call in <head> to prevent flash)
 * Returns inline script string
 */
export function getThemeInitScript(): string {
  return `
    (function() {
      try {
        const storedTheme = localStorage.getItem('${THEME_STORAGE_KEY}') || 'auto';
        const storedHue = localStorage.getItem('${HUE_STORAGE_KEY}') || '${DEFAULT_HUE}';

        // Apply theme
        const effectiveTheme = storedTheme === 'auto'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : storedTheme;

        if (effectiveTheme === 'dark') {
          document.documentElement.classList.add('dark');
        }

        // Apply hue
        const hue = parseInt(storedHue, 10);
        if (!isNaN(hue)) {
          document.documentElement.style.setProperty('--hue', hue.toString());
        }
      } catch (e) {
        console.error('Failed to initialize theme:', e);
      }
    })();
  `;
}
