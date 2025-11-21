'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageAnchorProps {
  anchorId: string;
  description?: string;
  imageUrl: string;
  alt?: string;
  postSlug: string;
}

export default function ImageAnchor({
  anchorId,
  description,
  imageUrl,
  alt,
  postSlug,
}: ImageAnchorProps) {
  const [copied, setCopied] = useState(false);
  const htmlId = `img-${anchorId}`;
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

  // Detectar si es SVG
  const isSvg = imageUrl.toLowerCase().endsWith('.svg') || imageUrl.includes('image/svg+xml');

  return (
    <figure
      id={htmlId}
      className="group relative my-6"
    >
      <div className="relative w-full">
        {isSvg ? (
          // SVG: usar img normal porque Next.js Image no optimiza SVG bien
          <img
            src={imageUrl}
            alt={alt || ''}
            className="w-full h-auto rounded-lg"
            loading="lazy"
          />
        ) : (
          // Imágenes bitmap: usar Next.js Image para optimización
          <Image
            src={imageUrl}
            alt={alt || ''}
            width={800}
            height={600}
            className="w-full h-auto rounded-lg"
            loading="lazy"
          />
        )}
        
        {/* Botón copiar enlace (aparece al hacer hover) */}
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={copyLink}
            className="rounded border px-2 py-1 text-xs transition-colors hover:bg-space-secondary hover:text-star-cyan bg-space-primary"
            style={{ borderColor: 'var(--border-glow)' }}
            title="Copiar enlace a esta imagen"
          >
            {copied ? '✓ Copiado' : '🔗'}
          </button>
        </div>
      </div>
      
      {alt && (
        <figcaption className="mt-2 text-sm text-text-muted text-center italic">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

