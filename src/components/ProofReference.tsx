'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProofReferenceUrl } from '@/lib/proof-anchors';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';

interface ProofReferenceProps {
  anchorId: string;
  postSlug?: string;
  linkText: string;
  currentSlug?: string;
  embed?: boolean;
}

interface EmbeddedProof {
  content: string;
  description?: string;
  number: number;
  postTitle: string;
  postSlug: string;
}

export default function ProofReference({
  anchorId,
  postSlug,
  linkText,
  currentSlug,
  embed = false,
}: ProofReferenceProps) {
  const [embeddedData, setEmbeddedData] = useState<EmbeddedProof | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const href = getProofReferenceUrl(anchorId, postSlug, currentSlug);

  useEffect(() => {
    if (embed && postSlug) {
      setLoading(true);
      setError(null);
      
      fetch(`/api/public/proofs/${postSlug}/${anchorId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Demostración no encontrada');
          }
          return res.json();
        })
        .then((data) => {
          setEmbeddedData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching embedded proof:', err);
          setError('No se pudo cargar la demostración');
          setLoading(false);
        });
    }
  }, [embed, postSlug, anchorId]);

  // Si no es embed, mostrar solo enlace (comportamiento actual)
  if (!embed) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-star-cyan underline decoration-dotted underline-offset-2 transition-colors hover:text-nebula-purple"
        title={`Ir a demostración: ${anchorId}`}
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
        target="_blank"
        rel="noopener noreferrer"
        className="text-star-cyan underline decoration-dotted underline-offset-2 transition-colors hover:text-nebula-purple"
        title={`Ir a demostración: ${anchorId}`}
      >
        {linkText}
      </Link>
    );
  }

  // Mostrar contenido incrustado
  if (loading) {
    return (
      <span className="text-text-muted italic text-sm">
        Cargando demostración...
      </span>
    );
  }

  if (error || !embeddedData) {
    return (
      <Link
        href={href}
        className="text-star-cyan underline decoration-dotted underline-offset-2 transition-colors hover:text-nebula-purple"
        title={`Ir a demostración: ${anchorId}`}
      >
        {linkText} {error && '(no disponible)'}
      </Link>
    );
  }

  return (
    <div
      className="my-4 rounded-lg border-2 p-4"
      style={{
        borderColor: 'rgba(251, 191, 36, 0.5)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
      }}
    >
      {/* Indicador de origen */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-semibold" style={{ color: 'rgb(251, 191, 36)' }}>
            Demostración {embeddedData.number}
          </h4>
          <Link
            href={`/blog/${embeddedData.postSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-nebula-purple hover:text-nebula-purple/80 transition-colors"
          >
            (De: {embeddedData.postTitle})
          </Link>
        </div>
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
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





