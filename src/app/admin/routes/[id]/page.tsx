'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import RouteForm from '@/components/RouteForm';
import RouteItemsManager from '@/components/RouteItemsManager';

interface Route {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  categoryId: string;
  author: {
    id: string;
    name: string;
  };
}

export default function EditRoutePage() {
  const router = useRouter();
  const params = useParams();
  const routeId = params.id as string;

  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    if (routeId) {
      fetchRoute();
    }
  }, [routeId]);

  const fetchRoute = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/routes/${routeId}`);
      if (!response.ok) {
        throw new Error('Error al cargar ruta');
      }
      const data = await response.json();
      setRoute(data.route);
      // Verificar si el usuario es el autor (esto debería venir del backend)
      setIsAuthor(true); // Por ahora asumimos que es autor si puede acceder
    } catch (error: any) {
      console.error('Error fetching route:', error);
      setError(error.message || 'Error al cargar la ruta');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: {
    name: string;
    slug: string;
    description?: string;
    categoryId: string;
  }) => {
    const response = await fetch(`/api/routes/${routeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar ruta');
    }

    await fetchRoute();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-text-muted">Cargando ruta...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-text-muted">Ruta no encontrada</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Editar Ruta</h1>
        <p className="text-text-muted">Modifica la información y posts de la ruta</p>
      </div>

      <div className="space-y-8">
        <div className="bg-surface-secondary rounded-lg border border-border-primary p-6">
          <RouteForm
            routeId={routeId}
            initialData={{
              name: route.name,
              slug: route.slug,
              description: route.description,
              categoryId: route.categoryId,
            }}
            onSubmit={handleSubmit}
          />
        </div>

        <div className="bg-surface-secondary rounded-lg border border-border-primary p-6">
          <RouteItemsManager routeId={routeId} isAuthor={isAuthor} />
        </div>
      </div>
    </div>
  );
}








