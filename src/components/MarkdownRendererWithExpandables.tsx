'use client';

import { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import ExpandableSectionsControl from './ExpandableSectionsControl';
import PostTableOfContents from './PostTableOfContents';
import { Section } from '@/lib/section-anchors';

interface MarkdownRendererWithExpandablesProps {
  content: string;
  currentSlug?: string;
}

export default function MarkdownRendererWithExpandables({
  content,
  currentSlug,
}: MarkdownRendererWithExpandablesProps) {
  const [expandableSectionIds, setExpandableSectionIds] = useState<string[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  return (
    <>
      <ExpandableSectionsControl sectionIds={expandableSectionIds} />
      <MarkdownRenderer
        content={content}
        currentSlug={currentSlug}
        onExpandableSectionsChange={setExpandableSectionIds}
        onSectionsChange={setSections}
      />
      <PostTableOfContents sections={sections} currentSlug={currentSlug} />
    </>
  );
}









