'use client';

import Link from 'next/link';

interface AssociatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published: boolean;
  createdAt: string;
  publishedAt?: string | null;
}

interface AssociatedPostsListProps {
  posts: AssociatedPost[];
  showAdminActions?: boolean;
  parentPostId?: string;
}

export default function AssociatedPostsList({
  posts,
  showAdminActions = false,
  parentPostId,
}: AssociatedPostsListProps) {
  if (posts.length === 0) {
    return null;
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="mt-8 rounded-lg border p-6" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.3)' }}>
      <h2 className="text-xl font-semibold text-text-primary mb-4">
        Posts Relacionados
      </h2>
      
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-lg border p-4 transition-colors hover:bg-space-secondary"
            style={{ borderColor: 'var(--border-glow)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Link
                  href={showAdminActions ? `/admin/posts/${post.id}` : `/blog/${post.slug}`}
                  className="text-lg font-semibold text-star-cyan hover:text-star-cyan/80 transition-colors block mb-2"
                >
                  {post.title}
                </Link>
                
                {post.excerpt && (
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                  {showAdminActions && (
                    <span
                      className={`px-2 py-1 rounded ${
                        post.published
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {post.published ? 'Publicado' : 'Borrador'}
                    </span>
                  )}
                </div>
              </div>
              
              {showAdminActions && (
                <div className="flex gap-2">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
                    style={{ borderColor: 'var(--border-glow)' }}
                  >
                    Editar
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {showAdminActions && parentPostId && (
        <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-glow)' }}>
          <Link
            href={`/admin/posts/new?parentPostId=${parentPostId}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
            style={{ borderColor: 'var(--border-glow)' }}
          >
            <span>+</span>
            <span>Crear Post Asociado</span>
          </Link>
        </div>
      )}
    </div>
  );
}
