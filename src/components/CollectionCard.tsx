'use client';

import Link from 'next/link';

interface CollectionCardProps {
  id: string;
  title: string;
  description?: string | null;
  author: {
    id: string;
    name: string;
  };
  postCount: number;
  isPublic: boolean;
  createdAt: string;
}

export default function CollectionCard({
  id,
  title,
  description,
  author,
  postCount,
  isPublic,
  createdAt,
}: CollectionCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Link
      href={`/collections/${id}`}
      className="block p-6 bg-surface-secondary rounded-lg border border-border-primary/30 hover:border-nebula-purple/50 transition-all hover:shadow-lg group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold text-text-primary group-hover:text-nebula-purple transition-colors line-clamp-2">
          {title}
        </h3>
        <div className="ml-4 flex flex-col items-end gap-2 flex-shrink-0">
          <span className="px-3 py-1 text-xs rounded-full bg-nebula-purple/20 text-nebula-purple font-medium">
            {postCount} {postCount === 1 ? 'post' : 'posts'}
          </span>
          {!isPublic && (
            <span className="px-2 py-1 text-xs rounded-full bg-text-muted/20 text-text-muted">
              Privada
            </span>
          )}
        </div>
      </div>

      {description && (
        <p className="text-text-muted text-sm mb-4 line-clamp-2">
          {description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <span className="text-star-cyan">Por:</span>
          <span>{author.name}</span>
        </span>
        <span>{formatDate(createdAt)}</span>
      </div>
    </Link>
  );
}



