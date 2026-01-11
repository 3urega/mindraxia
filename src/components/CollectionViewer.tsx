'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  published: boolean;
}

interface CollectionItem {
  id: string;
  description?: string | null;
  post: Post;
}

interface Collection {
  id: string;
  title: string;
  description?: string | null;
  isPublic: boolean;
  author: {
    id: string;
    name: string;
    email: string;
  };
  items: CollectionItem[];
  createdAt: string;
  updatedAt: string;
}

interface CollectionViewerProps {
  collection: Collection;
  isAuthor: boolean;
}

export default function CollectionViewer({
  collection,
  isAuthor,
  onDelete,
}: CollectionViewerProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta agrupación?')) {
      return;
    }

    try {
      const response = await fetch(`/api/collections/${collection.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar agrupación');
      }

      router.push('/collections');
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Error al eliminar agrupación');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-text-primary mb-4">{collection.title}</h1>
          {collection.description && (
            <p className="text-lg text-text-secondary mb-4">{collection.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <span>
              Por <span className="text-star-cyan">{collection.author.name}</span>
            </span>
            <span>•</span>
            <span>{formatDate(collection.createdAt)}</span>
            {!collection.isPublic && (
              <>
                <span>•</span>
                <span className="px-2 py-1 text-xs rounded-full bg-text-muted/20 text-text-muted">
                  Privada
                </span>
              </>
            )}
          </div>
        </div>
        {isAuthor && (
          <div className="flex gap-2 ml-4">
            <Link
              href={`/collections/${collection.id}/edit`}
              className="px-4 py-2 rounded-lg border transition-colors hover:border-star-cyan hover:text-star-cyan"
              style={{ borderColor: 'var(--border-glow)' }}
            >
              Editar
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg border transition-colors hover:border-red-400 hover:text-red-400"
              style={{ borderColor: 'var(--border-glow)' }}
            >
              Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Separador */}
      <div
        className="h-px"
        style={{ backgroundColor: 'var(--border-glow)' }}
      />

      {/* Lista de posts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-text-primary">
          Posts ({collection.items.length})
        </h2>
        {collection.items.length === 0 ? (
          <p className="text-text-muted">Esta agrupación aún no tiene posts.</p>
        ) : (
          <div className="space-y-4">
            {collection.items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg border"
                style={{
                  borderColor: 'var(--border-glow)',
                  backgroundColor: 'rgba(26, 26, 46, 0.3)',
                }}
              >
                <Link
                  href={`/blog/${item.post.slug}`}
                  className="block group"
                >
                  <h3 className="text-lg font-semibold text-text-primary group-hover:text-nebula-purple transition-colors mb-2">
                    {item.post.title}
                  </h3>
                  {item.post.excerpt && (
                    <p className="text-text-muted text-sm mb-2 line-clamp-2">
                      {item.post.excerpt}
                    </p>
                  )}
                </Link>
                {item.description && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-glow)' }}>
                    <p className="text-text-secondary text-sm italic">{item.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



