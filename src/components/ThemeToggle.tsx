'use client';

import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from './ThemeProvider';
import { Theme, getInitialTheme, getEffectiveTheme, applyTheme, saveTheme } from '@/lib/theme';

export default function ThemeToggle() {
  const context = useContext(ThemeContext);
  const [localTheme, setLocalTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  // Si el contexto no está disponible, usar estado local
  const isContextAvailable = context !== undefined;

  useEffect(() => {
    if (!isContextAvailable) {
      const initialTheme = getInitialTheme();
      setLocalTheme(initialTheme);
      applyTheme(initialTheme);
      setMounted(true);
    }
  }, [isContextAvailable]);

  const theme = isContextAvailable ? context.theme : localTheme;
  const effectiveTheme = isContextAvailable ? context.effectiveTheme : getEffectiveTheme(localTheme);
  const changeTheme = isContextAvailable ? context.changeTheme : ((newTheme: Theme) => {
    setLocalTheme(newTheme);
    applyTheme(newTheme);
    saveTheme(newTheme);
  });
  const isMounted = isContextAvailable ? context.mounted : mounted;

  if (!isMounted) {
    // Mostrar placeholder mientras se carga
    return (
      <button
        type="button"
        className="w-10 h-10 rounded-lg border flex items-center justify-center transition-colors"
        style={{ borderColor: 'var(--border-glow)' }}
        aria-label="Cambiar tema"
        disabled
      >
        <span className="text-text-secondary">🌙</span>
      </button>
    );
  }

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    changeTheme(themes[nextIndex]);
  };

  const getIcon = () => {
    if (theme === 'system') {
      return '🖥️';
    }
    return effectiveTheme === 'light' ? '☀️' : '🌙';
  };

  const getLabel = () => {
    if (theme === 'system') {
      return `Sistema (${effectiveTheme === 'light' ? 'Claro' : 'Oscuro'})`;
    }
    return theme === 'light' ? 'Tema Claro' : 'Tema Oscuro';
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="w-10 h-10 rounded-lg border flex items-center justify-center transition-all hover:bg-space-secondary hover:border-star-cyan"
      style={{ borderColor: 'var(--border-glow)' }}
      aria-label={getLabel()}
      title={getLabel()}
    >
      <span className="text-lg" role="img" aria-hidden="true">
        {getIcon()}
      </span>
    </button>
  );
}

