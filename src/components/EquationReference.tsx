'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEquationReferenceUrl } from '@/lib/markdown-anchors';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface EquationReferenceProps {
  anchorId: string;
  postSlug?: string;
  linkText: string;
  currentSlug?: string;
  embed?: boolean;
}

interface EmbeddedEquation {
  equation: string;
  description?: string;
  postTitle: string;
  postSlug: string;
}

export default function EquationReference({
  anchorId,
  postSlug,
  linkText,
  currentSlug,
  embed = false,
}: EquationReferenceProps) {
  const [embeddedData, setEmbeddedData] = useState<EmbeddedEquation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const href = getEquationReferenceUrl(anchorId, postSlug, currentSlug);

  useEffect(() => {
    if (embed && postSlug) {
      setLoading(true);
      setError(null);
      
      fetch(`/api/public/equations/${postSlug}/${anchorId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Ecuación no encontrada');
          }
          return res.json();
        })
        .then((data) => {
          setEmbeddedData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching embedded equation:', err);
          setError('No se pudo cargar la ecuación');
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
        title={`Ir a ecuación: ${anchorId}`}
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
        title={`Ir a ecuación: ${anchorId}`}
      >
        {linkText}
      </Link>
    );
  }

  // Mostrar contenido incrustado
  if (loading) {
    return (
      <span className="text-text-muted italic text-sm">
        Cargando ecuación...
      </span>
    );
  }

  if (error || !embeddedData) {
    return (
      <Link
        href={href}
        className="text-star-cyan underline decoration-dotted underline-offset-2 transition-colors hover:text-nebula-purple"
        title={`Ir a ecuación: ${anchorId}`}
      >
        {linkText} {error && '(no disponible)'}
      </Link>
    );
  }

  return (
    <div
      className="my-4 rounded-lg border-2 p-4"
      style={{
        borderColor: 'rgba(124, 58, 237, 0.5)',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
      }}
    >
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

      {/* Ecuación renderizada */}
      <div className="text-text-secondary overflow-x-auto">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {`$$${embeddedData.equation}$$`}
        </ReactMarkdown>
      </div>
    </div>
  );
}

