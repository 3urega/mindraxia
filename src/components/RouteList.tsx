'use client';

import { useState, useEffect } from 'react';
import RouteCard from './RouteCard';

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

interface RouteListProps {
  categorySlug?: string;
}

export default function RouteList({ categorySlug }: RouteListProps) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = categorySlug
          ? `/api/routes?category=${encodeURIComponent(categorySlug)}`
          : '/api/routes';
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Error al cargar rutas');
        }
        const data = await response.json();
        setRoutes(data.routes || []);
      } catch (err) {
        console.error('Error loading routes:', err);
        setError('Error al cargar rutas');
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-text-muted">Cargando rutas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-text-muted">
          {categorySlug ? 'No hay rutas en esta categoría' : 'No hay rutas disponibles'}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {routes.map((route) => (
        <RouteCard
          key={route.id}
          id={route.id}
          name={route.name}
          slug={route.slug}
          description={route.description}
          category={route.category}
          author={route.author}
          postCount={route.postCount}
        />
      ))}
    </div>
  );
}









