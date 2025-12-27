'use client';

import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
}

interface RelatedPostsSidebarProps {
  relatedPosts: Post[];
}

export default function RelatedPostsSidebar({ relatedPosts }: RelatedPostsSidebarProps) {
  if (!relatedPosts || relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface-secondary rounded-lg border border-border-primary p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Posts Relacionados
      </h3>
      <div className="space-y-3">
        {relatedPosts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block p-3 bg-surface-primary rounded-lg border border-border-primary/30 hover:border-nebula-purple/50 transition-colors group"
          >
            <h4 className="text-text-primary font-medium group-hover:text-nebula-purple transition-colors line-clamp-2">
              {post.title}
            </h4>
            {post.excerpt && (
              <p className="text-text-muted text-sm mt-2 line-clamp-2">
                {post.excerpt}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
