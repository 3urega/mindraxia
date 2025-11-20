'use client';

import { useState, useEffect } from 'react';

interface Equation {
  anchorId: string;
  description?: string;
  equation: string;
  postSlug: string;
}

interface Equation {
  anchorId: string;
  description?: string;
  equation: string;
  postSlug: string;
  postTitle?: string;
}

interface EquationReferenceSelectorProps {
  postId?: string; // Opcional: si se proporciona, también muestra ecuaciones del post actual
  currentPostSlug?: string; // Slug del post actual para referencias relativas
  onSelect: (anchorId: string, postSlug: string) => void;
  onClose: () => void;
}

export default function EquationReferenceSelector({
  postId,
  currentPostSlug,
  onSelect,
  onClose,
}: EquationReferenceSelectorProps) {
  const [equations, setEquations] = useState<Equation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByPost, setFilterByPost] = useState<'all' | 'current' | 'others'>('all');

  useEffect(() => {
    async function fetchEquations() {
      try {
        setLoading(true);
        
        // Obtener ecuaciones del post actual si existe
        let currentPostEquations: Equation[] = [];
        if (postId) {
          try {
            const currentResponse = await fetch(`/api/posts/${postId}/equations`);
            if (currentResponse.ok) {
              const currentData = await currentResponse.json();
              currentPostEquations = currentData.equations || [];
            }
          } catch (err) {
            console.error('Error fetching current post equations:', err);
          }
        }

        // Obtener todas las ecuaciones de posts publicados
        const allResponse = await fetch('/api/equations');
        
        if (!allResponse.ok) {
          throw new Error('Failed to fetch equations');
        }

        const allData = await allResponse.json();
        const allEquations: Equation[] = allData.equations || [];

        // Combinar y deduplicar (priorizar ecuaciones del post actual)
        const equationsMap = new Map<string, Equation>();
        
        // Primero añadir todas las ecuaciones
        allEquations.forEach((eq) => {
          const key = `${eq.postSlug}/${eq.anchorId}`;
          equationsMap.set(key, eq);
        });

        // Luego sobrescribir con las del post actual si existen
        currentPostEquations.forEach((eq) => {
          const key = `${eq.postSlug}/${eq.anchorId}`;
          equationsMap.set(key, eq);
        });

        setEquations(Array.from(equationsMap.values()));
      } catch (err) {
        setError('Error al cargar ecuaciones');
        console.error('Error fetching equations:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEquations();
  }, [postId]);

  const filteredEquations = equations.filter((eq) => {
    // Filtrar por tipo de post
    if (filterByPost === 'current' && currentPostSlug && eq.postSlug !== currentPostSlug) {
      return false;
    }
    if (filterByPost === 'others' && currentPostSlug && eq.postSlug === currentPostSlug) {
      return false;
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        eq.anchorId.toLowerCase().includes(search) ||
        eq.description?.toLowerCase().includes(search) ||
        eq.equation.toLowerCase().includes(search) ||
        eq.postTitle?.toLowerCase().includes(search) ||
        eq.postSlug.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const handleSelect = (anchorId: string, postSlug: string) => {
    onSelect(anchorId, postSlug);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[80vh] rounded-lg border overflow-hidden flex flex-col"
        style={{
          borderColor: 'var(--border-glow)',
          backgroundColor: 'var(--space-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-glow)' }}>
          <h3 className="text-lg font-semibold text-text-primary">
            Insertar Referencia a Ecuación
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b space-y-3" style={{ borderColor: 'var(--border-glow)' }}>
          <input
            type="text"
            placeholder="Buscar por ID, descripción, ecuación o post..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border bg-space-secondary text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20"
            style={{ borderColor: 'var(--border-glow)' }}
            autoFocus
          />
          
          {/* Filtros por tipo de post */}
          {currentPostSlug && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilterByPost('all')}
                className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                  filterByPost === 'all'
                    ? 'bg-star-cyan/20 border-star-cyan text-star-cyan'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFilterByPost('current')}
                className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                  filterByPost === 'current'
                    ? 'bg-star-cyan/20 border-star-cyan text-star-cyan'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                Este Post
              </button>
              <button
                type="button"
                onClick={() => setFilterByPost('others')}
                className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                  filterByPost === 'others'
                    ? 'bg-star-cyan/20 border-star-cyan text-star-cyan'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                Otros Posts
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-text-muted">Cargando ecuaciones...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">{error}</div>
          ) : filteredEquations.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              {searchTerm ? 'No se encontraron ecuaciones' : 'No hay ecuaciones disponibles'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEquations.map((eq) => (
                <button
                  key={eq.anchorId}
                  onClick={() => handleSelect(eq.anchorId, eq.postSlug)}
                  className="w-full text-left p-3 rounded-lg border transition-colors hover:border-star-cyan hover:bg-space-secondary"
                  style={{ borderColor: 'var(--border-glow)' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-star-cyan">
                          {eq.anchorId}
                        </span>
                        {currentPostSlug && eq.postSlug === currentPostSlug && (
                          <span className="text-xs px-2 py-0.5 rounded bg-nebula-purple/20 text-nebula-purple border border-nebula-purple/50">
                            Este post
                          </span>
                        )}
                      </div>
                      {eq.description && (
                        <div className="text-sm text-text-secondary mb-2">
                          {eq.description}
                        </div>
                      )}
                      <div className="text-xs text-text-muted font-mono truncate mb-1">
                        {eq.equation.substring(0, 100)}
                        {eq.equation.length > 100 ? '...' : ''}
                      </div>
                      {eq.postTitle && (
                        <div className="text-xs text-text-muted">
                          Post: <span className="text-text-secondary">{eq.postTitle}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-text-muted text-xs whitespace-nowrap text-right">
                      <div>{eq.postSlug}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

