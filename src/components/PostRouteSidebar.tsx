'use client';

import { useState, useEffect } from 'react';
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

interface PostRouteSidebarProps {
  postId: string;
  currentPostSlug: string;
}

export default function PostRouteSidebar({ postId, currentPostSlug }: PostRouteSidebarProps) {
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoute = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/routes`);
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          // Obtener detalles de la primera ruta
          const routeResponse = await fetch(`/api/routes/slug/${data.routes[0].slug}`);
          if (routeResponse.ok) {
            const routeData = await routeResponse.json();
            setRoute(routeData.route);
          }
        }
      } catch (error) {
        console.error('Error loading route:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoute();
  }, [postId]);

  if (loading || !route) {
    return null;
  }

  return (
    <RouteSidebar
      routeId={route.id}
      routeName={route.name}
      items={route.items}
      progress={route.progress || []}
      currentPostSlug={currentPostSlug}
    />
  );
}



