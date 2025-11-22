'use client';

import Link from "next/link";

interface PostCardProps {
  title: string;
  excerpt?: string;
  date?: string;
  tags?: string[];
  categories?: Array<{ id: string; name: string; slug: string }>;
  subcategories?: Array<{ id: string; name: string; slug: string; category: { id: string; name: string; slug: string } }>;
  slug: string;
}

export default function PostCard({ title, excerpt, date, tags, categories = [], subcategories = [], slug }: PostCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group block rounded-lg border p-6 transition-all hover:border-star-cyan"
      style={{
        borderColor: 'var(--border-glow)',
        backgroundColor: 'rgba(26, 26, 46, 0.5)',
      }}
    >
      <div className="space-y-4">
        {/* Título */}
        <h3 className="text-xl font-semibold text-text-primary transition-colors group-hover:text-star-cyan">
          {title}
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-text-secondary line-clamp-3 overflow-hidden text-ellipsis">
            {excerpt}
          </p>
        )}

        {/* Metadata: Fecha, Categorías, Subcategorías y Tags */}
        <div className="space-y-3">
          {date && (
            <div className="text-sm text-text-muted">
              <time dateTime={date}>
                {new Date(date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          )}
          
          {/* Categorías y Subcategorías */}
          {(categories.length > 0 || subcategories.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog?category=${category.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-star-cyan/10"
                  style={{
                    borderColor: 'var(--border-glow)',
                    color: 'var(--star-cyan)',
                  }}
                >
                  {category.name}
                </Link>
              ))}
              {subcategories.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  href={`/blog?subcategory=${subcategory.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-star-cyan/10"
                  style={{
                    borderColor: 'var(--border-glow)',
                    color: 'var(--nebula-purple)',
                  }}
                >
                  {subcategory.category.name} &gt; {subcategory.name}
                </Link>
              ))}
            </div>
          )}
          
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full border px-3 py-1 text-xs"
                  style={{
                    borderColor: 'var(--border-glow)',
                    color: 'var(--star-cyan)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Read More Link */}
        <div className="text-star-cyan transition-colors group-hover:underline">
          Leer más →
        </div>
      </div>
    </Link>
  );
}

