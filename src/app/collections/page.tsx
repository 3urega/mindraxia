'use client';

import { useSearchParams } from 'next/navigation';
import CollectionList from '@/components/CollectionList';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function CollectionsPage() {
  const searchParams = useSearchParams();
  const authorId = searchParams.get('authorId') || undefined;
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    // Verificar si el usuario está autenticado para mostrar botón de crear
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <header>
          <h1 className="text-4xl font-bold text-text-primary mb-4">Agrupaciones de Posts</h1>
          <p className="text-lg text-text-secondary">
            Colecciones de posts organizadas por usuarios
          </p>
        </header>
        {user && (
          <Link
            href="/collections/new"
            className="px-4 py-2 rounded-lg border transition-colors hover:border-star-cyan hover:text-star-cyan"
            style={{ borderColor: 'var(--border-glow)' }}
          >
            Crear Agrupación
          </Link>
        )}
      </div>

      <CollectionList authorId={authorId} />
    </div>
  );
}


