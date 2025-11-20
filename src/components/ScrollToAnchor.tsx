'use client';

import { useEffect } from 'react';

interface ScrollToAnchorProps {
  offset?: number; // Offset para compensar header sticky
}

export default function ScrollToAnchor({ offset = 80 }: ScrollToAnchorProps) {
  useEffect(() => {
    // Esperar a que el DOM esté completamente cargado
    const timer = setTimeout(() => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.substring(1); // Remover el #
        const element = document.getElementById(id);
        
        if (element) {
          // Calcular posición con offset
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          // Scroll suave
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });

          // Añadir efecto visual de resaltado
          element.classList.add('equation-highlight');
          
          // Remover el resaltado después de 3 segundos
          setTimeout(() => {
            element.classList.remove('equation-highlight');
          }, 3000);
        }
      }
    }, 100); // Pequeño delay para asegurar que el DOM está listo

    return () => clearTimeout(timer);
  }, []);

  return null;
}

