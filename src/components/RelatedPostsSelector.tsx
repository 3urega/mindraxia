'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
}

interface RelatedPostsSelectorProps {
  postId: string;
}

export default function RelatedPostsSelector({ postId }: RelatedPostsSelectorProps) {
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [addingPostId, setAddingPostId] = useState<string | null>(null);
  const [removingPostId, setRemovingPostId] = useState<string | null>(null);

  // Cargar posts relacionados
  useEffect(() => {
    const loadRelatedPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/posts/${postId}/related`);
        if (!response.ok) {
          throw new Error('Error al cargar posts relacionados');
        }
        const data = await response.json();
        setRelatedPosts(data.relatedPosts || []);
      } catch (err) {
        console.error('Error loading related posts:', err);
        setError('Error al cargar posts relacionados');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      loadRelatedPosts();
    }
  }, [postId]);

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Buscar posts cuando el término de búsqueda cambia (mínimo 3 caracteres)
  useEffect(() => {
    const searchPosts = async () => {
      if (debouncedSearchTerm.length < 3) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        const response = await fetch(`/api/posts/search?q=${encodeURIComponent(debouncedSearchTerm)}`);
        if (!response.ok) {
          throw new Error('Error al buscar posts');
        }
        const data = await response.json();
        // Filtrar posts que ya están relacionados o son el mismo post
        const filtered = (data.posts || []).filter(
          (post: Post) => 
            post.id !== postId && 
            !relatedPosts.some((rp) => rp.id === post.id)
        );
        setSearchResults(filtered);
      } catch (err) {
        console.error('Error searching posts:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    if (showSearchModal) {
      searchPosts();
    }
  }, [debouncedSearchTerm, showSearchModal, postId, relatedPosts]);

  // Añadir post relacionado
  const handleAddRelatedPost = async (relatedPostId: string) => {
    try {
      setAddingPostId(relatedPostId);
      setError(null);
      const response = await fetch(`/api/posts/${postId}/related`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ relatedPostId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al añadir post relacionado');
      }

      const data = await response.json();
      // Actualizar lista de posts relacionados
      setRelatedPosts([...relatedPosts, data.relatedPost]);
      // Cerrar modal y limpiar búsqueda
      setShowSearchModal(false);
      setSearchTerm('');
      setSearchResults([]);
    } catch (err: any) {
      console.error('Error adding related post:', err);
      setError(err.message || 'Error al añadir post relacionado');
    } finally {
      setAddingPostId(null);
    }
  };

  // Eliminar post relacionado
  const handleRemoveRelatedPost = async (relatedPostId: string) => {
    try {
      setRemovingPostId(relatedPostId);
      setError(null);
      const response = await fetch(`/api/posts/${postId}/related/${relatedPostId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar relación');
      }

      // Actualizar lista de posts relacionados
      setRelatedPosts(relatedPosts.filter((post) => post.id !== relatedPostId));
    } catch (err: any) {
      console.error('Error removing related post:', err);
      setError(err.message || 'Error al eliminar relación');
    } finally {
      setRemovingPostId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">
          Posts Relacionados
        </h3>
        <button
          type="button"
          onClick={() => setShowSearchModal(true)}
          className="px-4 py-2 bg-nebula-purple text-white rounded-lg hover:bg-nebula-purple/80 transition-colors text-sm font-medium"
        >
          + Añadir Post Relacionado
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-text-muted text-sm">Cargando...</div>
      ) : relatedPosts.length === 0 ? (
        <div className="text-text-muted text-sm italic">
          No hay posts relacionados aún.
        </div>
      ) : (
        <div className="space-y-2">
          {relatedPosts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg border border-border-primary/30 hover:border-nebula-purple/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="text-text-primary hover:text-nebula-purple transition-colors font-medium block truncate"
                >
                  {post.title}
                </Link>
                {post.excerpt && (
                  <p className="text-text-muted text-xs mt-1 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveRelatedPost(post.id)}
                disabled={removingPostId === post.id}
                className="ml-4 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {removingPostId === post.id ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de búsqueda */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-primary rounded-lg border border-border-primary shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-border-primary">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-semibold text-text-primary">
                  Buscar Posts para Relacionar
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setShowSearchModal(false);
                    setSearchTerm('');
                    setSearchResults([]);
                  }}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título (mínimo 3 caracteres)..."
                className="w-full px-4 py-2 bg-surface-secondary border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-nebula-purple"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {isSearching ? (
                <div className="text-text-muted text-center py-8">
                  Buscando...
                </div>
              ) : debouncedSearchTerm.length < 3 ? (
                <div className="text-text-muted text-center py-8">
                  Escribe al menos 3 caracteres para buscar
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-text-muted text-center py-8">
                  No se encontraron posts
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg border border-border-primary/30 hover:border-nebula-purple/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h5 className="text-text-primary font-medium truncate">
                          {post.title}
                        </h5>
                        {post.excerpt && (
                          <p className="text-text-muted text-sm mt-1 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddRelatedPost(post.id)}
                        disabled={addingPostId === post.id}
                        className="ml-4 px-4 py-2 bg-nebula-purple text-white rounded-lg hover:bg-nebula-purple/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {addingPostId === post.id ? 'Añadiendo...' : 'Añadir'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
