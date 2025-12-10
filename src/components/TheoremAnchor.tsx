'use client';

import { useState } from 'react';
import { getTheoremHtmlId } from '@/lib/theorem-anchors';

interface TheoremAnchorProps {
  anchorId: string;
  description?: string;
  number: number;
  children: React.ReactNode;
  postSlug: string;
}

export default function TheoremAnchor({
  anchorId,
  description,
  number,
  children,
  postSlug,
}: TheoremAnchorProps) {
  const [copied, setCopied] = useState(false);
  const htmlId = getTheoremHtmlId(anchorId);
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
        borderColor: 'rgba(34, 197, 94, 0.5)', // green
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        overflowX: 'hidden',
        maxWidth: '100%',
      }}
    >
      {/* Título del teorema */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold" style={{ color: 'rgb(34, 197, 94)' }}>
          Teorema {number}
        </h4>
        <button
          onClick={copyLink}
          className="opacity-0 group-hover:opacity-100 transition-opacity rounded border px-2 py-1 text-xs transition-colors hover:bg-space-secondary hover:text-star-cyan bg-space-primary"
          style={{ borderColor: 'var(--border-glow)' }}
          title="Copiar enlace a este teorema"
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

      {/* Contenido del teorema */}
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

