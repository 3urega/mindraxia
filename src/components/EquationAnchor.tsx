'use client';

import { useState } from 'react';
import Link from 'next/link';

interface EquationAnchorProps {
  anchorId: string;
  description?: string;
  number: number; // Número de la ecuación (siempre presente)
  children: React.ReactNode;
  postSlug: string;
}

export default function EquationAnchor({
  anchorId,
  description,
  number,
  children,
  postSlug,
}: EquationAnchorProps) {
  const [copied, setCopied] = useState(false);
  const htmlId = `eq-${anchorId}`;
  const anchorUrl = `/blog/${postSlug}#${htmlId}`;

  const copyLink = async () => {
    const fullUrl = `${window.location.origin}${anchorUrl}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div
      id={htmlId}
      className="group relative my-6 rounded-lg border-2 p-4"
      style={{
        borderColor: 'rgba(124, 58, 237, 0.5)', // purple/nebulosa
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
      }}
    >
      {/* Título de la ecuación */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-nebula-purple">
          Ecuación {number}
        </h4>
        <button
          onClick={copyLink}
          className="opacity-0 group-hover:opacity-100 transition-opacity rounded border px-2 py-1 text-xs transition-colors hover:bg-space-secondary hover:text-star-cyan bg-space-primary"
          style={{ borderColor: 'var(--border-glow)' }}
          title="Copiar enlace a esta ecuación"
        >
          {copied ? '✓ Copiado' : '🔗'}
        </button>
      </div>

      {/* Descripción (si existe) */}
      {description && (
        <p className="text-sm text-text-muted mb-3 italic">
          {description}
        </p>
      )}

      {/* Contenido de la ecuación */}
      <div className="text-text-secondary">
        {children}
      </div>
    </div>
  );
}

