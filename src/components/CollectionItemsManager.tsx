'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
}

interface CollectionItem {
  id: string;
  postId: string;
  description?: string | null;
  post: Post;
}

interface CollectionItemsManagerProps {
  collectionId: string;
  isAuthor: boolean;
}

export default function CollectionItemsManager({
  collectionId,
  isAuthor,
}: CollectionItemsManagerProps) {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [searching, setSearching] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [addDescription, setAddDescription] = useState('');

  // Cargar items
  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/collections/${collectionId}/items`);
        if (!response.ok) {
          throw new Error('Error al cargar items');
        }
        const data = await response.json();
        setItems(data.items || []);
      } catch (err) {
        console.error('Error loading items:', err);
        setError('Error al cargar items');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [collectionId]);

  // Búsqueda de posts
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const searchPosts = async () => {
      try {
        setSearching(true);
        const response = await fetch(`/api/posts/search?q=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) {
          throw new Error('Error al buscar posts');
        }
        const data = await response.json();
        // Filtrar posts que ya están en la colección
        const existingPostIds = new Set(items.map((item) => item.postId));
        const filteredPosts = (data.posts || []).filter(
          (post: Post) => !existingPostIds.has(post.id)
        );
        setSearchResults(filteredPosts);
      } catch (err) {
        console.error('Error searching posts:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    const timeoutId = setTimeout(searchPosts, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, items]);

  const handleAddItem = async (postId: string, description?: string) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          description: description || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al añadir post');
      }

      const data = await response.json();
      setItems([...items, data.item]);
      setSearchQuery('');
      setSearchResults([]);
      setAddDescription('');
      setAddingItem(false);
    } catch (err: any) {
      console.error('Error adding item:', err);
      alert(err.message || 'Error al añadir post a la agrupación');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este post de la agrupación?')) {
      return;
    }

    try {
      const response = await fetch(`/api/collections/${collectionId}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar item');
      }

      setItems(items.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Error al eliminar post de la agrupación');
    }
  };

  const handleStartEdit = (item: CollectionItem) => {
    setEditingItemId(item.id);
    setEditDescription(item.description || '');
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditDescription('');
  };

  const handleSaveEdit = async (itemId: string) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: editDescription.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar descripción');
      }

      const data = await response.json();
      setItems(
        items.map((item) => (item.id === itemId ? data.item : item))
      );
      setEditingItemId(null);
      setEditDescription('');
    } catch (err) {
      console.error('Error updating item:', err);
      alert('Error al actualizar descripción');
    }
  };

  if (!isAuthor) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-text-muted">Cargando items...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-text-primary mb-4">
          Posts en la Agrupación ({items.length})
        </h3>

        {/* Buscador para añadir posts */}
        <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: 'var(--border-glow)' }}>
          <label htmlFor="search" className="block text-sm font-medium text-text-primary mb-2">
            Buscar posts para añadir (mínimo 3 caracteres)
          </label>
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border bg-space-primary text-text-primary placeholder-text-muted focus:outline-none focus:border-star-cyan mb-3"
            style={{ borderColor: 'var(--border-glow)' }}
            placeholder="Escribe para buscar posts..."
          />

          {searching && <div className="text-text-muted text-sm">Buscando...</div>}

          {searchResults.length > 0 && (
            <div className="space-y-2 mt-3">
              {searchResults.map((post) => (
                <div
                  key={post.id}
                  className="p-3 rounded-lg border bg-surface-secondary"
                  style={{ borderColor: 'var(--border-glow)' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-text-primary mb-1 line-clamp-1">
                        {post.title}
                      </h4>
                      {post.excerpt && (
                        <p className="text-sm text-text-muted line-clamp-2">{post.excerpt}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAddingItem(post.id)}
                      className="px-3 py-1.5 text-sm rounded-lg border transition-colors hover:border-star-cyan hover:text-star-cyan flex-shrink-0"
                      style={{ borderColor: 'var(--border-glow)' }}
                    >
                      Añadir
                    </button>
                  </div>
                  {addingItem === post.id && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-glow)' }}>
                      <textarea
                        value={addDescription}
                        onChange={(e) => setAddDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border bg-space-primary text-text-primary placeholder-text-muted focus:outline-none focus:border-star-cyan resize-none text-sm mb-2"
                        style={{ borderColor: 'var(--border-glow)' }}
                        placeholder="Descripción opcional para este post en la agrupación..."
                        rows={2}
                        maxLength={500}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddItem(post.id, addDescription)}
                          className="px-3 py-1.5 text-sm rounded-lg border transition-colors hover:border-star-cyan hover:text-star-cyan"
                          style={{ borderColor: 'var(--border-glow)' }}
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingItem(false);
                            setAddDescription('');
                          }}
                          className="px-3 py-1.5 text-sm rounded-lg border transition-colors hover:border-border-primary text-text-muted"
                          style={{ borderColor: 'var(--border-glow)' }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lista de items */}
        {items.length === 0 ? (
          <p className="text-text-muted">No hay posts en esta agrupación todavía.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg border"
                style={{
                  borderColor: 'var(--border-glow)',
                  backgroundColor: 'rgba(26, 26, 46, 0.3)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/blog/${item.post.slug}`}
                      className="block group"
                    >
                      <h4 className="font-semibold text-text-primary group-hover:text-nebula-purple transition-colors mb-1">
                        {item.post.title}
                      </h4>
                      {item.post.excerpt && (
                        <p className="text-sm text-text-muted line-clamp-2">{item.post.excerpt}</p>
                      )}
                    </Link>
                    {editingItemId === item.id ? (
                      <div className="mt-3">
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border bg-space-primary text-text-primary placeholder-text-muted focus:outline-none focus:border-star-cyan resize-none text-sm mb-2"
                          style={{ borderColor: 'var(--border-glow)' }}
                          placeholder="Descripción para este post..."
                          rows={2}
                          maxLength={500}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item.id)}
                            className="px-3 py-1.5 text-sm rounded-lg border transition-colors hover:border-star-cyan hover:text-star-cyan"
                            style={{ borderColor: 'var(--border-glow)' }}
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 text-sm rounded-lg border transition-colors hover:border-border-primary text-text-muted"
                            style={{ borderColor: 'var(--border-glow)' }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      item.description && (
                        <p className="text-sm text-text-secondary italic mt-2">{item.description}</p>
                      )
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {editingItemId !== item.id && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="px-3 py-1.5 text-sm rounded-lg border transition-colors hover:border-star-cyan hover:text-star-cyan"
                          style={{ borderColor: 'var(--border-glow)' }}
                        >
                          {item.description ? 'Editar' : 'Añadir'} Desc.
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="px-3 py-1.5 text-sm rounded-lg border transition-colors hover:border-red-400 hover:text-red-400"
                          style={{ borderColor: 'var(--border-glow)' }}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
