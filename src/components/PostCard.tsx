import Link from "next/link";

interface PostCardProps {
  title: string;
  excerpt?: string;
  date?: string;
  tags?: string[];
  slug: string;
}

export default function PostCard({ title, excerpt, date, tags, slug }: PostCardProps) {
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

        {/* Metadata: Fecha y Tags */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
          {date && (
            <time dateTime={date}>
              {new Date(date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
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

