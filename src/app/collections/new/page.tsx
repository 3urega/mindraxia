'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CollectionForm from '@/components/CollectionForm';

export default function NewCollectionPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (!data.user) {
          router.push('/admin/login?redirect=' + encodeURIComponent('/collections/new'));
          return;
        }
        setUser(data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/admin/login?redirect=' + encodeURIComponent('/collections/new'));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleSubmit = async (data: {
    title: string;
    description?: string;
    isPublic: boolean;
  }) => {
    const response = await fetch('/api/collections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear agrupación');
    }

    const result = await response.json();
    router.push(`/collections/${result.collection.id}/edit`);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-text-muted">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Nueva Agrupación</h1>
        <p className="text-text-muted">Crea una nueva colección de posts</p>
      </div>

      <div className="bg-surface-secondary rounded-lg border border-border-primary p-6">
        <CollectionForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

