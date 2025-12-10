'use client';

import { useState, useEffect, useMemo } from 'react';
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
  categories: Array<{ id: string; name: string; slug: string }>;
  subcategories: Array<{ 
    id: string; 
    name: string; 
    slug: string; 
    category: { id: string; name: string; slug: string } 
  }>;
}

interface PostsResponse {
  posts: Post[];
  count: number;
}

interface OrganizedData {
  [categoryId: string]: {
    category: { id: string; name: string; slug: string };
    subcategories: {
      [subcategoryId: string]: {
        subcategory: { id: string; name: string; slug: string; category: { id: string; name: string; slug: string } };
        posts: Post[];
      };
    };
    postsWithoutSubcategory: Post[];
  };
}

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

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

  // Organizar posts por categoría y subcategoría
  const organizedData = useMemo(() => {
    const data: OrganizedData = {};
    const postsWithoutCategory: Post[] = [];

    posts.forEach((post) => {
      // Si el post no tiene categorías, agregarlo a posts sin categoría
      if (post.categories.length === 0) {
        postsWithoutCategory.push(post);
        return;
      }

      // Procesar cada categoría del post
      post.categories.forEach((category) => {
        if (!data[category.id]) {
          data[category.id] = {
            category,
            subcategories: {},
            postsWithoutSubcategory: [],
          };
        }

        // Si el post tiene subcategorías, organizarlas
        if (post.subcategories.length > 0) {
          post.subcategories.forEach((subcategory) => {
            // Solo procesar subcategorías que pertenecen a esta categoría
            if (subcategory.category.id === category.id) {
              if (!data[category.id].subcategories[subcategory.id]) {
                data[category.id].subcategories[subcategory.id] = {
                  subcategory,
                  posts: [],
                };
              }
              data[category.id].subcategories[subcategory.id].posts.push(post);
            }
          });

          // Si el post tiene subcategorías pero ninguna pertenece a esta categoría,
          // agregarlo a posts sin subcategoría de esta categoría
          const hasSubcategoryInCategory = post.subcategories.some(
            (sub) => sub.category.id === category.id
          );
          if (!hasSubcategoryInCategory) {
            data[category.id].postsWithoutSubcategory.push(post);
          }
        } else {
          // Post sin subcategorías en esta categoría
          data[category.id].postsWithoutSubcategory.push(post);
        }
      });
    });

    return { data, postsWithoutCategory };
  }, [posts]);

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const categoryMap = new Map<string, { id: string; name: string; slug: string }>();
    posts.forEach((post) => {
      post.categories.forEach((cat) => {
        if (!categoryMap.has(cat.id)) {
          categoryMap.set(cat.id, cat);
        }
      });
    });
    return Array.from(categoryMap.values());
  }, [posts]);

  // Obtener subcategorías de la categoría seleccionada
  const subcategories = useMemo(() => {
    if (!selectedCategoryId || !organizedData.data[selectedCategoryId]) {
      return [];
    }
    return Object.values(organizedData.data[selectedCategoryId].subcategories).map(
      (item) => item.subcategory
    );
  }, [selectedCategoryId, organizedData]);

  // Obtener posts a mostrar según la selección
  const postsToShow = useMemo(() => {
    if (selectedSubcategoryId === 'no-subcategory' && selectedCategoryId && organizedData.data[selectedCategoryId]) {
      // Mostrar solo posts sin subcategoría de esta categoría
      return organizedData.data[selectedCategoryId].postsWithoutSubcategory;
    }
    if (selectedSubcategoryId && selectedCategoryId && organizedData.data[selectedCategoryId]) {
      return organizedData.data[selectedCategoryId].subcategories[selectedSubcategoryId]?.posts || [];
    }
    if (selectedCategoryId && organizedData.data[selectedCategoryId]) {
      // Mostrar todos los posts de la categoría (con y sin subcategoría)
      const categoryData = organizedData.data[selectedCategoryId];
      const postsWithSubcategory = Object.values(categoryData.subcategories).flatMap(
        (item) => item.posts
      );
      return [...postsWithSubcategory, ...categoryData.postsWithoutSubcategory];
    }
    // Si no hay selección, mostrar todos los posts
    return posts;
  }, [selectedCategoryId, selectedSubcategoryId, organizedData, posts]);

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
      setSelectedSubcategoryId(null);
    } else {
      setSelectedCategoryId(categoryId);
      setSelectedSubcategoryId(null);
    }
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    if (selectedSubcategoryId === subcategoryId) {
      setSelectedSubcategoryId(null);
    } else {
      setSelectedSubcategoryId(subcategoryId);
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

      {/* Barra de Categorías */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 rounded-lg border" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.3)' }}>
          <button
            onClick={() => {
              setSelectedCategoryId(null);
              setSelectedSubcategoryId(null);
            }}
            className={`px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
              selectedCategoryId === null
                ? 'bg-star-cyan text-space-dark border-star-cyan'
                : 'bg-space-primary text-text-secondary border-border-glow hover:bg-space-secondary'
            }`}
            style={selectedCategoryId === null ? {} : { borderColor: 'var(--border-glow)' }}
          >
            Todos ({posts.length})
          </button>
          {categories.map((category) => {
            const categoryPosts = organizedData.data[category.id] 
              ? Object.values(organizedData.data[category.id].subcategories).flatMap(item => item.posts).length +
                organizedData.data[category.id].postsWithoutSubcategory.length
              : 0;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
                  selectedCategoryId === category.id
                    ? 'bg-star-cyan text-space-dark border-star-cyan'
                    : 'bg-space-primary text-text-secondary border-border-glow hover:bg-space-secondary'
                }`}
                style={selectedCategoryId === category.id ? {} : { borderColor: 'var(--border-glow)' }}
              >
                {category.name} ({categoryPosts})
              </button>
            );
          })}
          {organizedData.postsWithoutCategory.length > 0 && (
            <button
              onClick={() => {
                setSelectedCategoryId('no-category');
                setSelectedSubcategoryId(null);
              }}
              className={`px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
                selectedCategoryId === 'no-category'
                  ? 'bg-star-cyan text-space-dark border-star-cyan'
                  : 'bg-space-primary text-text-secondary border-border-glow hover:bg-space-secondary'
              }`}
              style={selectedCategoryId === 'no-category' ? {} : { borderColor: 'var(--border-glow)' }}
            >
              Sin categoría ({organizedData.postsWithoutCategory.length})
            </button>
          )}
        </div>
      )}

      {/* Barra de Subcategorías */}
      {selectedCategoryId && selectedCategoryId !== 'no-category' && subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 rounded-lg border ml-6" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.2)' }}>
          <button
            onClick={() => setSelectedSubcategoryId(null)}
            className={`px-3 py-1.5 rounded border transition-colors text-xs font-medium ${
              selectedSubcategoryId === null
                ? 'bg-star-cyan/20 text-star-cyan border-star-cyan'
                : 'bg-space-primary text-text-secondary border-border-glow hover:bg-space-secondary'
            }`}
            style={selectedSubcategoryId === null ? {} : { borderColor: 'var(--border-glow)' }}
          >
            Todas
          </button>
          {subcategories.map((subcategory) => {
            const subcategoryPosts = organizedData.data[selectedCategoryId]?.subcategories[subcategory.id]?.posts.length || 0;
            return (
              <button
                key={subcategory.id}
                onClick={() => handleSubcategoryClick(subcategory.id)}
                className={`px-3 py-1.5 rounded border transition-colors text-xs font-medium ${
                  selectedSubcategoryId === subcategory.id
                    ? 'bg-star-cyan/20 text-star-cyan border-star-cyan'
                    : 'bg-space-primary text-text-secondary border-border-glow hover:bg-space-secondary'
                }`}
                style={selectedSubcategoryId === subcategory.id ? {} : { borderColor: 'var(--border-glow)' }}
              >
                {subcategory.name} ({subcategoryPosts})
              </button>
            );
          })}
          {organizedData.data[selectedCategoryId]?.postsWithoutSubcategory.length > 0 && (
            <button
              onClick={() => setSelectedSubcategoryId('no-subcategory')}
              className={`px-3 py-1.5 rounded border transition-colors text-xs font-medium ${
                selectedSubcategoryId === 'no-subcategory'
                  ? 'bg-star-cyan/20 text-star-cyan border-star-cyan'
                  : 'bg-space-primary text-text-secondary border-border-glow hover:bg-space-secondary'
              }`}
              style={selectedSubcategoryId === 'no-subcategory' ? {} : { borderColor: 'var(--border-glow)' }}
            >
              Sin subcategoría ({organizedData.data[selectedCategoryId]?.postsWithoutSubcategory.length || 0})
            </button>
          )}
        </div>
      )}

      {/* Tabla de Posts */}
      {(selectedCategoryId === 'no-category' ? organizedData.postsWithoutCategory : postsToShow).length > 0 ? (
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
                {(selectedCategoryId === 'no-category' ? organizedData.postsWithoutCategory : postsToShow).map((post) => (
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
          <p className="text-xl text-text-secondary mb-2">
            {selectedCategoryId || selectedSubcategoryId 
              ? 'No hay posts en esta selección' 
              : 'No hay posts aún'}
          </p>
          <p className="text-text-muted mb-6">
            {selectedCategoryId || selectedSubcategoryId
              ? 'Intenta seleccionar otra categoría o subcategoría'
              : 'Crea tu primer post para comenzar'}
          </p>
          {!(selectedCategoryId || selectedSubcategoryId) && (
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-star-cyan text-space-dark font-medium transition-all hover:bg-star-cyan/90 glow-cyan"
            >
              Crear Primer Post
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

