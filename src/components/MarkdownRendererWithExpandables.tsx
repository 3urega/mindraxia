'use client';

import { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import ExpandableSectionsControl from './ExpandableSectionsControl';

interface MarkdownRendererWithExpandablesProps {
  content: string;
  currentSlug?: string;
}

export default function MarkdownRendererWithExpandables({
  content,
  currentSlug,
}: MarkdownRendererWithExpandablesProps) {
  const [expandableSectionIds, setExpandableSectionIds] = useState<string[]>([]);

  return (
    <>
      <ExpandableSectionsControl sectionIds={expandableSectionIds} />
      <MarkdownRenderer
        content={content}
        currentSlug={currentSlug}
        onExpandableSectionsChange={setExpandableSectionIds}
      />
    </>
  );
}

