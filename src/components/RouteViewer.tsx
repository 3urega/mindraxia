'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/get-session';

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

interface RouteViewerProps {
  routeId: string;
  items: RouteItem[];
  progress?: Array<{ postId: string; readAt: string }>;
  currentPostSlug?: string;
}

export default function RouteViewer({
  routeId,
  items,
  progress = [],
  currentPostSlug,
}: RouteViewerProps) {
  const [userProgress, setUserProgress] = useState<Set<string>>(
    new Set(progress.map((p) => p.postId))
  );
  const [readDates, setReadDates] = useState<Map<string, string>>(
    new Map(progress.map((p) => [p.postId, p.readAt]))
  );
  const [markingPostId, setMarkingPostId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleMarkAsRead = async (postId: string, isRead: boolean) => {
    try {
      setMarkingPostId(postId);
      const response = await fetch(`/api/routes/${routeId}/progress/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: !isRead }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          alert('Debes iniciar sesión para marcar posts como leídos. Redirigiendo al login...');
          window.location.href = '/admin/login?redirect=' + encodeURIComponent(window.location.pathname);
          return;
        }
        throw new Error(errorData.message || 'Error al actualizar progreso');
      }

      if (!isRead) {
        // Marcar como leído
        setUserProgress((prev) => new Set([...prev, postId]));
        setReadDates((prev) => {
          const newMap = new Map(prev);
          newMap.set(postId, new Date().toISOString());
          return newMap;
        });
      } else {
        // Desmarcar como leído
        setUserProgress((prev) => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        setReadDates((prev) => {
          const newMap = new Map(prev);
          newMap.delete(postId);
          return newMap;
        });
      }
    } catch (err: any) {
      console.error('Error marking post as read:', err);
      alert(err.message || 'Error al marcar el post como leído');
    } finally {
      setMarkingPostId(null);
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isRead = userProgress.has(item.postId);
        const readDate = readDates.get(item.postId);
        const isCurrent = currentPostSlug === item.post.slug;

        return (
          <div
            key={item.id}
            className={`p-4 rounded-lg border transition-all ${
              isCurrent
                ? 'border-star-cyan bg-star-cyan/10'
                : 'border-border-primary/30 hover:border-nebula-purple/50'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Indicador de orden y estado */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2"
                style={{
                  borderColor: isRead ? 'var(--star-cyan)' : 'var(--border-glow)',
                  backgroundColor: isRead ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
                  color: isRead ? 'var(--star-cyan)' : 'var(--text-muted)',
                }}
              >
                {isRead ? '✓' : item.order}
              </div>

              {/* Contenido del post */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/blog/${item.post.slug}`}
                  className={`block font-medium mb-1 transition-colors ${
                    isCurrent
                      ? 'text-star-cyan'
                      : 'text-text-primary hover:text-nebula-purple'
                  }`}
                >
                  {item.post.title}
                </Link>
                {item.post.excerpt && (
                  <p className="text-text-muted text-sm line-clamp-2 mb-2">
                    {item.post.excerpt}
                  </p>
                )}
                {readDate && (
                  <p className="text-xs text-text-muted italic">
                    Leído el {formatDate(readDate)}
                  </p>
                )}
              </div>

              {/* Botón para marcar como leído */}
              <button
                type="button"
                onClick={() => handleMarkAsRead(item.postId, isRead)}
                disabled={markingPostId === item.postId}
                className={`px-3 py-1.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRead
                    ? 'bg-star-cyan/20 text-star-cyan hover:bg-star-cyan/30'
                    : 'bg-surface-secondary text-text-muted hover:bg-surface-primary'
                }`}
              >
                {markingPostId === item.postId
                  ? '...'
                  : isRead
                  ? 'Marcar no leído'
                  : 'Marcar leído'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}






