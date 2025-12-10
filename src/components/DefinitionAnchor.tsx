'use client';

import { useState } from 'react';
import { getDefinitionHtmlId } from '@/lib/definition-anchors';

interface DefinitionAnchorProps {
  anchorId: string;
  description?: string;
  number: number;
  children: React.ReactNode;
  postSlug: string;
}

export default function DefinitionAnchor({
  anchorId,
  description,
  number,
  children,
  postSlug,
}: DefinitionAnchorProps) {
  const [copied, setCopied] = useState(false);
  const htmlId = getDefinitionHtmlId(anchorId);
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
        borderColor: 'rgba(34, 211, 238, 0.5)', // cyan
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        overflowX: 'hidden',
        maxWidth: '100%',
      }}
    >
      {/* Título de la definición */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-star-cyan">
          Definición {number}
        </h4>
        <button
          onClick={copyLink}
          className="opacity-0 group-hover:opacity-100 transition-opacity rounded border px-2 py-1 text-xs transition-colors hover:bg-space-secondary hover:text-star-cyan bg-space-primary"
          style={{ borderColor: 'var(--border-glow)' }}
          title="Copiar enlace a esta definición"
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

      {/* Contenido de la definición */}
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

