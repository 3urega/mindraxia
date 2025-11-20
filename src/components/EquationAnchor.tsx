'use client';

import { useState } from 'react';
import Link from 'next/link';

interface EquationAnchorProps {
  anchorId: string;
  description?: string;
  children: React.ReactNode;
  postSlug: string;
}

export default function EquationAnchor({
  anchorId,
  description,
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
      className="group relative my-6"
    >
      {/* Contenido de la ecuación */}
      {children}

      {/* Botón copiar enlace (aparece al hacer hover) */}
      <div className="absolute right-0 top-0 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={copyLink}
          className="rounded border px-2 py-1 text-xs transition-colors hover:bg-space-secondary hover:text-star-cyan bg-space-primary"
          style={{ borderColor: 'var(--border-glow)' }}
          title="Copiar enlace a esta ecuación"
        >
          {copied ? '✓ Copiado' : '🔗'}
        </button>
      </div>
    </div>
  );
}

