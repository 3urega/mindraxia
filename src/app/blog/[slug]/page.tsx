import { notFound } from 'next/navigation';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ScrollToAnchor from '@/components/ScrollToAnchor';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  author: {
    id: string;
    name: string;
    email: string;
  };
  tags: Array<{ id: string; name: string }>;
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_URL || 'https://mindraxia.com'
        : 'http://localhost:3000';

    const url = `${baseUrl}/api/posts/slug/${slug}`;

    const response = await fetch(url, {
      next: { revalidate: 60 }, // ISR: revalidar cada 60 segundos
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }

    const post: Post = await response.json();
    return post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  // Si el post no existe o no está publicado, mostrar 404
  if (!post) {
    notFound();
  }

  const displayDate = post.publishedAt || post.createdAt;

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Scroll automático a anchor si hay hash en URL */}
      <ScrollToAnchor />
      
      {/* Botón de volver */}
      <div className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-text-secondary transition-colors hover:text-star-cyan"
        >
          <span>←</span>
          <span>Volver al blog</span>
        </Link>
      </div>

      {/* Header del post */}
      <header className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold text-text-primary sm:text-5xl lg:text-6xl">
          {post.title}
        </h1>

        {/* Metadatos */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
          {displayDate && (
            <time dateTime={displayDate} className="flex items-center gap-2">
              <span>{formatDate(displayDate)}</span>
            </time>
          )}
          {post.author && (
            <span className="flex items-center gap-2">
              <span>Por</span>
              <span className="text-text-secondary">{post.author.name}</span>
            </span>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border px-3 py-1 text-xs"
                style={{
                  borderColor: 'var(--border-glow)',
                  color: 'var(--star-cyan)',
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Excerpt (si existe) */}
        {post.excerpt && (
          <p className="text-lg text-text-secondary italic">{post.excerpt}</p>
        )}
      </header>

      {/* Separador */}
      <div
        className="mb-8 h-px"
        style={{ backgroundColor: 'var(--border-glow)' }}
      />

      {/* Contenido del post */}
      <div
        className="rounded-lg border p-8"
        style={{
          borderColor: 'var(--border-glow)',
          backgroundColor: 'rgba(26, 26, 46, 0.3)',
        }}
      >
        <MarkdownRenderer content={post.content} currentSlug={post.slug} />
      </div>

      {/* Footer del post */}
      <footer className="mt-12 pt-8">
        <div
          className="h-px mb-8"
          style={{ backgroundColor: 'var(--border-glow)' }}
        />
        <div className="flex flex-col items-center gap-4 text-center text-text-muted">
          <p className="text-sm">
            Publicado el {formatDate(post.publishedAt || post.createdAt)}
          </p>
          {post.updatedAt !== post.createdAt && (
            <p className="text-xs">
              Última actualización: {formatDate(post.updatedAt)}
            </p>
          )}
          <Link
            href="/blog"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors hover:border-star-cyan hover:text-star-cyan"
            style={{ borderColor: 'var(--border-glow)' }}
          >
            ← Volver al blog
          </Link>
        </div>
      </footer>
    </article>
  );
}

