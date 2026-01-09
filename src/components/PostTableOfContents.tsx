'use client';

import { useState, useEffect } from 'react';
import { Section } from '@/lib/section-anchors';

interface PostTableOfContentsProps {
  sections: Section[];
  currentSlug?: string;
}

export default function PostTableOfContents({
  sections,
  currentSlug,
}: PostTableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Cargar preferencia de mostrar/ocultar desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('toc-open');
      if (saved === 'true') {
        setIsOpen(true);
      }
    }
  }, []);

  // Guardar preferencia cuando cambia el estado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('toc-open', isOpen.toString());
    }
  }, [isOpen]);

  // Detectar sección activa al hacer scroll
  useEffect(() => {
    if (!isOpen || sections.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset para considerar el header

      // Encontrar la sección más cercana al scroll
      let currentActive: string | null = null;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const elementTop = element.offsetTop;
          if (scrollPosition >= elementTop) {
            currentActive = section.id;
          }
        }
      }

      setActiveSectionId(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Llamar una vez al cargar

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen, sections]);

  // Si no hay secciones, no renderizar nada
  if (sections.length === 0) {
    return null;
  }

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      // Actualizar URL sin recargar
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', `#${sectionId}`);
      }
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  // Agrupar secciones con sus subsecciones
  const groupedSections: Array<{
    section: Section;
    subsections: Section[];
  }> = [];

  sections.forEach((section) => {
    if (section.level === 'section') {
      groupedSections.push({
        section,
        subsections: sections.filter(
          (s) => s.level === 'subsection' && s.parentIndex === section.index
        ),
      });
    }
  });

  return (
    <>
      {/* Botón flotante para abrir/cerrar */}
      <button
        onClick={toggleOpen}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full border transition-all shadow-lg hover:scale-110 ${
          isOpen
            ? 'bg-star-cyan text-space-dark border-star-cyan'
            : 'bg-space-primary text-star-cyan border-star-cyan/50 hover:border-star-cyan'
        }`}
        style={{
          boxShadow: isOpen
            ? '0 0 20px rgba(34, 211, 238, 0.5)'
            : '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
        aria-label={isOpen ? 'Cerrar índice' : 'Abrir índice'}
        title={isOpen ? 'Cerrar índice' : 'Abrir índice'}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* Panel del índice */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-40 w-80 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-lg border p-4 transition-all"
          style={{
            borderColor: 'var(--border-glow)',
            backgroundColor: 'rgba(26, 26, 46, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">Índice</h3>
            <button
              onClick={toggleOpen}
              className="text-text-muted transition-colors hover:text-text-primary"
              aria-label="Cerrar índice"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            {groupedSections.map(({ section, subsections }) => (
              <div key={section.id} className="space-y-1">
                <button
                  onClick={() => handleSectionClick(section.id)}
                  className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                    activeSectionId === section.id
                      ? 'bg-star-cyan/20 text-star-cyan border-l-2 border-star-cyan'
                      : 'text-text-secondary hover:text-text-primary hover:bg-space-secondary/50'
                  }`}
                >
                  <span className="font-medium">{section.title}</span>
                </button>
                {subsections.length > 0 && (
                  <div className="ml-4 space-y-1">
                    {subsections.map((subsection) => (
                      <button
                        key={subsection.id}
                        onClick={() => handleSectionClick(subsection.id)}
                        className={`block w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                          activeSectionId === subsection.id
                            ? 'bg-star-cyan/20 text-star-cyan border-l-2 border-star-cyan'
                            : 'text-text-muted hover:text-text-secondary hover:bg-space-secondary/50'
                        }`}
                      >
                        {subsection.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* Overlay para cerrar al hacer clic fuera (solo en móviles) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={toggleOpen}
          aria-hidden="true"
        />
      )}
    </>
  );
}

