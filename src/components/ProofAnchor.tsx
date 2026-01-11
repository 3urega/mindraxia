'use client';

import { useState } from 'react';
import { getProofHtmlId } from '@/lib/proof-anchors';

interface ProofAnchorProps {
  anchorId: string;
  description?: string;
  number: number;
  children: React.ReactNode;
  postSlug: string;
}

export default function ProofAnchor({
  anchorId,
  description,
  number,
  children,
  postSlug,
}: ProofAnchorProps) {
  const [copied, setCopied] = useState(false);
  const htmlId = getProofHtmlId(anchorId);
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
        borderColor: 'rgba(251, 191, 36, 0.5)', // amber/yellow
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        overflowX: 'hidden',
        maxWidth: '100%',
      }}
    >
      {/* Título de la demostración */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold" style={{ color: 'rgb(251, 191, 36)' }}>
          Demostración {number}
        </h4>
        <button
          onClick={copyLink}
          className="opacity-0 group-hover:opacity-100 transition-opacity rounded border px-2 py-1 text-xs transition-colors hover:bg-space-secondary hover:text-star-cyan bg-space-primary"
          style={{ borderColor: 'var(--border-glow)' }}
          title="Copiar enlace a esta demostración"
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

      {/* Contenido de la demostración */}
      <div 
        className="text-text-secondary"
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          whiteSpace: 'normal',
          maxWidth: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
}



