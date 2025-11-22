'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MarkdownEditor from '@/components/MarkdownEditor';
import CategorySelector from '@/components/CategorySelector';
import { generateSlug } from '@/lib/utils';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  published: boolean;
  tags: Array<{ id: string; name: string }>;
  categories?: Array<{ id: string; name: string; slug: string }>;
  subcategories?: Array<{ id: string; name: string; slug: string; category: { id: string; name: string; slug: string } }>;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  // Log cuando cambian los params
  useEffect(() => {
    console.log('[EditPostPage] Params cambiados:', { postId, params });
  }, [postId, params]);
  
  // Interceptar navegaciones del router SOLO para debugging
  useEffect(() => {
    const originalPush = router.push;
    const originalReplace = router.replace;
    
    router.push = function(...args: any[]) {
      const stack = new Error().stack;
      console.error('[EditPostPage] ⚠️⚠️⚠️ router.push llamado:', args);
      console.error('[EditPostPage] Stack trace completo:', stack);
      // NO prevenir la navegación, solo loguear
      return originalPush.apply(router, args);
    };
    
    router.replace = function(...args: any[]) {
      const stack = new Error().stack;
      console.error('[EditPostPage] ⚠️⚠️⚠️ router.replace llamado:', args);
      console.error('[EditPostPage] Stack trace completo:', stack);
      // NO prevenir la navegación, solo loguear
      return originalReplace.apply(router, args);
    };
    
    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [router]);

  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [subcategoryIds, setSubcategoryIds] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('[EditPostPage] useEffect postId cambiado:', { postId, hasPost: !!post });
    if (postId) {
      fetchPost();
    }
  }, [postId]);
  
  // Log cuando el componente se monta/desmonta
  useEffect(() => {
    console.log('[EditPostPage] ✅ Componente montado');
    return () => {
      console.error('[EditPostPage] ⚠️ Componente desmontado - ESTO NO DEBERÍA PASAR AL ABRIR MODAL');
      console.error('[EditPostPage] Stack trace del desmontaje:', new Error().stack);
    };
  }, []);
  
  // Log cuando cambian los estados críticos
  useEffect(() => {
    console.log('[EditPostPage] Estado cambiado:', { 
      hasPost: !!post, 
      error, 
      loading, 
      postId,
      postTitle: post?.title 
    });
    
    // Si hay error y no hay post, esto podría causar desmontaje
    if (error && !post && !loading) {
      console.error('[EditPostPage] ⚠️ CONDICIÓN PELIGROSA: error=true, post=null, loading=false');
      console.error('[EditPostPage] Esto podría causar que se muestre el componente de error que tiene botón de redirección');
    }
  }, [post, error, loading, postId]);
  
  // Prevenir que el componente se desmonte si hay un error pero el post existe
  useEffect(() => {
    if (error && post) {
      console.log('[EditPostPage] Hay error pero también hay post, limpiando error para evitar desmontaje');
      // No limpiar automáticamente, solo loguear
    }
  }, [error, post]);

  const fetchPost = async () => {
    try {
      console.log('[EditPostPage] fetchPost iniciado para postId:', postId);
      setLoading(true);
      setError(''); // Limpiar error previo
      const response = await fetch(`/api/posts/${postId}`);

      if (!response.ok) {
        console.error('[EditPostPage] Error en respuesta:', response.status, response.statusText);
        // Si hay un post cargado previamente, mantenerlo y solo mostrar error
        if (post) {
          console.log('[EditPostPage] Hay post previo, manteniéndolo aunque haya error en fetch');
          setError('Error al actualizar el post, pero puedes seguir editando');
        } else {
          throw new Error('Error al cargar el post');
        }
        return;
      }

      const data: Post = await response.json();
      console.log('[EditPostPage] Post cargado exitosamente:', data.id);
      setPost(data);
      setTitle(data.title);
      setSlug(data.slug);
      setExcerpt(data.excerpt || '');
      setContent(data.content);
      setPublished(data.published);
      setTags(data.tags.map((tag) => tag.name).join(', '));
      setCategoryIds(data.categories?.map((cat) => cat.id) || []);
      setSubcategoryIds(data.subcategories?.map((sub) => sub.id) || []);
      setError(''); // Asegurar que no hay error
    } catch (error) {
      console.error('[EditPostPage] Error fetching post:', error);
      // Solo establecer error si NO hay post cargado
      if (!post) {
        console.error('[EditPostPage] No hay post previo, estableciendo error');
        setError('Error al cargar el post');
      } else {
        console.log('[EditPostPage] Hay post previo, NO estableciendo error para evitar desmontaje');
        // No establecer error para evitar que entre en el estado if (error && !post)
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // Solo auto-generar slug si el slug actual es el generado desde el título original
    if (!post || slug === generateSlug(post.title)) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[EditPostPage] handleSubmit llamado - ESTO NO DEBERÍA PASAR AL ABRIR MODAL');
    console.log('[EditPostPage] Event:', e);
    console.log('[EditPostPage] Target:', e.target);
    console.log('[EditPostPage] CurrentTarget:', e.currentTarget);
    
    // Si el modal está abierto, NO procesar el submit
    // Esto es un workaround temporal hasta encontrar la causa raíz
    const modalOpen = document.querySelector('[class*="fixed inset-0 z-50"]');
    if (modalOpen) {
      console.error('[EditPostPage] ⚠️ Formulario se intentó enviar con modal abierto - PREVENIENDO');
      return;
    }
    
    setError('');
    setSaving(true);

    try {
      // Parsear tags
      const tagsArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Validación básica
      if (!title || title.length < 3) {
        setError('El título debe tener al menos 3 caracteres');
        setSaving(false);
        return;
      }

      if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
        setError('El slug solo puede contener letras minúsculas, números y guiones');
        setSaving(false);
        return;
      }

      if (!content || content.length < 10) {
        setError('El contenido debe tener al menos 10 caracteres');
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          excerpt: excerpt || undefined,
          content,
          tags: tagsArray,
          categoryIds,
          subcategoryIds,
          published,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error al actualizar el post');
        setSaving(false);
        return;
      }

      // Redirigir a la lista de posts
      router.push('/admin/posts');
      router.refresh();
    } catch (error) {
      console.error('Error updating post:', error);
      setError('Error de conexión. Por favor intenta de nuevo.');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    if (!confirm(`¿Estás seguro de que quieres eliminar el post "${post.title}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el post');
      }

      // Redirigir a la lista de posts
      router.push('/admin/posts');
      router.refresh();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error al eliminar el post');
    }
  };

  if (loading) {
    console.log('[EditPostPage] Renderizando estado de carga');
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-text-secondary">Cargando post...</p>
      </div>
    );
  }

  if (error && !post && !loading) {
    console.error('[EditPostPage] ⚠️ Renderizando error sin post - ESTO CAUSA REDIRECCIÓN:', { error, post, postId, loading });
    console.error('[EditPostPage] Stack trace:', new Error().stack);
    // Agregar un pequeño delay para ver si algo cambia antes de mostrar el error
    return (
      <div className="rounded-lg border p-4" style={{ borderColor: 'rgba(239, 68, 68, 0.5)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
        <p className="text-red-400 font-semibold mb-2">Error al cargar el post</p>
        <p className="text-red-300 text-sm mb-4">{error}</p>
        <p className="text-text-muted text-xs mb-4">Post ID: {postId}</p>
        <button
          onClick={() => {
            console.log('[EditPostPage] Botón "Volver a Posts" clickeado manualmente');
            router.push('/admin/posts');
          }}
          className="mt-4 px-4 py-2 rounded-lg border text-text-primary hover:bg-space-secondary transition-colors"
          style={{ borderColor: 'var(--border-glow)' }}
        >
          Volver a Posts
        </button>
      </div>
    );
  }
  
  console.log('[EditPostPage] Renderizando formulario:', { postId, hasPost: !!post, error, loading });

  console.log('[EditPostPage] Renderizando componente principal');
  
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('[EditPostPage] ⚠️ ERROR CAPTURADO POR ERRORBOUNDARY:', {
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
          errorInfo: {
            componentStack: errorInfo.componentStack,
          },
        });
        // NO establecer error aquí para evitar que cause desmontaje
      }}
      fallback={
        <div className="space-y-6">
          <div className="rounded-lg border p-4" style={{ borderColor: 'rgba(239, 68, 68, 0.5)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <p className="text-red-400 font-semibold mb-2">Error en el editor de posts</p>
            <p className="text-red-300 text-sm mb-4">Revisa la consola para más detalles</p>
            <button
              onClick={() => router.push('/admin/posts')}
              className="px-4 py-2 rounded-lg border text-text-primary"
              style={{ borderColor: 'var(--border-glow)' }}
            >
              Volver a Posts
            </button>
          </div>
        </div>
      }
    >
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-text-primary">Editar Post</h1>
          <p className="mt-2 text-text-secondary">Modifica tu artículo</p>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 rounded-lg border transition-colors hover:bg-red-500/10 text-red-400 border-red-500/50 hover:border-red-500"
        >
          Eliminar
        </button>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div
            className="rounded-lg border p-4 text-sm"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.5)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#fca5a5',
            }}
          >
            {error}
          </div>
        )}

        {/* Título */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-text-secondary mb-2"
          >
            Título *
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full rounded-lg border bg-space-primary px-4 py-3 text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20"
            style={{
              borderColor: 'var(--border-glow)',
            }}
            placeholder="Título del post"
            disabled={saving}
          />
        </div>

        {/* Slug */}
        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-text-secondary mb-2"
          >
            Slug * (URL amigable)
          </label>
          <input
            id="slug"
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border bg-space-primary px-4 py-3 text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20 font-mono text-sm"
            style={{
              borderColor: 'var(--border-glow)',
            }}
            placeholder="titulo-del-post"
            disabled={saving}
          />
        </div>

        {/* Excerpt */}
        <div>
          <label
            htmlFor="excerpt"
            className="block text-sm font-medium text-text-secondary mb-2"
          >
            Extracto (opcional)
          </label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full rounded-lg border bg-space-primary px-4 py-3 text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20 resize-none"
            style={{
              borderColor: 'var(--border-glow)',
            }}
            placeholder="Breve descripción del post..."
            disabled={saving}
          />
        </div>

        {/* Contenido - Editor Markdown */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Contenido * (Markdown con soporte LaTeX)
          </label>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Escribe tu contenido en markdown. Usa $...$ para fórmulas inline y $$...$$ para fórmulas en bloque."
            postId={postId}
            currentPostSlug={slug}
          />
        </div>

        {/* Categorías y Subcategorías */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Categorías y Subcategorías (opcional)
          </label>
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.3)' }}>
            <CategorySelector
              selectedCategoryIds={categoryIds}
              selectedSubcategoryIds={subcategoryIds}
              onCategoryChange={setCategoryIds}
              onSubcategoryChange={setSubcategoryIds}
              allowCreate={true}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-text-secondary mb-2"
          >
            Tags (opcional)
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-lg border bg-space-primary px-4 py-3 text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20"
            style={{
              borderColor: 'var(--border-glow)',
            }}
            placeholder="react, nextjs, tutorial"
            disabled={saving}
          />
        </div>

        {/* Publicado */}
        <div className="flex items-center gap-3">
          <input
            id="published"
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="w-4 h-4 rounded border bg-space-primary text-star-cyan focus:ring-2 focus:ring-star-cyan/50"
            style={{
              borderColor: 'var(--border-glow)',
            }}
            disabled={saving}
          />
          <label
            htmlFor="published"
            className="text-sm font-medium text-text-secondary cursor-pointer"
          >
            Publicado
          </label>
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-star-cyan text-space-dark font-medium transition-all hover:bg-star-cyan/90 focus:outline-none focus:ring-2 focus:ring-star-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed glow-cyan"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/posts')}
            disabled={saving}
            className="px-6 py-3 rounded-lg border text-text-primary font-medium transition-colors hover:bg-space-secondary focus:outline-none focus:ring-2 focus:ring-star-cyan/50 disabled:opacity-50"
            style={{
              borderColor: 'var(--border-glow)',
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
    </ErrorBoundary>
  );
}

