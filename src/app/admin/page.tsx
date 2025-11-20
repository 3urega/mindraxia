import { getCurrentUser } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminDashboard() {
  const user = await getCurrentUser();

  // El middleware ya protege esta ruta, pero verificamos aquí también
  if (!user) {
    return null;
  }

  // Obtener estadísticas
  const [totalPosts, publishedPosts, draftPosts] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.post.count({ where: { published: false } }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-text-primary">
          Dashboard
        </h1>
        <p className="mt-2 text-text-secondary">
          Bienvenido de vuelta, {user.name}
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Total Posts */}
        <div
          className="rounded-lg border p-6"
          style={{
            borderColor: 'var(--border-glow)',
            backgroundColor: 'rgba(26, 26, 46, 0.5)',
          }}
        >
          <h3 className="text-sm font-medium text-text-secondary">
            Total Posts
          </h3>
          <p className="mt-2 text-3xl font-bold text-star-cyan">
            {totalPosts}
          </p>
        </div>

        {/* Posts Publicados */}
        <div
          className="rounded-lg border p-6"
          style={{
            borderColor: 'var(--border-glow)',
            backgroundColor: 'rgba(26, 26, 46, 0.5)',
          }}
        >
          <h3 className="text-sm font-medium text-text-secondary">
            Publicados
          </h3>
          <p className="mt-2 text-3xl font-bold text-nebula-purple">
            {publishedPosts}
          </p>
        </div>

        {/* Borradores */}
        <div
          className="rounded-lg border p-6"
          style={{
            borderColor: 'var(--border-glow)',
            backgroundColor: 'rgba(26, 26, 46, 0.5)',
          }}
        >
          <h3 className="text-sm font-medium text-text-secondary">
            Borradores
          </h3>
          <p className="mt-2 text-3xl font-bold text-star-gold">
            {draftPosts}
          </p>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div
        className="rounded-lg border p-6"
        style={{
          borderColor: 'var(--border-glow)',
          backgroundColor: 'rgba(26, 26, 46, 0.5)',
        }}
      >
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          Acciones Rápidas
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-star-cyan text-space-dark font-medium transition-all hover:bg-star-cyan/90 glow-cyan"
          >
            Crear Nuevo Post
          </Link>
          <Link
            href="/admin/posts"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border text-text-primary font-medium transition-colors hover:bg-space-secondary"
            style={{
              borderColor: 'var(--border-glow)',
            }}
          >
            Ver Todos los Posts
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border text-text-primary font-medium transition-colors hover:bg-space-secondary"
            style={{
              borderColor: 'var(--border-glow)',
            }}
          >
            Ver Blog Público
          </Link>
        </div>
      </div>
    </div>
  );
}

