'use client';

import Link from 'next/link';
import { getImageReferenceUrl } from '@/lib/image-anchors';

interface ImageReferenceProps {
  anchorId: string;
  postSlug?: string;
  linkText: string;
  currentSlug?: string;
}

export default function ImageReference({
  anchorId,
  postSlug,
  linkText,
  currentSlug,
}: ImageReferenceProps) {
  const href = getImageReferenceUrl(anchorId, postSlug, currentSlug);

  return (
    <Link
      href={href}
      className="text-star-cyan underline decoration-dotted underline-offset-2 transition-colors hover:text-nebula-purple"
      title={`Ir a imagen: ${anchorId}`}
    >
      {linkText}
    </Link>
  );
}

