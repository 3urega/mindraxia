'use client';

import Link from 'next/link';

interface RouteItem {
  id: string;
  postId: string;
  order: number;
  post: {
    id: string;
    title: string;
    slug: string;
  };
}

interface RouteNavigationProps {
  routeId: string;
  routeName: string;
  items: RouteItem[];
  currentPostSlug: string;
}

export default function RouteNavigation({
  routeId,
  routeName,
  items,
  currentPostSlug,
}: RouteNavigationProps) {
  const currentIndex = items.findIndex((item) => item.post.slug === currentPostSlug);
  
  if (currentIndex === -1) {
    return null; // El post actual no está en esta ruta
  }

  const currentItem = items[currentIndex];
  const previousItem = currentIndex > 0 ? items[currentIndex - 1] : null;
  const nextItem = currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

  return (
    <div className="mb-6 p-4 bg-surface-secondary rounded-lg border border-border-primary">
      <div className="mb-3">
        <Link
          href={`/routes/${routeId}`}
          className="text-sm text-nebula-purple hover:text-nebula-purple/80 transition-colors"
        >
          ← Volver a la ruta: {routeName}
        </Link>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-text-muted">
          Post {currentItem.order} de {items.length}
        </div>
        <div className="flex gap-2">
          {previousItem ? (
            <Link
              href={`/blog/${previousItem.post.slug}`}
              className="px-4 py-2 text-sm bg-surface-primary border border-border-primary rounded-lg hover:border-star-cyan transition-colors text-text-primary"
            >
              ← Anterior
            </Link>
          ) : (
            <span className="px-4 py-2 text-sm bg-surface-primary border border-border-primary rounded-lg text-text-muted opacity-50 cursor-not-allowed">
              ← Anterior
            </span>
          )}
          {nextItem ? (
            <Link
              href={`/blog/${nextItem.post.slug}`}
              className="px-4 py-2 text-sm bg-surface-primary border border-border-primary rounded-lg hover:border-star-cyan transition-colors text-text-primary"
            >
              Siguiente →
            </Link>
          ) : (
            <span className="px-4 py-2 text-sm bg-surface-primary border border-border-primary rounded-lg text-text-muted opacity-50 cursor-not-allowed">
              Siguiente →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


