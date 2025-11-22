'use client';

import { useState, useEffect } from 'react';

interface Definition {
  anchorId: string;
  description?: string;
  content: string;
  number: number;
  postSlug: string;
  postTitle?: string;
}

interface DefinitionReferenceSelectorProps {
  postId?: string; // Opcional: si se proporciona, también muestra definiciones del post actual
  currentPostSlug?: string; // Slug del post actual para referencias relativas
  onSelect: (anchorId: string, postSlug: string) => void;
  onClose: () => void;
}

export default function DefinitionReferenceSelector({
  postId,
  currentPostSlug,
  onSelect,
  onClose,
}: DefinitionReferenceSelectorProps) {
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByPost, setFilterByPost] = useState<'all' | 'current' | 'others'>('all');

  useEffect(() => {
    async function fetchDefinitions() {
      try {
        setLoading(true);
        
        // Obtener definiciones del post actual si existe
        let currentPostDefinitions: Definition[] = [];
        if (postId) {
          try {
            const currentResponse = await fetch(`/api/posts/${postId}/definitions`);
            if (currentResponse.ok) {
              const currentData = await currentResponse.json();
              currentPostDefinitions = currentData.definitions || [];
            }
          } catch (err) {
            console.error('Error fetching current post definitions:', err);
          }
        }

        // Obtener todas las definiciones de posts publicados
        const allResponse = await fetch('/api/definitions');
        
        if (!allResponse.ok) {
          throw new Error('Failed to fetch definitions');
        }

        const allData = await allResponse.json();
        const allDefinitions: Definition[] = allData.definitions || [];

        // Combinar y deduplicar (priorizar definiciones del post actual)
        const definitionsMap = new Map<string, Definition>();
        
        // Primero añadir todas las definiciones
        allDefinitions.forEach((def) => {
          const key = `${def.postSlug}/${def.anchorId}`;
          definitionsMap.set(key, def);
        });

        // Luego sobrescribir con las del post actual si existen
        currentPostDefinitions.forEach((def) => {
          const key = `${def.postSlug}/${def.anchorId}`;
          definitionsMap.set(key, def);
        });

        setDefinitions(Array.from(definitionsMap.values()));
      } catch (err) {
        setError('Error al cargar definiciones');
        console.error('Error fetching definitions:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDefinitions();
  }, [postId]);

  const filteredDefinitions = definitions.filter((def) => {
    // Filtrar por tipo de post
    if (filterByPost === 'current' && currentPostSlug && def.postSlug !== currentPostSlug) {
      return false;
    }
    if (filterByPost === 'others' && currentPostSlug && def.postSlug === currentPostSlug) {
      return false;
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        def.anchorId.toLowerCase().includes(search) ||
        def.description?.toLowerCase().includes(search) ||
        def.content.toLowerCase().includes(search) ||
        def.postTitle?.toLowerCase().includes(search) ||
        def.postSlug.toLowerCase().includes(search)
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
            Insertar Referencia a Definición
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
            placeholder="Buscar por ID, descripción, contenido o post..."
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
            <div className="text-center py-8 text-text-muted">Cargando definiciones...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">{error}</div>
          ) : filteredDefinitions.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              {searchTerm ? 'No se encontraron definiciones' : 'No hay definiciones disponibles'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDefinitions.map((def) => (
                <button
                  key={`${def.postSlug}/${def.anchorId}`}
                  onClick={() => handleSelect(def.anchorId, def.postSlug)}
                  className="w-full text-left p-3 rounded-lg border transition-colors hover:border-star-cyan hover:bg-space-secondary"
                  style={{ borderColor: 'var(--border-glow)' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-star-cyan">
                          Definición {def.number}: {def.anchorId}
                        </span>
                        {currentPostSlug && def.postSlug === currentPostSlug && (
                          <span className="text-xs px-2 py-0.5 rounded bg-nebula-purple/20 text-nebula-purple border border-nebula-purple/50">
                            Este post
                          </span>
                        )}
                      </div>
                      {def.description && (
                        <div className="text-sm text-text-secondary mb-2">
                          {def.description}
                        </div>
                      )}
                      <div className="text-xs text-text-muted truncate mb-1">
                        {def.content.substring(0, 100)}
                        {def.content.length > 100 ? '...' : ''}
                      </div>
                      {def.postTitle && (
                        <div className="text-xs text-text-muted">
                          Post: <span className="text-text-secondary">{def.postTitle}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-text-muted text-xs whitespace-nowrap text-right">
                      <div>{def.postSlug}</div>
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

