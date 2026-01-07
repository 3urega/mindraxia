'use client';

import { useState, FormEvent } from 'react';

interface CollectionFormProps {
  initialData?: {
    title: string;
    description?: string | null;
    isPublic: boolean;
  };
  onSubmit: (data: { title: string; description?: string; isPublic: boolean }) => Promise<void>;
  submitLabel?: string;
}

export default function CollectionForm({
  initialData,
  onSubmit,
  submitLabel = 'Crear',
}: CollectionFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!title.trim()) {
        setError('El título es requerido');
        setLoading(false);
        return;
      }

      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        isPublic,
      });
    } catch (err: any) {
      setError(err.message || 'Error al guardar la agrupación');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg border border-red-400/50 bg-red-400/10 text-red-400">
          {error}
        </div>
      )}

      {/* Título */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-2">
          Título *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border bg-space-primary text-text-primary placeholder-text-muted focus:outline-none focus:border-star-cyan"
          style={{ borderColor: 'var(--border-glow)' }}
          placeholder="Ej: Apuntes de cálculo para física"
          required
          maxLength={200}
        />
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
          Descripción
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border bg-space-primary text-text-primary placeholder-text-muted focus:outline-none focus:border-star-cyan resize-none"
          style={{ borderColor: 'var(--border-glow)' }}
          placeholder="Descripción de la agrupación..."
          rows={4}
          maxLength={1000}
        />
      </div>

      {/* Visibilidad */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="w-5 h-5 rounded border focus:ring-2 focus:ring-star-cyan"
          style={{ borderColor: 'var(--border-glow)' }}
        />
        <label htmlFor="isPublic" className="text-sm font-medium text-text-primary">
          Hacer pública (visible para todos los usuarios)
        </label>
      </div>
      <p className="text-xs text-text-muted">
        Si no está marcada, la agrupación será privada y solo tú podrás verla.
      </p>

      {/* Botones */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg border transition-colors hover:border-star-cyan hover:text-star-cyan disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderColor: 'var(--border-glow)' }}
        >
          {loading ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

