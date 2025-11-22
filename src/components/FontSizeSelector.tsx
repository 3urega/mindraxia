'use client';

import { useState, useEffect } from 'react';

export type FontSize = 'small' | 'normal' | 'large';
export type FontFamily = 'roboto' | 'sans-serif' | 'montserrat';

const FONT_SIZE_KEY = 'blog-font-size';
const FONT_FAMILY_KEY = 'blog-font-family';

const fontSizeClasses: Record<FontSize, string> = {
  small: 'text-sm',
  normal: 'text-base',
  large: 'text-lg',
};

const fontFamilyClasses: Record<FontFamily, string> = {
  roboto: '',
  'sans-serif': 'font-sans',
  montserrat: '',
};

const fontFamilyNames: Record<FontFamily, string> = {
  roboto: 'Roboto',
  'sans-serif': 'Sans-serif',
  montserrat: 'Montserrat',
};

interface FontSizeSelectorProps {
  onFontSizeChange?: (size: FontSize) => void;
  onFontFamilyChange?: (family: FontFamily) => void;
}

export default function FontSizeSelector({ onFontSizeChange, onFontFamilyChange }: FontSizeSelectorProps) {
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [fontFamily, setFontFamily] = useState<FontFamily>('sans-serif');

  useEffect(() => {
    // Cargar preferencias guardadas
    const savedSize = localStorage.getItem(FONT_SIZE_KEY);
    if (savedSize && (savedSize === 'small' || savedSize === 'normal' || savedSize === 'large')) {
      setFontSize(savedSize);
      onFontSizeChange?.(savedSize);
    }
    
    const savedFamily = localStorage.getItem(FONT_FAMILY_KEY);
    if (savedFamily && (savedFamily === 'roboto' || savedFamily === 'sans-serif' || savedFamily === 'montserrat')) {
      setFontFamily(savedFamily);
      onFontFamilyChange?.(savedFamily);
    }
  }, [onFontSizeChange, onFontFamilyChange]);

  const handleSizeChange = (newSize: FontSize) => {
    setFontSize(newSize);
    localStorage.setItem(FONT_SIZE_KEY, newSize);
    onFontSizeChange?.(newSize);
    
    // Disparar evento personalizado para que MarkdownRenderer se actualice
    window.dispatchEvent(new CustomEvent('fontSizeChanged', { detail: newSize }));
  };

  const handleFamilyChange = (newFamily: FontFamily) => {
    setFontFamily(newFamily);
    localStorage.setItem(FONT_FAMILY_KEY, newFamily);
    onFontFamilyChange?.(newFamily);
    
    // Disparar evento personalizado para que MarkdownRenderer se actualice
    window.dispatchEvent(new CustomEvent('fontFamilyChanged', { detail: newFamily }));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Selector de tamaño */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-muted">Tamaño:</span>
        <div className="flex gap-1 border rounded-lg p-1" style={{ borderColor: 'var(--border-glow)' }}>
          <button
            type="button"
            onClick={() => handleSizeChange('small')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              fontSize === 'small'
                ? 'bg-star-cyan/20 text-star-cyan border border-star-cyan/50'
                : 'text-text-muted hover:text-text-secondary'
            }`}
            title="Pequeña"
          >
            A
          </button>
          <button
            type="button"
            onClick={() => handleSizeChange('normal')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              fontSize === 'normal'
                ? 'bg-star-cyan/20 text-star-cyan border border-star-cyan/50'
                : 'text-text-muted hover:text-text-secondary'
            }`}
            title="Normal"
          >
            A
          </button>
          <button
            type="button"
            onClick={() => handleSizeChange('large')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              fontSize === 'large'
                ? 'bg-star-cyan/20 text-star-cyan border border-star-cyan/50'
                : 'text-text-muted hover:text-text-secondary'
            }`}
            title="Grande"
          >
            A
          </button>
        </div>
      </div>

      {/* Selector de fuente */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-muted">Fuente:</span>
        <div className="flex gap-1 border rounded-lg p-1" style={{ borderColor: 'var(--border-glow)' }}>
          <button
            type="button"
            onClick={() => handleFamilyChange('roboto')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              fontFamily === 'roboto'
                ? 'bg-star-cyan/20 text-star-cyan border border-star-cyan/50'
                : 'text-text-muted hover:text-text-secondary'
            }`}
            title="Roboto"
            style={fontFamily === 'roboto' ? { fontFamily: 'var(--font-roboto), sans-serif' } : {}}
          >
            {fontFamilyNames.roboto}
          </button>
          <button
            type="button"
            onClick={() => handleFamilyChange('sans-serif')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              fontFamily === 'sans-serif'
                ? 'bg-star-cyan/20 text-star-cyan border border-star-cyan/50'
                : 'text-text-muted hover:text-text-secondary'
            }`}
            title="Sans-serif"
            style={fontFamily === 'sans-serif' ? { fontFamily: 'Arial, sans-serif' } : {}}
          >
            {fontFamilyNames['sans-serif']}
          </button>
          <button
            type="button"
            onClick={() => handleFamilyChange('montserrat')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              fontFamily === 'montserrat'
                ? 'bg-star-cyan/20 text-star-cyan border border-star-cyan/50'
                : 'text-text-muted hover:text-text-secondary'
            }`}
            title="Montserrat"
            style={fontFamily === 'montserrat' ? { fontFamily: 'var(--font-montserrat), sans-serif' } : {}}
          >
            {fontFamilyNames.montserrat}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useFontSize(): FontSize {
  if (typeof window === 'undefined') {
    return 'normal';
  }
  
  const saved = localStorage.getItem(FONT_SIZE_KEY);
  if (saved && (saved === 'small' || saved === 'normal' || saved === 'large')) {
    return saved;
  }
  
  return 'normal';
}

export function useFontFamily(): FontFamily {
  if (typeof window === 'undefined') {
    return 'sans-serif';
  }
  
  const saved = localStorage.getItem(FONT_FAMILY_KEY);
  if (saved && (saved === 'roboto' || saved === 'sans-serif' || saved === 'montserrat')) {
    return saved;
  }
  
  return 'sans-serif';
}

export function getFontSizeClass(size: FontSize): string {
  return fontSizeClasses[size];
}

export function getFontFamilyClass(family: FontFamily): string {
  return fontFamilyClasses[family];
}

