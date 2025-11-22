'use client';

import { useState, useEffect } from 'react';

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

interface CategorySelectorProps {
  selectedCategoryIds?: string[];
  selectedSubcategoryIds?: string[];
  onCategoryChange: (categoryIds: string[]) => void;
  onSubcategoryChange: (subcategoryIds: string[]) => void;
  allowCreate?: boolean;
}

export default function CategorySelector({
  selectedCategoryIds = [],
  selectedSubcategoryIds = [],
  onCategoryChange,
  onSubcategoryChange,
  allowCreate = true,
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter((id) => id !== categoryId)
      : [...selectedCategoryIds, categoryId];
    onCategoryChange(newSelected);
    
    // Si se deselecciona una categoría, deseleccionar también sus subcategorías
    if (!newSelected.includes(categoryId)) {
      const category = categories.find((c) => c.id === categoryId);
      if (category) {
        const subcategoryIdsToRemove = category.subcategories.map((s) => s.id);
        const newSubcategoryIds = selectedSubcategoryIds.filter(
          (id) => !subcategoryIdsToRemove.includes(id)
        );
        onSubcategoryChange(newSubcategoryIds);
      }
    }
  };

  const handleSubcategoryToggle = (subcategoryId: string) => {
    const newSelected = selectedSubcategoryIds.includes(subcategoryId)
      ? selectedSubcategoryIds.filter((id) => id !== subcategoryId)
      : [...selectedSubcategoryIds, subcategoryId];
    onSubcategoryChange(newSelected);
    
    // Si se selecciona una subcategoría, asegurar que su categoría padre esté seleccionada
    const subcategory = categories
      .flatMap((c) => c.subcategories.map((s) => ({ ...s, categoryId: c.id })))
      .find((s) => s.id === subcategoryId);
    
    if (subcategory && !selectedCategoryIds.includes(subcategory.categoryId)) {
      onCategoryChange([...selectedCategoryIds, subcategory.categoryId]);
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

      const newCategory = await response.json();
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setShowCreateCategory(false);
      
      // Seleccionar automáticamente la nueva categoría
      onCategoryChange([...selectedCategoryIds, newCategory.id]);
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

      const newSubcategory = await response.json();
      await loadCategories(); // Recargar para obtener la estructura completa
      setNewSubcategoryName('');
      setNewSubcategoryDescription('');
      setSelectedCategoryForSubcategory('');
      setShowCreateSubcategory(false);
      
      // Seleccionar automáticamente la nueva subcategoría
      onSubcategoryChange([...selectedSubcategoryIds, newSubcategory.id]);
      
      // Asegurar que la categoría padre esté seleccionada
      if (!selectedCategoryIds.includes(selectedCategoryForSubcategory)) {
        onCategoryChange([...selectedCategoryIds, selectedCategoryForSubcategory]);
      }
    } catch (err: any) {
      console.error('Error creating subcategory:', err);
      alert(err.message || 'Error al crear subcategoría');
    }
  };

  // Obtener subcategorías disponibles basadas en categorías seleccionadas
  // Asegurar que cada subcategoría tenga la información de su categoría padre
  const availableSubcategories = categories
    .filter((cat) => selectedCategoryIds.includes(cat.id))
    .flatMap((cat) => 
      cat.subcategories.map((sub) => ({
        ...sub,
        category: sub.category || {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
        },
      }))
    );

  if (loading) {
    return (
      <div className="text-sm text-text-muted">Cargando categorías...</div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-400">{error}</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Categorías */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-text-secondary">
            Categorías
          </label>
          {allowCreate && (
            <button
              type="button"
              onClick={() => setShowCreateCategory(!showCreateCategory)}
              className="text-xs text-star-cyan hover:text-star-cyan/80 transition-colors"
            >
              + Nueva categoría
            </button>
          )}
        </div>

        {/* Formulario de nueva categoría */}
        {showCreateCategory && allowCreate && (
          <div className="mb-4 p-4 rounded-lg border" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.3)' }}>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nombre de la categoría"
              className="w-full mb-2 rounded-lg border bg-space-primary px-3 py-2 text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20 text-sm"
              style={{ borderColor: 'var(--border-glow)' }}
            />
            <textarea
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              placeholder="Descripción (opcional)"
              rows={2}
              className="w-full mb-2 rounded-lg border bg-space-primary px-3 py-2 text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20 text-sm resize-none"
              style={{ borderColor: 'var(--border-glow)' }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreateCategory}
                className="px-3 py-1.5 text-xs rounded-lg bg-star-cyan text-space-dark font-medium transition-all hover:bg-star-cyan/90"
              >
                Crear
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateCategory(false);
                  setNewCategoryName('');
                  setNewCategoryDescription('');
                }}
                className="px-3 py-1.5 text-xs rounded-lg border text-text-secondary hover:bg-space-secondary transition-colors"
                style={{ borderColor: 'var(--border-glow)' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de categorías */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.length === 0 ? (
            <p className="text-sm text-text-muted">No hay categorías disponibles</p>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id={`category-${category.id}`}
                  checked={selectedCategoryIds.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                  className="mt-1 w-4 h-4 rounded border bg-space-primary text-star-cyan focus:ring-2 focus:ring-star-cyan/50"
                  style={{ borderColor: 'var(--border-glow)' }}
                />
                <label
                  htmlFor={`category-${category.id}`}
                  className="flex-1 text-sm text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
                >
                  {category.name}
                  {category.description && (
                    <span className="block text-xs text-text-muted mt-0.5">
                      {category.description}
                    </span>
                  )}
                </label>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Subcategorías */}
      {selectedCategoryIds.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-text-secondary">
              Subcategorías
            </label>
            {allowCreate && (
              <button
                type="button"
                onClick={() => setShowCreateSubcategory(!showCreateSubcategory)}
                className="text-xs text-star-cyan hover:text-star-cyan/80 transition-colors"
              >
                + Nueva subcategoría
              </button>
            )}
          </div>

          {/* Formulario de nueva subcategoría */}
          {showCreateSubcategory && allowCreate && (
            <div className="mb-4 p-4 rounded-lg border" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.3)' }}>
              <select
                value={selectedCategoryForSubcategory}
                onChange={(e) => setSelectedCategoryForSubcategory(e.target.value)}
                className="w-full mb-2 rounded-lg border bg-space-primary px-3 py-2 text-text-primary focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20 text-sm"
                style={{ borderColor: 'var(--border-glow)' }}
              >
                <option value="">Selecciona una categoría padre</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                placeholder="Nombre de la subcategoría"
                className="w-full mb-2 rounded-lg border bg-space-primary px-3 py-2 text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20 text-sm"
                style={{ borderColor: 'var(--border-glow)' }}
              />
              <textarea
                value={newSubcategoryDescription}
                onChange={(e) => setNewSubcategoryDescription(e.target.value)}
                placeholder="Descripción (opcional)"
                rows={2}
                className="w-full mb-2 rounded-lg border bg-space-primary px-3 py-2 text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20 text-sm resize-none"
                style={{ borderColor: 'var(--border-glow)' }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateSubcategory}
                  className="px-3 py-1.5 text-xs rounded-lg bg-star-cyan text-space-dark font-medium transition-all hover:bg-star-cyan/90"
                >
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateSubcategory(false);
                    setNewSubcategoryName('');
                    setNewSubcategoryDescription('');
                    setSelectedCategoryForSubcategory('');
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg border text-text-secondary hover:bg-space-secondary transition-colors"
                  style={{ borderColor: 'var(--border-glow)' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista de subcategorías */}
          <div className="space-y-2 max-h-48 overflow-y-auto pl-4">
            {availableSubcategories.length === 0 ? (
              <p className="text-sm text-text-muted">No hay subcategorías disponibles para las categorías seleccionadas</p>
            ) : (
              availableSubcategories.map((subcategory) => (
                <div key={subcategory.id} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id={`subcategory-${subcategory.id}`}
                    checked={selectedSubcategoryIds.includes(subcategory.id)}
                    onChange={() => handleSubcategoryToggle(subcategory.id)}
                    className="mt-1 w-4 h-4 rounded border bg-space-primary text-star-cyan focus:ring-2 focus:ring-star-cyan/50"
                    style={{ borderColor: 'var(--border-glow)' }}
                  />
                  <label
                    htmlFor={`subcategory-${subcategory.id}`}
                    className="flex-1 text-sm text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
                  >
                    <span className="text-text-muted">{subcategory.category.name} &gt; </span>
                    {subcategory.name}
                    {subcategory.description && (
                      <span className="block text-xs text-text-muted mt-0.5">
                        {subcategory.description}
                      </span>
                    )}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

