export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'theme';

/**
 * Obtiene el tema inicial desde localStorage o preferencia del sistema
 */
export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'dark'; // Default para SSR
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  if (stored && ['light', 'dark', 'system'].includes(stored)) {
    return stored;
  }

  return 'system';
}

/**
 * Obtiene el tema efectivo (resuelve 'system' a 'light' o 'dark')
 */
export function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window === 'undefined') {
      return 'dark'; // Default para SSR
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

/**
 * Aplica el tema al documento HTML
 */
export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') {
    return;
  }

  const effectiveTheme = getEffectiveTheme(theme);
  document.documentElement.setAttribute('data-theme', effectiveTheme);
}

/**
 * Guarda el tema en localStorage
 */
export function saveTheme(theme: Theme) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

