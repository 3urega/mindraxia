'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MarkdownEditor from '@/components/MarkdownEditor';
import { generateSlug } from '@/lib/utils';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  published: boolean;
  tags: Array<{ id: string; name: string }>;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${postId}`);

      if (!response.ok) {
        throw new Error('Error al cargar el post');
      }

      const data: Post = await response.json();
      setPost(data);
      setTitle(data.title);
      setSlug(data.slug);
      setExcerpt(data.excerpt || '');
      setContent(data.content);
      setPublished(data.published);
      setTags(data.tags.map((tag) => tag.name).join(', '));
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Error al cargar el post');
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
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-text-secondary">Cargando post...</p>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="rounded-lg border p-4" style={{ borderColor: 'rgba(239, 68, 68, 0.5)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => router.push('/admin/posts')}
          className="mt-4 px-4 py-2 rounded-lg border text-text-primary"
          style={{ borderColor: 'var(--border-glow)' }}
        >
          Volver a Posts
        </button>
      </div>
    );
  }

  return (
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
  );
}

