'use client';

import { useState, useEffect } from 'react';
import CollectionCard from './CollectionCard';

interface Collection {
  id: string;
  title: string;
  description?: string | null;
  author: {
    id: string;
    name: string;
    email: string;
  };
  postCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CollectionListProps {
  authorId?: string;
}

export default function CollectionList({ authorId }: CollectionListProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = authorId
          ? `/api/collections?authorId=${encodeURIComponent(authorId)}`
          : '/api/collections';
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Error al cargar agrupaciones');
        }
        const data = await response.json();
        setCollections(data.collections || []);
      } catch (err) {
        console.error('Error loading collections:', err);
        setError('Error al cargar agrupaciones');
      } finally {
        setLoading(false);
      }
    };

    loadCollections();
  }, [authorId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-text-muted">Cargando agrupaciones...</div>
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

  if (collections.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-text-muted">
          {authorId ? 'No hay agrupaciones disponibles' : 'No hay agrupaciones públicas disponibles'}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          id={collection.id}
          title={collection.title}
          description={collection.description}
          author={collection.author}
          postCount={collection.postCount}
          isPublic={collection.isPublic}
          createdAt={collection.createdAt}
        />
      ))}
    </div>
  );
}
