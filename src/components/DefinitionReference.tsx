'use client';

import Link from 'next/link';
import { getDefinitionReferenceUrl } from '@/lib/definition-anchors';

interface DefinitionReferenceProps {
  anchorId: string;
  postSlug?: string;
  linkText: string;
  currentSlug?: string;
}

export default function DefinitionReference({
  anchorId,
  postSlug,
  linkText,
  currentSlug,
}: DefinitionReferenceProps) {
  const href = getDefinitionReferenceUrl(anchorId, postSlug, currentSlug);

  return (
    <Link
      href={href}
      className="text-star-cyan underline decoration-dotted underline-offset-2 transition-colors hover:text-nebula-purple"
      title={`Ir a definición: ${anchorId}`}
    >
      {linkText}
    </Link>
  );
}

