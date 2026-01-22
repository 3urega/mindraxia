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
    excerpt?: string | null;
  };
}

interface RouteSidebarProps {
  routeId: string;
  routeName: string;
  items: RouteItem[];
  progress?: Array<{ postId: string; readAt: string }>;
  currentPostSlug?: string;
}

export default function RouteSidebar({
  routeId,
  routeName,
  items,
  progress = [],
  currentPostSlug,
}: RouteSidebarProps) {
  const readSet = new Set(progress.map((p) => p.postId));

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface-secondary rounded-lg border border-border-primary p-6">
      <Link
        href={`/routes/${routeId}`}
        className="block mb-4 text-lg font-semibold text-text-primary hover:text-nebula-purple transition-colors"
      >
        {routeName}
      </Link>
      <div className="space-y-2">
        {items.map((item) => {
          const isRead = readSet.has(item.postId);
          const isCurrent = currentPostSlug === item.post.slug;

          return (
            <Link
              key={item.id}
              href={`/blog/${item.post.slug}`}
              className={`block p-3 rounded-lg border transition-colors group ${
                isCurrent
                  ? 'border-star-cyan bg-star-cyan/10'
                  : 'border-border-primary/30 hover:border-nebula-purple/50'
              }`}
            >
              <div className="flex items-start gap-2">
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isRead
                      ? 'bg-star-cyan/20 text-star-cyan'
                      : 'bg-surface-primary text-text-muted'
                  }`}
                >
                  {isRead ? '✓' : item.order}
                </span>
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm font-medium line-clamp-2 ${
                      isCurrent
                        ? 'text-star-cyan'
                        : 'text-text-primary group-hover:text-nebula-purple'
                    } transition-colors`}
                  >
                    {item.post.title}
                  </h4>
                  {item.post.excerpt && (
                    <p className="text-text-muted text-xs mt-1 line-clamp-1">
                      {item.post.excerpt}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}






