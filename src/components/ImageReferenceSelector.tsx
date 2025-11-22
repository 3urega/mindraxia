'use client';

import { useState, useEffect } from 'react';

interface Image {
  id: string;
  anchorId: string | null;
  description: string | null;
  originalName: string;
  url: string;
  alt: string | null;
  postSlug: string;
}

interface ImageReferenceSelectorProps {
  postId: string;
  currentPostSlug?: string;
  onSelect: (anchorId: string, postSlug: string) => void;
  onClose: () => void;
}

export default function ImageReferenceSelector({
  postId,
  currentPostSlug,
  onSelect,
  onClose,
}: ImageReferenceSelectorProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'same-post' | 'other-posts'>('all');

  useEffect(() => {
    fetchImages();
  }, [postId]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener imágenes del post actual
      const currentPostResponse = await fetch(`/api/posts/${postId}/images`);
      if (!currentPostResponse.ok) {
        throw new Error('Error al cargar imágenes');
      }

      const currentPostData = await currentPostResponse.json();
      const currentPostImages: Image[] = currentPostData.images
        .filter((img: any) => img.anchorId) // Solo imágenes con anclas
        .map((img: any) => ({
          id: img.id,
          anchorId: img.anchorId,
          description: img.description,
          originalName: img.originalName,
          url: img.url,
          alt: img.alt,
          postSlug: img.postSlug,
        }));

      // También obtener imágenes de otros posts publicados (si es necesario)
      // Por ahora solo mostramos imágenes del post actual
      setImages(currentPostImages);
    } catch (err: any) {
      setError(err.message || 'Error al cargar imágenes');
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter((img) => {
    // Filtrar por búsqueda
    const matchesSearch =
      searchTerm === '' ||
      img.anchorId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.alt?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Filtrar por tipo
    if (filter === 'same-post') {
      return img.postSlug === currentPostSlug || !currentPostSlug;
    }
    if (filter === 'other-posts') {
      return img.postSlug !== currentPostSlug && currentPostSlug !== undefined;
    }

    return true; // 'all'
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[80vh] rounded-lg border overflow-hidden flex flex-col"
        style={{
          borderColor: 'var(--border-glow)',
          backgroundColor: 'var(--space-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-glow)' }}>
          <h3 className="text-lg font-semibold text-text-primary">
            Seleccionar Referencia de Imagen
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-4 space-y-3 border-b" style={{ borderColor: 'var(--border-glow)' }}>
          <input
            type="text"
            placeholder="Buscar por ID de ancla, descripción o texto alternativo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border bg-space-secondary text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20"
            style={{ borderColor: 'var(--border-glow)' }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                filter === 'all'
                  ? 'bg-star-cyan text-space-dark'
                  : 'border text-text-secondary hover:bg-space-secondary'
              }`}
              style={filter !== 'all' ? { borderColor: 'var(--border-glow)' } : {}}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setFilter('same-post')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                filter === 'same-post'
                  ? 'bg-star-cyan text-space-dark'
                  : 'border text-text-secondary hover:bg-space-secondary'
              }`}
              style={filter !== 'same-post' ? { borderColor: 'var(--border-glow)' } : {}}
            >
              Este Post
            </button>
            {currentPostSlug && (
              <button
                type="button"
                onClick={() => setFilter('other-posts')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  filter === 'other-posts'
                    ? 'bg-star-cyan text-space-dark'
                    : 'border text-text-secondary hover:bg-space-secondary'
                }`}
                style={filter !== 'other-posts' ? { borderColor: 'var(--border-glow)' } : {}}
              >
                Otros Posts
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-text-muted">Cargando imágenes...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">{error}</div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              {searchTerm
                ? 'No se encontraron imágenes con esa búsqueda'
                : 'No hay imágenes con anclas disponibles'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredImages.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => {
                    if (img.anchorId) {
                      onSelect(img.anchorId, img.postSlug);
                    }
                  }}
                  className="w-full p-3 rounded-lg border text-left transition-colors hover:bg-space-secondary hover:border-star-cyan"
                  style={{ borderColor: 'var(--border-glow)' }}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={img.url}
                      alt={img.alt || ''}
                      className="w-20 h-20 object-cover rounded border"
                      style={{ borderColor: 'var(--border-glow)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm text-star-cyan mb-1">
                        {img.anchorId}
                      </div>
                      {img.description && (
                        <div className="text-xs text-text-muted mb-1">{img.description}</div>
                      )}
                      {img.alt && (
                        <div className="text-xs text-text-secondary">Alt: {img.alt}</div>
                      )}
                      <div className="text-xs text-text-muted mt-1">
                        Post: {img.postSlug}
                      </div>
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


