'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RouteItem {
  id: string;
  postId: string;
  order: number;
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    published: boolean;
  };
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
}

interface RouteItemsManagerProps {
  routeId: string;
  isAuthor: boolean;
}

export default function RouteItemsManager({ routeId, isAuthor }: RouteItemsManagerProps) {
  const [items, setItems] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [addingPostId, setAddingPostId] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [movingItemId, setMovingItemId] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, [routeId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (showSearchModal && debouncedSearchTerm.length >= 3) {
      searchPosts();
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [debouncedSearchTerm, showSearchModal]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/routes/${routeId}/items`);
      if (!response.ok) {
        throw new Error('Error al cargar items');
      }
      const data = await response.json();
      setItems(data.items || []);
    } catch (err) {
      console.error('Error loading items:', err);
      setError('Error al cargar items de la ruta');
    } finally {
      setLoading(false);
    }
  };

  const searchPosts = async () => {
    try {
      setIsSearching(true);
      const response = await fetch(`/api/posts/search?q=${encodeURIComponent(debouncedSearchTerm)}`);
      if (!response.ok) {
        throw new Error('Error al buscar posts');
      }
      const data = await response.json();
      // Filtrar posts que ya están en la ruta
      const existingPostIds = new Set(items.map((item) => item.post.id));
      const filtered = (data.posts || []).filter(
        (post: Post) => !existingPostIds.has(post.id)
      );
      setSearchResults(filtered);
    } catch (err) {
      console.error('Error searching posts:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddPost = async (postId: string) => {
    try {
      setAddingPostId(postId);
      setError(null);
      const response = await fetch(`/api/routes/${routeId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al añadir post');
      }

      await loadItems();
      setShowSearchModal(false);
      setSearchTerm('');
      setSearchResults([]);
    } catch (err: any) {
      console.error('Error adding post:', err);
      setError(err.message || 'Error al añadir post');
    } finally {
      setAddingPostId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este post de la ruta?')) {
      return;
    }

    try {
      setRemovingItemId(itemId);
      setError(null);
      const response = await fetch(`/api/routes/${routeId}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar item');
      }

      await loadItems();
    } catch (err: any) {
      console.error('Error removing item:', err);
      setError(err.message || 'Error al eliminar item');
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleMoveItem = async (itemId: string, direction: 'up' | 'down') => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const newOrder = direction === 'up' ? item.order - 1 : item.order + 1;
    if (newOrder < 1 || newOrder > items.length) return;

    try {
      setMovingItemId(itemId);
      setError(null);
      const response = await fetch(`/api/routes/${routeId}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: newOrder }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al mover item');
      }

      await loadItems();
    } catch (err: any) {
      console.error('Error moving item:', err);
      setError(err.message || 'Error al mover item');
    } finally {
      setMovingItemId(null);
    }
  };

  if (!isAuthor) {
    return null;
  }

  if (loading) {
    return <div className="text-text-muted">Cargando items...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">
          Posts en la Ruta ({items.length})
        </h3>
        <button
          type="button"
          onClick={() => setShowSearchModal(true)}
          className="px-4 py-2 bg-nebula-purple text-white rounded-lg hover:bg-nebula-purple/80 transition-colors text-sm font-medium"
        >
          + Añadir Post
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-text-muted text-sm italic">
          No hay posts en la ruta aún.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-3 bg-surface-secondary rounded-lg border border-border-primary/30"
            >
              <div className="flex-shrink-0 w-8 text-center text-text-muted font-semibold">
                {item.order}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/admin/posts/${item.post.id}`}
                  className="text-text-primary hover:text-nebula-purple transition-colors font-medium block truncate"
                >
                  {item.post.title}
                </Link>
                {item.post.excerpt && (
                  <p className="text-text-muted text-xs mt-1 line-clamp-1">
                    {item.post.excerpt}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleMoveItem(item.id, 'up')}
                  disabled={index === 0 || movingItemId === item.id}
                  className="px-2 py-1 text-sm text-text-muted hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Mover arriba"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveItem(item.id, 'down')}
                  disabled={index === items.length - 1 || movingItemId === item.id}
                  className="px-2 py-1 text-sm text-text-muted hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Mover abajo"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={removingItemId === item.id}
                  className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {removingItemId === item.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
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
                  Buscar Posts para Añadir
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
                <div className="text-text-muted text-center py-8">Buscando...</div>
              ) : debouncedSearchTerm.length < 3 ? (
                <div className="text-text-muted text-center py-8">
                  Escribe al menos 3 caracteres para buscar
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-text-muted text-center py-8">No se encontraron posts</div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg border border-border-primary/30 hover:border-nebula-purple/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h5 className="text-text-primary font-medium truncate">{post.title}</h5>
                        {post.excerpt && (
                          <p className="text-text-muted text-sm mt-1 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddPost(post.id)}
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









