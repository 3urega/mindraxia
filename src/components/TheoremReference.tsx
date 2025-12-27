'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTheoremReferenceUrl } from '@/lib/theorem-anchors';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';

interface TheoremReferenceProps {
  anchorId: string;
  postSlug?: string;
  linkText: string;
  currentSlug?: string;
  embed?: boolean;
}

interface EmbeddedTheorem {
  content: string;
  description?: string;
  number: number;
  postTitle: string;
  postSlug: string;
}

export default function TheoremReference({
  anchorId,
  postSlug,
  linkText,
  currentSlug,
  embed = false,
}: TheoremReferenceProps) {
  const [embeddedData, setEmbeddedData] = useState<EmbeddedTheorem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const href = getTheoremReferenceUrl(anchorId, postSlug, currentSlug);

  useEffect(() => {
    if (embed && postSlug) {
      setLoading(true);
      setError(null);
      
      fetch(`/api/public/theorems/${postSlug}/${anchorId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Teorema no encontrado');
          }
          return res.json();
        })
        .then((data) => {
          setEmbeddedData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching embedded theorem:', err);
          setError('No se pudo cargar el teorema');
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
        title={`Ir a teorema: ${anchorId}`}
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
        title={`Ir a teorema: ${anchorId}`}
      >
        {linkText}
      </Link>
    );
  }

  // Mostrar contenido incrustado
  if (loading) {
    return (
      <span className="text-text-muted italic text-sm">
        Cargando teorema...
      </span>
    );
  }

  if (error || !embeddedData) {
    return (
      <Link
        href={href}
        className="text-star-cyan underline decoration-dotted underline-offset-2 transition-colors hover:text-nebula-purple"
        title={`Ir a teorema: ${anchorId}`}
      >
        {linkText} {error && '(no disponible)'}
      </Link>
    );
  }

  return (
    <div
      className="my-4 rounded-lg border-2 p-4"
      style={{
        borderColor: 'rgba(34, 197, 94, 0.5)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
      }}
    >
      {/* Indicador de origen */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-semibold" style={{ color: 'rgb(34, 197, 94)' }}>
            Teorema {embeddedData.number}
          </h4>
          <Link
            href={`/blog/${embeddedData.postSlug}`}
            className="text-xs text-nebula-purple hover:text-nebula-purple/80 transition-colors"
          >
            (De: {embeddedData.postTitle})
          </Link>
        </div>
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

