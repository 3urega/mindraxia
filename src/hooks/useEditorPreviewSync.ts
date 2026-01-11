import { useEffect, useRef, useCallback } from 'react';

interface UseEditorPreviewSyncOptions {
  enabled: boolean; // Solo activar en modo split
  markdownContent: string;
  previewContainerRef: React.RefObject<HTMLDivElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

/**
 * Hook para sincronizar la posición del cursor en el editor con la preview
 */
export function useEditorPreviewSync({
  enabled,
  markdownContent,
  previewContainerRef,
  textareaRef,
}: UseEditorPreviewSyncOptions) {
  const isScrollingRef = useRef(false);
  const lastCursorLineRef = useRef<number>(-1);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Calcula la línea actual del cursor en el textarea
   */
  const getCurrentLine = useCallback((): number => {
    const textarea = textareaRef.current;
    if (!textarea) return 0;

    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = markdownContent.substring(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    
    return lines.length - 1; // Línea actual (0-indexed)
  }, [markdownContent, textareaRef]);

  /**
   * Encuentra el elemento en el preview que corresponde a la línea del markdown
   */
  const findElementForLine = useCallback((lineNumber: number): HTMLElement | null => {
    const previewContainer = previewContainerRef.current;
    if (!previewContainer) return null;

    // Buscar elementos con data-line-start y data-line-end
    const elements = previewContainer.querySelectorAll('[data-line-start]');
    
    for (const element of elements) {
      const startLine = parseInt(element.getAttribute('data-line-start') || '0', 10);
      const endLine = parseInt(element.getAttribute('data-line-end') || '0', 10);
      
      if (lineNumber >= startLine && lineNumber <= endLine) {
        return element as HTMLElement;
      }
    }

    // Si no encontramos un elemento exacto, buscar el más cercano
    let closestElement: HTMLElement | null = null;
    let closestDistance = Infinity;

    for (const element of elements) {
      const startLine = parseInt(element.getAttribute('data-line-start') || '0', 10);
      const distance = Math.abs(startLine - lineNumber);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestElement = element as HTMLElement;
      }
    }

    return closestElement;
  }, [previewContainerRef]);

  /**
   * Hace scroll al elemento correspondiente y lo resalta
   * Solo hace scroll dentro del contenedor del preview
   */
  const syncToLine = useCallback((lineNumber: number) => {
    if (!enabled || isScrollingRef.current) return;

    const previewContainer = previewContainerRef.current;
    if (!previewContainer) return;

    const element = findElementForLine(lineNumber);
    if (!element) return;

    // Remover highlight anterior
    const previousHighlight = previewContainer.querySelector('.editor-sync-highlight');
    if (previousHighlight) {
      previousHighlight.classList.remove('editor-sync-highlight');
    }

    // Agregar highlight al elemento actual
    element.classList.add('editor-sync-highlight');

    // Calcular posición del elemento relativa al contenedor
    // Usar offsetTop que da la posición relativa al offsetParent (el contenedor con scroll)
    let elementOffsetTop = 0;
    let currentElement: HTMLElement | null = element;
    
    // Sumar todos los offsetTop hasta llegar al contenedor del preview
    while (currentElement && currentElement !== previewContainer) {
      elementOffsetTop += currentElement.offsetTop;
      currentElement = currentElement.offsetParent as HTMLElement | null;
    }
    
    // Si offsetTop no funciona bien, usar getBoundingClientRect como fallback
    if (elementOffsetTop === 0 || elementOffsetTop > previewContainer.scrollHeight) {
      const containerRect = previewContainer.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const elementTopRelativeToContainer = elementRect.top - containerRect.top;
      elementOffsetTop = previewContainer.scrollTop + elementTopRelativeToContainer;
    }
    
    // Calcular la altura del contenedor visible
    const containerHeight = previewContainer.clientHeight;
    const elementHeight = element.offsetHeight || element.getBoundingClientRect().height;
    
    // Calcular el scroll necesario para centrar el elemento en el contenedor
    const targetScrollTop = elementOffsetTop - (containerHeight / 2) + (elementHeight / 2);
    
    // Asegurar que el scroll no sea negativo y no exceda el máximo
    const maxScroll = Math.max(0, previewContainer.scrollHeight - containerHeight);
    const finalScrollTop = Math.max(0, Math.min(targetScrollTop, maxScroll));

    // Hacer scroll SOLO dentro del contenedor del preview (no en la página)
    isScrollingRef.current = true;
    previewContainer.scrollTo({
      top: finalScrollTop,
      behavior: 'smooth',
    });

    // Resetear flag después de la animación
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 500);
  }, [enabled, findElementForLine, previewContainerRef]);

  /**
   * Sincroniza la preview con la posición actual del cursor
   */
  const sync = useCallback(() => {
    if (!enabled) return;

    // Limpiar timeout anterior
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Usar debounce para evitar demasiadas actualizaciones
    syncTimeoutRef.current = setTimeout(() => {
      const currentLine = getCurrentLine();
      
      // Solo sincronizar si cambió la línea
      if (currentLine !== lastCursorLineRef.current) {
        lastCursorLineRef.current = currentLine;
        syncToLine(currentLine);
      }
    }, 100); // 100ms de debounce
  }, [enabled, getCurrentLine, syncToLine]);

  /**
   * Maneja eventos del textarea para detectar cambios en el cursor
   */
  useEffect(() => {
    if (!enabled) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = () => {
      sync();
    };

    const handleSelectionChange = () => {
      sync();
    };

    const handleKeyUp = () => {
      sync();
    };

    const handleMouseUp = () => {
      sync();
    };

    // Escuchar eventos
    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('selectionchange', handleSelectionChange);
    textarea.addEventListener('keyup', handleKeyUp);
    textarea.addEventListener('mouseup', handleMouseUp);

    // Sincronizar inicialmente
    sync();

    return () => {
      textarea.removeEventListener('input', handleInput);
      textarea.removeEventListener('selectionchange', handleSelectionChange);
      textarea.removeEventListener('keyup', handleKeyUp);
      textarea.removeEventListener('mouseup', handleMouseUp);
      
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [enabled, sync, textareaRef]);

  /**
   * Limpiar highlight cuando se desactiva
   */
  useEffect(() => {
    if (!enabled) {
      const highlight = previewContainerRef.current?.querySelector('.editor-sync-highlight');
      if (highlight) {
        highlight.classList.remove('editor-sync-highlight');
      }
    }
  }, [enabled, previewContainerRef]);

  return {
    sync,
    getCurrentLine,
  };
}

