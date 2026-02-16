'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Route {
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
  createdAt: string;
  updatedAt: string;
}

export default function AdminRoutesPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingRouteId, setDeletingRouteId] = useState<string | null>(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/routes');
      if (!response.ok) {
        throw new Error('Error al cargar rutas');
      }
      const data = await response.json();
      setRoutes(data.routes || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
      setError('Error al cargar las rutas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (routeId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta ruta?')) {
      return;
    }

    try {
      setDeletingRouteId(routeId);
      const response = await fetch(`/api/routes/${routeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar ruta');
      }

      await fetchRoutes();
    } catch (error: any) {
      console.error('Error deleting route:', error);
      alert(error.message || 'Error al eliminar la ruta');
    } finally {
      setDeletingRouteId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-text-muted">Cargando rutas...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Rutas de Posts</h1>
        <Link
          href="/admin/routes/new"
          className="px-4 py-2 bg-nebula-purple text-white rounded-lg hover:bg-nebula-purple/80 transition-colors"
        >
          + Nueva Ruta
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {routes.length === 0 ? (
        <div className="text-text-muted text-center py-12">
          No hay rutas creadas aún.
          <Link
            href="/admin/routes/new"
            className="ml-2 text-nebula-purple hover:text-nebula-purple/80 underline"
          >
            Crear una nueva ruta
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border-primary">
                <th className="text-left py-3 px-4 text-text-primary font-semibold">Nombre</th>
                <th className="text-left py-3 px-4 text-text-primary font-semibold">Categoría</th>
                <th className="text-left py-3 px-4 text-text-primary font-semibold">Posts</th>
                <th className="text-left py-3 px-4 text-text-primary font-semibold">Autor</th>
                <th className="text-left py-3 px-4 text-text-primary font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr
                  key={route.id}
                  className="border-b border-border-primary/30 hover:bg-surface-secondary transition-colors"
                >
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/routes/${route.id}`}
                      className="text-text-primary hover:text-nebula-purple transition-colors font-medium"
                    >
                      {route.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-text-muted">{route.category.name}</td>
                  <td className="py-3 px-4 text-text-muted">{route.postCount}</td>
                  <td className="py-3 px-4 text-text-muted">{route.author.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/routes/${route.id}`}
                        className="px-3 py-1 text-sm bg-surface-primary border border-border-primary rounded hover:bg-surface-secondary transition-colors text-text-primary"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(route.id)}
                        disabled={deletingRouteId === route.id}
                        className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingRouteId === route.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}









