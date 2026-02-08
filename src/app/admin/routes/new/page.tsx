'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RouteForm from '@/components/RouteForm';
import RouteItemsManager from '@/components/RouteItemsManager';

export default function NewRoutePage() {
  const router = useRouter();
  const [routeId, setRouteId] = useState<string | null>(null);
  const [isAuthor, setIsAuthor] = useState(true);

  const handleSubmit = async (data: {
    name: string;
    slug: string;
    description?: string;
    categoryId: string;
  }) => {
    const response = await fetch('/api/routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear ruta');
    }

    const result = await response.json();
    setRouteId(result.route.id);
    router.push(`/admin/routes/${result.route.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Nueva Ruta</h1>
        <p className="text-text-muted">Crea una nueva secuencia de posts</p>
      </div>

      <div className="space-y-8">
        <div className="bg-surface-secondary rounded-lg border border-border-primary p-6">
          <RouteForm onSubmit={handleSubmit} />
        </div>

        {routeId && (
          <div className="bg-surface-secondary rounded-lg border border-border-primary p-6">
            <RouteItemsManager routeId={routeId} isAuthor={isAuthor} />
          </div>
        )}
      </div>
    </div>
  );
}








