'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDefinitionReferenceUrl } from '@/lib/definition-anchors';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';

interface DefinitionReferenceProps {
  anchorId: string;
  postSlug?: string;
  linkText: string;
  currentSlug?: string;
  embed?: boolean;
}

interface EmbeddedDefinition {
  content: string;
  description?: string;
  number: number;
  postTitle: string;
  postSlug: string;
}

export default function DefinitionReference({
  anchorId,
  postSlug,
  linkText,
  currentSlug,
  embed = false,
}: DefinitionReferenceProps) {
  const [embeddedData, setEmbeddedData] = useState<EmbeddedDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const href = getDefinitionReferenceUrl(anchorId, postSlug, currentSlug);

  useEffect(() => {
    if (embed && postSlug) {
      setLoading(true);
      setError(null);
      
      fetch(`/api/public/definitions/${postSlug}/${anchorId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Definición no encontrada');
          }
          return res.json();
        })
        .then((data) => {
          setEmbeddedData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching embedded definition:', err);
          setError('No se pudo cargar la definición');
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
        title={`Ir a definición: ${anchorId}`}
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
        title={`Ir a definición: ${anchorId}`}
      >
        {linkText}
      </Link>
    );
  }

  // Mostrar contenido incrustado
  if (loading) {
    return (
      <span className="text-text-muted italic text-sm">
        Cargando definición...
      </span>
    );
  }

  if (error || !embeddedData) {
    return (
      <Link
        href={href}
        className="text-star-cyan underline decoration-dotted underline-offset-2 transition-colors hover:text-nebula-purple"
        title={`Ir a definición: ${anchorId}`}
      >
        {linkText} {error && '(no disponible)'}
      </Link>
    );
  }

  return (
    <div
      className="my-4 rounded-lg border-2 p-4"
      style={{
        borderColor: 'rgba(34, 211, 238, 0.5)',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
      }}
    >
      {/* Indicador de origen */}
      <div className="mb-3">
        <Link
          href={href}
          className="text-xs text-nebula-purple hover:text-nebula-purple/80 transition-colors"
        >
          (De: {embeddedData.postTitle})
        </Link>
      </div>

      {/* Descripción si existe */}
      {embeddedData.description && (
        <p className="text-sm text-text-muted mb-3 italic">
          {embeddedData.description}
        </p>
      )}

      {/* Contenido renderizado */}
      <div className="text-text-secondary">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex]}
        >
          {embeddedData.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

