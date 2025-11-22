'use client';

import Link from 'next/link';
import { getTheoremReferenceUrl } from '@/lib/theorem-anchors';

interface TheoremReferenceProps {
  anchorId: string;
  postSlug?: string;
  linkText: string;
  currentSlug?: string;
}

export default function TheoremReference({
  anchorId,
  postSlug,
  linkText,
  currentSlug,
}: TheoremReferenceProps) {
  const href = getTheoremReferenceUrl(anchorId, postSlug, currentSlug);

  return (
    <Link
      href={href}
      className="text-star-cyan underline decoration-dotted underline-offset-2 transition-colors hover:text-nebula-purple"
      title={`Ir a teorema: ${anchorId}`}
    >
      {linkText}
    </Link>
  );
}

