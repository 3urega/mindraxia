'use client';

import Link from 'next/link';
import { getEquationReferenceUrl } from '@/lib/markdown-anchors';

interface EquationReferenceProps {
  anchorId: string;
  postSlug?: string;
  linkText: string;
  currentSlug?: string;
}

export default function EquationReference({
  anchorId,
  postSlug,
  linkText,
  currentSlug,
}: EquationReferenceProps) {
  const href = getEquationReferenceUrl(anchorId, postSlug, currentSlug);

  return (
    <Link
      href={href}
      className="text-star-cyan underline decoration-dotted underline-offset-2 transition-colors hover:text-nebula-purple"
      title={`Ir a ecuación: ${anchorId}`}
    >
      {linkText}
    </Link>
  );
}

