'use client';

import { useState, useEffect, FormEvent } from 'react';
import { generateSlug } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface RouteFormProps {
  routeId?: string;
  initialData?: {
    name: string;
    slug: string;
    description?: string | null;
    categoryId: string;
  };
  onSubmit: (data: { name: string; slug: string; description?: string; categoryId: string }) => Promise<void>;
  onCancel?: () => void;
}

export default function RouteForm({
  routeId,
  initialData,
  onSubmit,
  onCancel,
}: RouteFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(!initialData);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (autoGenerateSlug && name) {
      setSlug(generateSlug(name));
    }
  }, [name, autoGenerateSlug]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Error al cargar categorías');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Error al cargar categorías');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!slug.trim()) {
      setError('El slug es requerido');
      return;
    }

    if (!categoryId) {
      setError('La categoría es requerida');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        categoryId,
      });
    } catch (err: any) {
      setError(err.message || 'Error al guardar la ruta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
          Nombre de la Ruta *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-surface-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-nebula-purple"
          required
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-text-primary mb-2">
          Slug *
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setAutoGenerateSlug(false);
            }}
            className="flex-1 px-4 py-2 bg-surface-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-nebula-purple"
            pattern="^[a-z0-9-]+$"
            required
          />
          {!autoGenerateSlug && (
            <button
              type="button"
              onClick={() => {
                setAutoGenerateSlug(true);
                if (name) {
                  setSlug(generateSlug(name));
                }
              }}
              className="px-3 py-2 text-sm bg-surface-primary border border-border-primary rounded-lg text-text-muted hover:text-text-primary transition-colors"
            >
              Auto
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-text-muted">
          Solo letras minúsculas, números y guiones
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
          Descripción
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 bg-surface-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-nebula-purple"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-text-primary mb-2">
          Categoría *
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-4 py-2 bg-surface-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-nebula-purple"
          required
        >
          <option value="">Seleccionar categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-nebula-purple text-white rounded-lg hover:bg-nebula-purple/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : routeId ? 'Actualizar Ruta' : 'Crear Ruta'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-surface-secondary border border-border-primary rounded-lg text-text-primary hover:bg-surface-primary transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}






