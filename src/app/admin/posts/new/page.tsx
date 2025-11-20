'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownEditor from '@/components/MarkdownEditor';
import { generateSlug } from '@/lib/utils';

export default function NewPostPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-generar slug desde título
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Parsear tags (separados por comas)
      const tagsArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Validación básica
      if (!title || title.length < 3) {
        setError('El título debe tener al menos 3 caracteres');
        setLoading(false);
        return;
      }

      if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
        setError('El slug solo puede contener letras minúsculas, números y guiones');
        setLoading(false);
        return;
      }

      if (!content || content.length < 10) {
        setError('El contenido debe tener al menos 10 caracteres');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
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
        setError(data.message || 'Error al crear el post');
        setLoading(false);
        return;
      }

      // Redirigir a la lista de posts
      router.push('/admin/posts');
      router.refresh();
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Error de conexión. Por favor intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-text-primary">Nuevo Post</h1>
        <p className="mt-2 text-text-secondary">Crea un nuevo artículo para el blog</p>
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
            disabled={loading}
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
            disabled={loading}
          />
          <p className="mt-1 text-xs text-text-muted">
            Solo letras minúsculas, números y guiones. Se genera automáticamente desde el título.
          </p>
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
            disabled={loading}
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
          />
          <p className="mt-2 text-xs text-text-muted">
            Soporta markdown completo y fórmulas matemáticas LaTeX. Usa los botones de acción rápida para insertar fórmulas. 
            Para fórmulas numeradas, usa: <code className="px-1 py-0.5 rounded bg-space-primary text-star-cyan text-xs">$$\tag{1} fórmula $$</code>
          </p>
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
            disabled={loading}
          />
          <p className="mt-1 text-xs text-text-muted">
            Separa los tags con comas
          </p>
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
            disabled={loading}
          />
          <label
            htmlFor="published"
            className="text-sm font-medium text-text-secondary cursor-pointer"
          >
            Publicar inmediatamente
          </label>
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-star-cyan text-space-dark font-medium transition-all hover:bg-star-cyan/90 focus:outline-none focus:ring-2 focus:ring-star-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed glow-cyan"
          >
            {loading ? 'Guardando...' : published ? 'Publicar Post' : 'Guardar Borrador'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
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

