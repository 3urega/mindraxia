'use client';

import Link from 'next/link';

interface RouteCardProps {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  author: {
    id: string;
    name: string;
  };
  postCount: number;
}

export default function RouteCard({
  id,
  name,
  slug,
  description,
  category,
  author,
  postCount,
}: RouteCardProps) {
  return (
    <Link
      href={`/routes/${slug}`}
      className="block p-6 bg-surface-secondary rounded-lg border border-border-primary/30 hover:border-nebula-purple/50 transition-all hover:shadow-lg group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold text-text-primary group-hover:text-nebula-purple transition-colors line-clamp-2">
          {name}
        </h3>
        <span className="ml-4 px-3 py-1 text-xs rounded-full bg-nebula-purple/20 text-nebula-purple font-medium flex-shrink-0">
          {postCount} {postCount === 1 ? 'post' : 'posts'}
        </span>
      </div>

      {description && (
        <p className="text-text-muted text-sm mb-4 line-clamp-2">
          {description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <span className="text-nebula-purple">Categoría:</span>
          <span>{category.name}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-star-cyan">Por:</span>
          <span>{author.name}</span>
        </span>
      </div>
    </Link>
  );
}








