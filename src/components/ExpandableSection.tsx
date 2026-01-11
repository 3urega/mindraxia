'use client';

import { useState, useEffect } from 'react';

interface ExpandableSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export default function ExpandableSection({
  id,
  title,
  children,
}: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Escuchar eventos globales para expandir/colapsar todas
    const handleExpandAll = () => setExpanded(true);
    const handleCollapseAll = () => setExpanded(false);

    window.addEventListener('expand-all-sections', handleExpandAll);
    window.addEventListener('collapse-all-sections', handleCollapseAll);

    return () => {
      window.removeEventListener('expand-all-sections', handleExpandAll);
      window.removeEventListener('collapse-all-sections', handleCollapseAll);
    };
  }, []);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div
      className="my-4 rounded-lg border"
      style={{
        borderColor: 'var(--border-glow)',
        backgroundColor: 'rgba(26, 26, 46, 0.3)',
      }}
    >
      {/* Título clickeable */}
      <button
        type="button"
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-surface-secondary/50"
      >
        <span className="text-lg font-semibold text-text-primary">{title}</span>
        <span className="text-text-muted text-xl transition-transform">
          {expanded ? '▼' : '▶'}
        </span>
      </button>

      {/* Contenido expandible */}
      {expanded && (
        <div
          className="px-4 pb-4 text-text-secondary animate-in fade-in slide-in-from-top duration-200"
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
      )}
    </div>
  );
}



