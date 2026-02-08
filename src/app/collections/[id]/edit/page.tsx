'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CollectionForm from '@/components/CollectionForm';
import CollectionItemsManager from '@/components/CollectionItemsManager';

export default function EditCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.id as string;
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [collection, setCollection] = useState<{
    id: string;
    title: string;
    description?: string | null;
    isPublic: boolean;
    authorId: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    if (!collectionId) return;

    const loadData = async () => {
      try {

        // Verificar usuario
        const userResponse = await fetch('/api/auth/me');
        const userData = await userResponse.json();
        if (!userData.user) {
          router.push('/admin/login?redirect=' + encodeURIComponent(`/collections/${collectionId}/edit`));
          return;
        }
        setUser(userData.user);

        // Cargar agrupación
        const collectionResponse = await fetch(`/api/collections/${collectionId}`);
        if (!collectionResponse.ok) {
          if (collectionResponse.status === 403 || collectionResponse.status === 404) {
            router.push('/collections');
            return;
          }
          throw new Error('Error al cargar agrupación');
        }

        const collectionData = await collectionResponse.json();
        const coll = collectionData.collection;
        setCollection(coll);

        // Verificar autoría
        if (userData.user.id !== coll.author.id) {
          router.push('/collections');
          return;
        }

        setIsAuthor(true);
      } catch (error) {
        console.error('Error loading collection:', error);
        router.push('/collections');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [collectionId, router]);

  const handleSubmit = async (data: {
    title: string;
    description?: string;
    isPublic: boolean;
  }) => {
    if (!collectionId) return;

    const response = await fetch(`/api/collections/${collectionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar agrupación');
    }

    // Recargar datos
    const collectionResponse = await fetch(`/api/collections/${collectionId}`);
    if (collectionResponse.ok) {
      const collectionData = await collectionResponse.json();
      setCollection(collectionData.collection);
    }
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

  if (!collection || !isAuthor) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Editar Agrupación</h1>
        <p className="text-text-muted">Edita los detalles y gestiona los posts de tu agrupación</p>
      </div>

      <div className="space-y-8">
        <div className="bg-surface-secondary rounded-lg border border-border-primary p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Detalles de la Agrupación</h2>
          <CollectionForm
            initialData={{
              title: collection.title,
              description: collection.description,
              isPublic: collection.isPublic,
            }}
            onSubmit={handleSubmit}
            submitLabel="Guardar Cambios"
          />
        </div>

        <div className="bg-surface-secondary rounded-lg border border-border-primary p-6">
          <CollectionItemsManager collectionId={collectionId} isAuthor={isAuthor} />
        </div>
      </div>
    </div>
  );
}







