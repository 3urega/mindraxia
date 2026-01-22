'use client';

import { useState, useEffect } from 'react';
import RouteNavigation from './RouteNavigation';
import RouteSidebar from './RouteSidebar';

interface RouteItem {
  id: string;
  postId: string;
  order: number;
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
  };
}

interface Route {
  id: string;
  name: string;
  slug: string;
  items: RouteItem[];
  progress?: Array<{ postId: string; readAt: string }>;
}

interface PostRouteInfoProps {
  postId: string;
  currentPostSlug: string;
}

export default function PostRouteInfo({ postId, currentPostSlug }: PostRouteInfoProps) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/routes`);
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        
        // Para cada ruta, obtener sus items y progreso
        const routesWithDetails = await Promise.all(
          (data.routes || []).map(async (route: { id: string; slug: string; name: string }) => {
            const routeResponse = await fetch(`/api/routes/slug/${route.slug}`);
            if (!routeResponse.ok) {
              return null;
            }
            const routeData = await routeResponse.json();
            return routeData.route;
          })
        );

        setRoutes(routesWithDetails.filter(Boolean));
      } catch (error) {
        console.error('Error loading routes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, [postId]);

  if (loading || routes.length === 0) {
    return null;
  }

  // Por ahora, mostrar solo la primera ruta (se puede mejorar para mostrar múltiples)
  const route = routes[0];

  return (
    <>
      <div className="mb-6">
        <RouteNavigation
          routeId={route.id}
          routeName={route.name}
          items={route.items}
          currentPostSlug={currentPostSlug}
        />
      </div>
    </>
  );
}






