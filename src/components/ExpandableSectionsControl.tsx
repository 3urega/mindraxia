'use client';

import { useState } from 'react';

interface ExpandableSectionsControlProps {
  sectionIds: string[];
}

export default function ExpandableSectionsControl({
  sectionIds,
}: ExpandableSectionsControlProps) {
  const [allExpanded, setAllExpanded] = useState(false);

  // Si no hay secciones, no renderizar nada
  if (sectionIds.length === 0) {
    return null;
  }

  const handleToggleAll = () => {
    const newState = !allExpanded;
    setAllExpanded(newState);

    // Emitir evento global para que todas las secciones escuchen
    const event = new CustomEvent(newState ? 'expand-all-sections' : 'collapse-all-sections');
    window.dispatchEvent(event);
  };

  return (
    <div className="mb-4 flex justify-end">
      <button
        type="button"
        onClick={handleToggleAll}
        className="px-4 py-2 text-sm rounded-lg border transition-colors hover:border-star-cyan hover:text-star-cyan"
        style={{ borderColor: 'var(--border-glow)' }}
      >
        {allExpanded ? 'Colapsar todas' : 'Expandir todas'}
      </button>
    </div>
  );
}



