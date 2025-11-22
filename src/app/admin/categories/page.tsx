'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showCreateSubcategory, setShowCreateSubcategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [newSubcategoryDescription, setNewSubcategoryDescription] = useState('');
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] = useState<string>('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Error al cargar categorías');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('El nombre de la categoría es requerido');
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al crear categoría');
      }

      await loadCategories();
      setNewCategoryName('');
      setNewCategoryDescription('');
      setShowCreateCategory(false);
    } catch (err: any) {
      console.error('Error creating category:', err);
      alert(err.message || 'Error al crear categoría');
    }
  };

  const handleCreateSubcategory = async () => {
    if (!newSubcategoryName.trim()) {
      alert('El nombre de la subcategoría es requerido');
      return;
    }

    if (!selectedCategoryForSubcategory) {
      alert('Debes seleccionar una categoría padre');
      return;
    }

    try {
      const response = await fetch('/api/subcategories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newSubcategoryName.trim(),
          description: newSubcategoryDescription.trim() || undefined,
          categoryId: selectedCategoryForSubcategory,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al crear subcategoría');
      }

      await loadCategories();
      setNewSubcategoryName('');
      setNewSubcategoryDescription('');
      setSelectedCategoryForSubcategory('');
      setShowCreateSubcategory(false);
    } catch (err: any) {
      console.error('Error creating subcategory:', err);
      alert(err.message || 'Error al crear subcategoría');
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category.id);
    setEditName(category.name);
    setEditDescription(category.description || '');
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory.id);
    setEditName(subcategory.name);
    setEditDescription(subcategory.description || '');
  };

  const handleUpdateCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al actualizar categoría');
      }

      await loadCategories();
      setEditingCategory(null);
      setEditName('');
      setEditDescription('');
    } catch (err: any) {
      console.error('Error updating category:', err);
      alert(err.message || 'Error al actualizar categoría');
    }
  };

  const handleUpdateSubcategory = async (subcategoryId: string) => {
    try {
      const response = await fetch(`/api/subcategories/${subcategoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al actualizar subcategoría');
      }

      await loadCategories();
      setEditingSubcategory(null);
      setEditName('');
      setEditDescription('');
    } catch (err: any) {
      console.error('Error updating subcategory:', err);
      alert(err.message || 'Error al actualizar subcategoría');
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoryName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar categoría');
      }

      await loadCategories();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      alert(err.message || 'Error al eliminar categoría');
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string, subcategoryName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la subcategoría "${subcategoryName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/subcategories/${subcategoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar subcategoría');
      }

      await loadCategories();
    } catch (err: any) {
      console.error('Error deleting subcategory:', err);
      alert(err.message || 'Error al eliminar subcategoría');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-text-secondary">Cargando categorías...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border p-4" style={{ borderColor: 'rgba(239, 68, 68, 0.5)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-text-primary">Categorías</h1>
          <p className="mt-2 text-text-secondary">Gestiona las categorías y subcategorías del blog</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateSubcategory(!showCreateSubcategory)}
            className="px-4 py-2 rounded-lg border text-text-primary font-medium transition-colors hover:bg-space-secondary"
            style={{ borderColor: 'var(--border-glow)' }}
          >
            Nueva Subcategoría
          </button>
          <button
            onClick={() => setShowCreateCategory(!showCreateCategory)}
            className="px-6 py-2 rounded-lg bg-star-cyan text-space-dark font-medium transition-all hover:bg-star-cyan/90 glow-cyan"
          >
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* Formulario de nueva categoría */}
      {showCreateCategory && (
        <div className="rounded-lg border p-6" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.3)' }}>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Nueva Categoría</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full rounded-lg border bg-space-primary px-4 py-3 text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20"
                style={{ borderColor: 'var(--border-glow)' }}
                placeholder="Nombre de la categoría"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border bg-space-primary px-4 py-3 text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20 resize-none"
                style={{ borderColor: 'var(--border-glow)' }}
                placeholder="Descripción de la categoría"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateCategory}
                className="px-4 py-2 rounded-lg bg-star-cyan text-space-dark font-medium transition-all hover:bg-star-cyan/90"
              >
                Crear
              </button>
              <button
                onClick={() => {
                  setShowCreateCategory(false);
                  setNewCategoryName('');
                  setNewCategoryDescription('');
                }}
                className="px-4 py-2 rounded-lg border text-text-secondary hover:bg-space-secondary transition-colors"
                style={{ borderColor: 'var(--border-glow)' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de nueva subcategoría */}
      {showCreateSubcategory && (
        <div className="rounded-lg border p-6" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.3)' }}>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Nueva Subcategoría</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Categoría Padre *
              </label>
              <select
                value={selectedCategoryForSubcategory}
                onChange={(e) => setSelectedCategoryForSubcategory(e.target.value)}
                className="w-full rounded-lg border bg-space-primary px-4 py-3 text-text-primary focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20"
                style={{ borderColor: 'var(--border-glow)' }}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                className="w-full rounded-lg border bg-space-primary px-4 py-3 text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20"
                style={{ borderColor: 'var(--border-glow)' }}
                placeholder="Nombre de la subcategoría"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={newSubcategoryDescription}
                onChange={(e) => setNewSubcategoryDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border bg-space-primary px-4 py-3 text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20 resize-none"
                style={{ borderColor: 'var(--border-glow)' }}
                placeholder="Descripción de la subcategoría"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateSubcategory}
                className="px-4 py-2 rounded-lg bg-star-cyan text-space-dark font-medium transition-all hover:bg-star-cyan/90"
              >
                Crear
              </button>
              <button
                onClick={() => {
                  setShowCreateSubcategory(false);
                  setNewSubcategoryName('');
                  setNewSubcategoryDescription('');
                  setSelectedCategoryForSubcategory('');
                }}
                className="px-4 py-2 rounded-lg border text-text-secondary hover:bg-space-secondary transition-colors"
                style={{ borderColor: 'var(--border-glow)' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de categorías */}
      {categories.length > 0 ? (
        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-lg border p-6"
              style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.3)' }}
            >
              {/* Categoría */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {editingCategory === category.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-lg border bg-space-primary px-3 py-2 text-text-primary focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20"
                        style={{ borderColor: 'var(--border-glow)' }}
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border bg-space-primary px-3 py-2 text-text-primary focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20 resize-none text-sm"
                        style={{ borderColor: 'var(--border-glow)' }}
                        placeholder="Descripción"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateCategory(category.id)}
                          className="px-3 py-1.5 text-sm rounded-lg bg-star-cyan text-space-dark font-medium transition-all hover:bg-star-cyan/90"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditingCategory(null);
                            setEditName('');
                            setEditDescription('');
                          }}
                          className="px-3 py-1.5 text-sm rounded-lg border text-text-secondary hover:bg-space-secondary transition-colors"
                          style={{ borderColor: 'var(--border-glow)' }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-text-muted mt-1">{category.description}</p>
                      )}
                    </div>
                  )}
                </div>
                {editingCategory !== category.id && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="px-3 py-1.5 text-sm rounded-lg border text-text-secondary hover:bg-space-secondary transition-colors"
                      style={{ borderColor: 'var(--border-glow)' }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      className="px-3 py-1.5 text-sm rounded-lg border transition-colors hover:bg-red-500/10 text-red-400 border-red-500/50 hover:border-red-500"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>

              {/* Subcategorías */}
              {category.subcategories.length > 0 && (
                <div className="pl-6 border-l-2 mt-4" style={{ borderColor: 'var(--border-glow)' }}>
                  <h4 className="text-sm font-medium text-text-secondary mb-3">Subcategorías:</h4>
                  <div className="space-y-3">
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="flex items-start justify-between">
                        <div className="flex-1">
                          {editingSubcategory === subcategory.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full rounded-lg border bg-space-primary px-3 py-2 text-text-primary focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20 text-sm"
                                style={{ borderColor: 'var(--border-glow)' }}
                              />
                              <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                rows={2}
                                className="w-full rounded-lg border bg-space-primary px-3 py-2 text-text-primary focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20 resize-none text-sm"
                                style={{ borderColor: 'var(--border-glow)' }}
                                placeholder="Descripción"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateSubcategory(subcategory.id)}
                                  className="px-3 py-1.5 text-xs rounded-lg bg-star-cyan text-space-dark font-medium transition-all hover:bg-star-cyan/90"
                                >
                                  Guardar
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingSubcategory(null);
                                    setEditName('');
                                    setEditDescription('');
                                  }}
                                  className="px-3 py-1.5 text-xs rounded-lg border text-text-secondary hover:bg-space-secondary transition-colors"
                                  style={{ borderColor: 'var(--border-glow)' }}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="text-sm text-text-primary font-medium">{subcategory.name}</span>
                              {subcategory.description && (
                                <p className="text-xs text-text-muted mt-1">{subcategory.description}</p>
                              )}
                            </div>
                          )}
                        </div>
                        {editingSubcategory !== subcategory.id && (
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditSubcategory(subcategory)}
                              className="px-2 py-1 text-xs rounded-lg border text-text-secondary hover:bg-space-secondary transition-colors"
                              style={{ borderColor: 'var(--border-glow)' }}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteSubcategory(subcategory.id, subcategory.name)}
                              className="px-2 py-1 text-xs rounded-lg border transition-colors hover:bg-red-500/10 text-red-400 border-red-500/50 hover:border-red-500"
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border p-12 text-center" style={{ borderColor: 'var(--border-glow)' }}>
          <p className="text-xl text-text-secondary mb-2">No hay categorías aún</p>
          <p className="text-text-muted mb-6">Crea tu primera categoría para comenzar</p>
          <button
            onClick={() => setShowCreateCategory(true)}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-star-cyan text-space-dark font-medium transition-all hover:bg-star-cyan/90 glow-cyan"
          >
            Crear Primera Categoría
          </button>
        </div>
      )}
    </div>
  );
}

