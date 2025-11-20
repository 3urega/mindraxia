'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  author: { id: string; name: string };
  tags: Array<{ id: string; name: string }>;
}

interface PostsResponse {
  posts: Post[];
  count: number;
}

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts/admin');
      const data: PostsResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar posts');
      }

      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Error al cargar los posts');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublished = async (postId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          published: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el post');
      }

      // Actualizar estado local
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, published: !currentStatus, publishedAt: !currentStatus ? new Date().toISOString() : post.publishedAt }
            : post
        )
      );
    } catch (error) {
      console.error('Error toggling published:', error);
      alert('Error al actualizar el estado del post');
    }
  };

  const handleDelete = async (postId: string, title: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el post "${title}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el post');
      }

      // Remover del estado local
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error al eliminar el post');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-text-secondary">Cargando posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border p-4" style={{ borderColor: 'rgba(239, 68, 68, 0.5)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-text-primary">Posts</h1>
          <p className="mt-2 text-text-secondary">Gestiona todos tus artículos</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="px-6 py-3 rounded-lg bg-star-cyan text-space-dark font-medium transition-all hover:bg-star-cyan/90 glow-cyan"
        >
          Nuevo Post
        </Link>
      </div>

      {/* Tabla de Posts */}
      {posts.length > 0 ? (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-glow)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-space-primary/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actualizado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-glow)' }}>
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-space-primary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="text-text-primary font-medium hover:text-star-cyan transition-colors"
                        >
                          {post.title}
                        </Link>
                        {post.excerpt && (
                          <p className="text-sm text-text-muted mt-1 line-clamp-1">{post.excerpt}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          post.published
                            ? 'bg-star-cyan/20 text-star-cyan'
                            : 'bg-star-gold/20 text-star-gold'
                        }`}
                      >
                        {post.published ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.length > 0 ? (
                          post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag.id}
                              className="inline-flex items-center px-2 py-1 rounded text-xs border"
                              style={{
                                borderColor: 'var(--border-glow)',
                                color: 'var(--star-cyan)',
                              }}
                            >
                              {tag.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-text-muted text-xs">Sin tags</span>
                        )}
                        {post.tags.length > 3 && (
                          <span className="text-text-muted text-xs">+{post.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">
                      {new Date(post.updatedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="px-3 py-1.5 text-sm rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
                          style={{ borderColor: 'var(--border-glow)' }}
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleTogglePublished(post.id, post.published)}
                          className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                            post.published
                              ? 'border-star-gold/50 text-star-gold hover:bg-star-gold/10'
                              : 'border-star-cyan/50 text-star-cyan hover:bg-star-cyan/10'
                          }`}
                        >
                          {post.published ? 'Despublicar' : 'Publicar'}
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="px-3 py-1.5 text-sm rounded border transition-colors hover:bg-red-500/10 text-red-400 border-red-500/50 hover:border-red-500"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border p-12 text-center" style={{ borderColor: 'var(--border-glow)' }}>
          <p className="text-xl text-text-secondary mb-2">No hay posts aún</p>
          <p className="text-text-muted mb-6">Crea tu primer post para comenzar</p>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-star-cyan text-space-dark font-medium transition-all hover:bg-star-cyan/90 glow-cyan"
          >
            Crear Primer Post
          </Link>
        </div>
      )}
    </div>
  );
}

