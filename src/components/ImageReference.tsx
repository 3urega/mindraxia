'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getImageReferenceUrl } from '@/lib/image-anchors';

interface ImageReferenceProps {
  anchorId: string;
  postSlug?: string;
  linkText: string;
  currentSlug?: string;
  embed?: boolean;
}

interface EmbeddedImage {
  url: string;
  alt?: string;
  description?: string;
  filename?: string;
  postTitle: string;
  postSlug: string;
}

export default function ImageReference({
  anchorId,
  postSlug,
  linkText,
  currentSlug,
  embed = false,
}: ImageReferenceProps) {
  const [embeddedData, setEmbeddedData] = useState<EmbeddedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const href = getImageReferenceUrl(anchorId, postSlug, currentSlug);

  useEffect(() => {
    if (embed && postSlug) {
      setLoading(true);
      setError(null);
      
      fetch(`/api/public/images/${postSlug}/${anchorId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Imagen no encontrada');
          }
          return res.json();
        })
        .then((data) => {
          setEmbeddedData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching embedded image:', err);
          setError('No se pudo cargar la imagen');
          setLoading(false);
        });
    }
  }, [embed, postSlug, anchorId]);

  // Si no es embed, mostrar solo enlace (comportamiento actual)
  if (!embed) {
    return (
      <Link
        href={href}
        className="text-star-cyan underline decoration-dotted underline-offset-2 transition-colors hover:text-nebula-purple"
        title={`Ir a imagen: ${anchorId}`}
      >
        {linkText}
      </Link>
    );
  }

  // Si es embed pero no hay postSlug, mostrar solo enlace
  if (!postSlug) {
    return (
      <Link
        href={href}
        className="text-star-cyan underline decoration-dotted underline-offset-2 transition-colors hover:text-nebula-purple"
        title={`Ir a imagen: ${anchorId}`}
      >
        {linkText}
      </Link>
    );
  }

  // Mostrar contenido incrustado
  if (loading) {
    return (
      <span className="text-text-muted italic text-sm">
        Cargando imagen...
      </span>
    );
  }

  if (error || !embeddedData) {
    return (
      <Link
        href={href}
        className="text-star-cyan underline decoration-dotted underline-offset-2 transition-colors hover:text-nebula-purple"
        title={`Ir a imagen: ${anchorId}`}
      >
        {linkText} {error && '(no disponible)'}
      </Link>
    );
  }

  return (
    <div className="my-4 rounded-lg border-2 p-4" style={{
      borderColor: 'rgba(124, 58, 237, 0.5)',
      backgroundColor: 'rgba(124, 58, 237, 0.1)',
    }}>
      {/* Indicador de origen */}
      <div className="mb-3 flex items-center justify-between">
        <Link
          href={`/blog/${embeddedData.postSlug}`}
          className="text-xs text-nebula-purple hover:text-nebula-purple/80 transition-colors"
        >
          De: {embeddedData.postTitle}
        </Link>
        <Link
          href={href}
          className="text-xs text-star-cyan hover:text-star-cyan/80 transition-colors underline"
        >
          Ver original →
        </Link>
      </div>

      {/* Descripción si existe */}
      {embeddedData.description && (
        <p className="text-sm text-text-muted mb-3 italic">
          {embeddedData.description}
        </p>
      )}

      {/* Imagen renderizada */}
      <div className="relative w-full max-w-full overflow-hidden rounded">
        <Image
          src={embeddedData.url}
          alt={embeddedData.alt || embeddedData.filename || 'Imagen incrustada'}
          width={800}
          height={600}
          className="w-full h-auto"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
}

