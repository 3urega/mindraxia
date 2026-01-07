import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/get-session';
import Link from 'next/link';
import { LogoutButton } from '@/components/LogoutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtener usuario actual
  const user = await getCurrentUser();

  // Si no hay usuario, el middleware ya redirige a /admin/login
  // Pero aquí verificamos solo si necesitamos mostrar el layout del admin
  if (!user) {
    // Si no hay usuario, dejar que el middleware maneje la redirección
    // Solo renderizar children sin el layout del admin
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-space-dark">
      {/* Header del Admin */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-sm bg-space-primary/80"
        style={{
          borderColor: 'var(--border-glow)',
        }}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo y navegación */}
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-xl font-bold text-star-cyan transition-opacity hover:opacity-80"
            >
              Admin
            </Link>
            <div className="flex gap-4 text-sm">
              <Link
                href="/admin"
                className="text-text-secondary transition-colors hover:text-star-cyan"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/posts"
                className="text-text-secondary transition-colors hover:text-star-cyan"
              >
                Posts
              </Link>
              <Link
                href="/admin/posts/new"
                className="text-text-secondary transition-colors hover:text-star-cyan"
              >
                Nuevo Post
              </Link>
              <Link
                href="/admin/routes"
                className="text-text-secondary transition-colors hover:text-star-cyan"
              >
                Rutas
              </Link>
              <Link
                href="/admin/routes/new"
                className="text-text-secondary transition-colors hover:text-star-cyan"
              >
                Nueva Ruta
              </Link>
            </div>
          </div>

          {/* User info y logout */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">
              {user.name}
            </span>
            <LogoutButton />
          </div>
        </nav>
      </header>

      {/* Contenido */}
      <main className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

