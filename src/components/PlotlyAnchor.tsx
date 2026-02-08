'use client';

import { useState } from 'react';

interface PlotlyAnchorProps {
  anchorId: string;
  description?: string;
  number?: number; // Número del gráfico (opcional)
  children: React.ReactNode;
  postSlug: string;
}

export default function PlotlyAnchor({
  anchorId,
  description,
  number,
  children,
  postSlug,
}: PlotlyAnchorProps) {
  const [copied, setCopied] = useState(false);
  const htmlId = `plotly-${anchorId}`;
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
      className="group relative my-6 rounded-lg border-2"
      style={{
        borderColor: 'rgba(100, 255, 218, 0.5)', // star-cyan
        backgroundColor: 'rgba(100, 255, 218, 0.05)',
      }}
    >
      {/* Título del gráfico */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h4 className="text-lg font-semibold text-star-cyan">
          {number ? `Gráfico ${number}` : 'Gráfico'}
        </h4>
        <button
          onClick={copyLink}
          className="opacity-0 group-hover:opacity-100 transition-opacity rounded border px-2 py-1 text-xs transition-colors hover:bg-space-secondary hover:text-star-cyan bg-space-primary"
          style={{ borderColor: 'var(--border-glow)' }}
          title="Copiar enlace a este gráfico"
        >
          {copied ? '✓ Copiado' : '🔗'}
        </button>
      </div>

      {/* Descripción (si existe) */}
      {description && (
        <div className="px-4 pb-2">
          <p className="text-sm text-text-muted italic">
            {description}
          </p>
        </div>
      )}

      {/* Contenido del gráfico */}
      <div className="text-text-secondary">
        {children}
      </div>
    </div>
  );
}

