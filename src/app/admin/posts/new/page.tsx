'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MarkdownEditor from '@/components/MarkdownEditor';
import CategorySelector from '@/components/CategorySelector';
import { generateSlug } from '@/lib/utils';

interface ParentPost {
  id: string;
  title: string;
  slug: string;
  tags: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  subcategories: Array<{ id: string; name: string; slug: string }>;
}

export default function NewPostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [subcategoryIds, setSubcategoryIds] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parentPostId, setParentPostId] = useState<string | null>(null);
  const [parentPost, setParentPost] = useState<ParentPost | null>(null);
  const [loadingParent, setLoadingParent] = useState(false);

  // Cargar información del post padre si existe parentPostId
  useEffect(() => {
    const parentId = searchParams.get('parentPostId');
    if (parentId) {
      setParentPostId(parentId);
      setLoadingParent(true);
      
      fetch(`/api/posts/${parentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.id) {
            setParentPost(data);
            // Pre-llenar título sugerido
            if (!title) {
              const suggestedTitle = `Resumen: ${data.title}`;
              setTitle(suggestedTitle);
              setSlug(generateSlug(suggestedTitle));
            }
            // Pre-llenar categorías y tags del padre
            if (data.categories && data.categories.length > 0) {
              setCategoryIds(data.categories.map((cat: { id: string }) => cat.id));
            }
            if (data.subcategories && data.subcategories.length > 0) {
              setSubcategoryIds(data.subcategories.map((sub: { id: string }) => sub.id));
            }
            if (data.tags && data.tags.length > 0) {
              setTags(data.tags.map((tag: { name: string }) => tag.name).join(', '));
            }
          }
          setLoadingParent(false);
        })
        .catch((err) => {
          console.error('Error loading parent post:', err);
          setError('Error al cargar el post padre');
          setLoadingParent(false);
        });
    }
  }, [searchParams]);

  // Auto-generar slug desde título
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle));
    }
  };

  const savePost = async (shouldRedirect: boolean = true) => {
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
        return false;
      }

      if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
        setError('El slug solo puede contener letras minúsculas, números y guiones');
        setLoading(false);
        return false;
      }

      if (!content || content.length < 10) {
        setError('El contenido debe tener al menos 10 caracteres');
        setLoading(false);
        return false;
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
          categoryIds,
          subcategoryIds,
          published,
          parentPostId: parentPostId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error al crear el post');
        setLoading(false);
        return false;
      }

      if (shouldRedirect) {
        // Redirigir a la lista de posts
        router.push('/admin/posts');
        router.refresh();
      } else {
        // Si se guardó exitosamente y no redirigimos, redirigir a la página de edición
        if (data && data.id) {
          router.push(`/admin/posts/${data.id}`);
          router.refresh();
        }
      }

      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Error de conexión. Por favor intenta de nuevo.');
      setLoading(false);
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await savePost(true);
  };

  // Guardar y redirigir (equivalente a "Guardar Borrador" / "Publicar Post")
  const handleSave = async () => {
    await savePost(true);
  };

  // Guardar sin redirigir (equivalente a "Guardar y continuar")
  const handleSaveAndContinue = async () => {
    await savePost(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-text-primary">
          {parentPostId ? 'Nuevo Post Asociado' : 'Nuevo Post'}
        </h1>
        <p className="mt-2 text-text-secondary">
          {parentPostId ? 'Crea un post asociado (resumen o explicación detallada)' : 'Crea un nuevo artículo para el blog'}
        </p>
      </div>

      {/* Banner de post asociado */}
      {parentPostId && (
        <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
          {loadingParent ? (
            <p className="text-sm text-text-secondary">Cargando información del post padre...</p>
          ) : parentPost ? (
            <div>
              <p className="text-sm font-semibold text-nebula-purple mb-2">
                Estás creando un post asociado de:
              </p>
              <Link
                href={`/admin/posts/${parentPost.id}`}
                className="text-base font-semibold text-star-cyan hover:text-star-cyan/80 transition-colors"
              >
                {parentPost.title}
              </Link>
            </div>
          ) : (
            <p className="text-sm text-yellow-400">
              No se pudo cargar la información del post padre. El post se creará como asociado de todas formas.
            </p>
          )}
        </div>
      )}

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

        {/* Título, Slug y Extracto en la misma línea */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>

          {/* Excerpt */}
          <div>
            <label
              htmlFor="excerpt"
              className="block text-sm font-medium text-text-secondary mb-2"
            >
              Extracto (opcional)
            </label>
            <input
              id="excerpt"
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full rounded-lg border bg-space-primary px-4 py-3 text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20"
              style={{
                borderColor: 'var(--border-glow)',
              }}
              placeholder="Breve descripción del post..."
              disabled={loading}
            />
          </div>
        </div>
        <p className="mt-1 text-xs text-text-muted">
          El slug solo puede contener letras minúsculas, números y guiones. Se genera automáticamente desde el título.
        </p>

        {/* Contenido - Editor Markdown */}
        <MarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="Escribe tu contenido en markdown. Usa $...$ para fórmulas inline y $$...$$ para fórmulas en bloque."
          onSave={handleSave}
          onSaveAndContinue={handleSaveAndContinue}
          saving={loading}
        />

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
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-star-cyan text-space-dark font-medium transition-all hover:bg-star-cyan/90 focus:outline-none focus:ring-2 focus:ring-star-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed glow-cyan"
          >
            {loading ? 'Guardando...' : published ? 'Publicar Post' : 'Guardar Borrador'}
          </button>
          <button
            type="button"
            onClick={handleSaveAndContinue}
            disabled={loading}
            className="px-6 py-3 rounded-lg border bg-space-primary text-text-primary font-medium transition-colors hover:bg-space-secondary focus:outline-none focus:ring-2 focus:ring-star-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: 'var(--border-glow)',
            }}
          >
            {loading ? 'Guardando...' : 'Guardar y continuar'}
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

