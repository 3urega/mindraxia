'use client';

import { useState, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

type TabType = 'equations' | 'images' | 'definitions' | 'theorems';
type FilterType = 'all' | 'current' | 'others';

interface Equation {
  anchorId: string;
  description?: string;
  equation: string;
  postSlug: string;
  postTitle?: string;
}

interface Image {
  id: string;
  anchorId: string | null;
  description: string | null;
  originalName: string;
  url: string;
  alt: string | null;
  postSlug: string;
}

interface Definition {
  anchorId: string;
  description?: string;
  content: string;
  number: number;
  postSlug: string;
  postTitle?: string;
}

interface Theorem {
  anchorId: string;
  description?: string;
  content: string;
  number: number;
  postSlug: string;
  postTitle?: string;
}

interface ReferenceSelectorModalProps {
  postId?: string;
  currentPostSlug?: string;
  onSelectEquation: (anchorId: string, postSlug: string) => void;
  onSelectImage: (anchorId: string, postSlug: string) => void;
  onSelectDefinition: (anchorId: string, postSlug: string) => void;
  onSelectTheorem: (anchorId: string, postSlug: string) => void;
  onClose: () => void;
}

export default function ReferenceSelectorModal({
  postId,
  currentPostSlug,
  onSelectEquation,
  onSelectImage,
  onSelectDefinition,
  onSelectTheorem,
  onClose,
}: ReferenceSelectorModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('equations');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByPost, setFilterByPost] = useState<FilterType>('all');
  
  // Estados para cada tipo de contenido
  const [equations, setEquations] = useState<Equation[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [theorems, setTheorems] = useState<Theorem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos según el tab activo
  useEffect(() => {
    console.log('[ReferenceSelectorModal] useEffect activado:', { activeTab, postId });
    let cancelled = false;
    
    const loadData = async () => {
      try {
        await loadDataForTab(activeTab);
      } catch (err) {
        if (!cancelled) {
          console.error('[ReferenceSelectorModal] ERROR en useEffect:', {
            error: err,
            message: (err as any)?.message,
            stack: (err as any)?.stack,
          });
          setError(`Error crítico: ${(err as any)?.message || 'Error desconocido'}`);
        }
      }
    };
    
    loadData();
    
    return () => {
      cancelled = true;
    };
  }, [activeTab, postId]);
  
  // Capturar errores globales
  useEffect(() => {
    console.log('[ReferenceSelectorModal] Configurando listeners de errores');
    
    const handleError = (event: ErrorEvent) => {
      console.error('[ReferenceSelectorModal] ⚠️ ERROR GLOBAL capturado:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: (event.error as any)?.stack,
      });
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[ReferenceSelectorModal] ⚠️ PROMISE REJECTION capturada:', {
        reason: event.reason,
        promise: event.promise,
        stack: (event.reason as any)?.stack,
      });
    };
    
    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
    
    return () => {
      console.log('[ReferenceSelectorModal] Limpiando listeners de errores');
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
    };
  }, []);
  
  // Log cuando el componente se monta/desmonta
  useEffect(() => {
    console.log('[ReferenceSelectorModal] Componente montado');
    return () => {
      console.log('[ReferenceSelectorModal] Componente desmontado');
    };
  }, []);

  const loadDataForTab = async (tab: TabType) => {
    console.log(`[ReferenceSelectorModal] loadDataForTab iniciado para tab: ${tab}`);
    setLoading(true);
    setError(null);
    
    try {
      console.log(`[ReferenceSelectorModal] Cargando datos para tab: ${tab}`);
      switch (tab) {
        case 'equations':
          await loadEquations();
          break;
        case 'images':
          await loadImages();
          break;
        case 'definitions':
          await loadDefinitions();
          break;
        case 'theorems':
          await loadTheorems();
          break;
      }
      console.log(`[ReferenceSelectorModal] Datos cargados exitosamente para tab: ${tab}`);
    } catch (err: any) {
      const errorMessage = err?.message || 'Error al cargar datos';
      console.error(`[ReferenceSelectorModal] ERROR en loadDataForTab para tab ${tab}:`, {
        error: err,
        message: errorMessage,
        stack: err?.stack,
      });
      setError(`Error: ${errorMessage}. Revisa la consola del servidor para más detalles.`);
      // No limpiar los datos existentes si ya se cargaron parcialmente
      // Esto evita que las imágenes desaparezcan si hay un error después de cargarlas
    } finally {
      setLoading(false);
      console.log(`[ReferenceSelectorModal] loadDataForTab finalizado para tab: ${tab}`);
    }
  };

  const loadEquations = async () => {
    let currentPostEquations: Equation[] = [];
    if (postId) {
      try {
        const currentResponse = await fetch(`/api/posts/${postId}/equations`);
        if (currentResponse.ok) {
          const currentData = await currentResponse.json();
          currentPostEquations = currentData.equations || [];
        } else if (currentResponse.status === 401 || currentResponse.status === 403) {
          // Error de autenticación, pero continuar con imágenes globales
          console.warn('No autorizado para ver ecuaciones del post actual');
        }
      } catch (err) {
        console.error('Error fetching current post equations:', err);
      }
    }

    try {
      const allResponse = await fetch('/api/equations');
      if (!allResponse.ok) {
        if (allResponse.status === 401 || allResponse.status === 403) {
          // Si no está autorizado, usar solo ecuaciones del post actual
          setEquations(currentPostEquations);
          return;
        }
        throw new Error('Failed to fetch equations');
      }

      const allData = await allResponse.json();
      const allEquations: Equation[] = allData.equations || [];

      const equationsMap = new Map<string, Equation>();
      allEquations.forEach((eq) => {
        const key = `${eq.postSlug}/${eq.anchorId}`;
        equationsMap.set(key, eq);
      });
      currentPostEquations.forEach((eq) => {
        const key = `${eq.postSlug}/${eq.anchorId}`;
        equationsMap.set(key, eq);
      });

      setEquations(Array.from(equationsMap.values()));
    } catch (err) {
      console.error('Error fetching all equations:', err);
      // Si falla, usar solo ecuaciones del post actual
      setEquations(currentPostEquations);
    }
  };

  const loadImages = async () => {
    console.log('[ReferenceSelectorModal] loadImages iniciado', { postId, currentPostSlug });
    let currentPostImages: Image[] = [];
    if (postId) {
      try {
        console.log(`[ReferenceSelectorModal] Fetching imágenes del post actual: /api/posts/${postId}/images`);
        const currentPostResponse = await fetch(`/api/posts/${postId}/images`);
        console.log(`[ReferenceSelectorModal] Respuesta del post actual:`, {
          status: currentPostResponse.status,
          statusText: currentPostResponse.statusText,
          ok: currentPostResponse.ok,
        });
        if (currentPostResponse.ok) {
          const currentPostData = await currentPostResponse.json();
          console.log('[ReferenceSelectorModal] Datos del post actual recibidos:', {
            imagesCount: currentPostData.images?.length || 0,
            postSlug: currentPostData.postSlug,
            images: currentPostData.images,
          });
          currentPostImages = (currentPostData.images || [])
            .filter((img: Image) => img.anchorId !== null)
            .map((img: Image) => ({
              ...img,
              postSlug: currentPostData.postSlug || currentPostSlug || '',
            }));
          console.log('[ReferenceSelectorModal] Imágenes del post actual procesadas:', currentPostImages.length);
        } else {
          const errorText = await currentPostResponse.text().catch(() => 'No se pudo leer el error');
          console.error('[ReferenceSelectorModal] Error en respuesta del post actual:', {
            status: currentPostResponse.status,
            statusText: currentPostResponse.statusText,
            errorText,
          });
        }
      } catch (err) {
        console.error('[ReferenceSelectorModal] Error fetching current post images:', {
          error: err,
          message: (err as any)?.message,
          stack: (err as any)?.stack,
        });
        // No lanzar error, continuar con imágenes globales
      }
    }

    try {
      console.log('[ReferenceSelectorModal] Fetching todas las imágenes: /api/images');
      const allResponse = await fetch('/api/images');
      console.log(`[ReferenceSelectorModal] Respuesta de todas las imágenes:`, {
        status: allResponse.status,
        statusText: allResponse.statusText,
        ok: allResponse.ok,
      });
      if (!allResponse.ok) {
        const errorText = await allResponse.text().catch(() => 'No se pudo leer el error');
        console.error('[ReferenceSelectorModal] Error en respuesta de todas las imágenes:', {
          status: allResponse.status,
          statusText: allResponse.statusText,
          errorText,
        });
        if (allResponse.status === 401 || allResponse.status === 403) {
          // Si no está autorizado, usar solo imágenes del post actual
          console.log('[ReferenceSelectorModal] No autorizado, usando solo imágenes del post actual');
          setImages(currentPostImages);
          return;
        }
        // Si falla, solo usar imágenes del post actual
        console.log('[ReferenceSelectorModal] Error en fetch, usando solo imágenes del post actual');
        setImages(currentPostImages);
        return;
      }

      const allData = await allResponse.json();
      console.log('[ReferenceSelectorModal] Todas las imágenes recibidas:', {
        imagesCount: allData.images?.length || 0,
        images: allData.images,
      });
      const allImages: Image[] = (allData.images || [])
        .filter((img: Image) => img.anchorId !== null);
      console.log('[ReferenceSelectorModal] Imágenes con anchorId:', allImages.length);

      const imagesMap = new Map<string, Image>();
      allImages.forEach((img) => {
        const key = `${img.postSlug}/${img.anchorId}`;
        imagesMap.set(key, img);
      });
      currentPostImages.forEach((img) => {
        const key = `${img.postSlug}/${img.anchorId}`;
        imagesMap.set(key, img);
      });

      const finalImages = Array.from(imagesMap.values());
      console.log('[ReferenceSelectorModal] Imágenes finales a mostrar:', finalImages.length);
      setImages(finalImages);
      console.log('[ReferenceSelectorModal] loadImages completado exitosamente');
    } catch (err: any) {
      console.error('[ReferenceSelectorModal] Error fetching all images:', {
        error: err,
        message: err?.message,
        stack: err?.stack,
        name: err?.name,
      });
      // Si falla, usar solo imágenes del post actual (si las hay)
      if (currentPostImages.length > 0) {
        console.log('[ReferenceSelectorModal] Usando solo imágenes del post actual debido al error');
        setImages(currentPostImages);
      } else {
        // Si no hay imágenes del post actual, mostrar error pero no limpiar
        console.error('[ReferenceSelectorModal] No hay imágenes disponibles, mostrando error');
        setError(`Error al cargar imágenes: ${err?.message || 'Error desconocido'}`);
      }
    }
  };

  const loadDefinitions = async () => {
    console.log('[ReferenceSelectorModal] loadDefinitions iniciado', { postId });
    let currentPostDefinitions: Definition[] = [];
    if (postId) {
      try {
        console.log(`[ReferenceSelectorModal] Fetching definiciones del post actual: /api/posts/${postId}/definitions`);
        const currentResponse = await fetch(`/api/posts/${postId}/definitions`);
        console.log(`[ReferenceSelectorModal] Respuesta del post actual (definiciones):`, {
          status: currentResponse.status,
          statusText: currentResponse.statusText,
          ok: currentResponse.ok,
        });
        if (currentResponse.ok) {
          const currentData = await currentResponse.json();
          console.log('[ReferenceSelectorModal] Definiciones del post actual recibidas:', {
            definitionsCount: currentData.definitions?.length || 0,
            definitions: currentData.definitions,
          });
          currentPostDefinitions = currentData.definitions || [];
        } else {
          const errorText = await currentResponse.text().catch(() => 'No se pudo leer el error');
          console.error('[ReferenceSelectorModal] Error en respuesta del post actual (definiciones):', {
            status: currentResponse.status,
            statusText: currentResponse.statusText,
            errorText,
          });
        }
      } catch (err) {
        console.error('[ReferenceSelectorModal] Error fetching current post definitions:', {
          error: err,
          message: (err as any)?.message,
          stack: (err as any)?.stack,
        });
        // No lanzar error, continuar
      }
    }

    try {
      console.log('[ReferenceSelectorModal] Fetching todas las definiciones: /api/definitions');
      const allResponse = await fetch('/api/definitions');
      console.log(`[ReferenceSelectorModal] Respuesta de todas las definiciones:`, {
        status: allResponse.status,
        statusText: allResponse.statusText,
        ok: allResponse.ok,
      });
      if (!allResponse.ok) {
        const errorData = await allResponse.json().catch(() => ({}));
        const errorText = await allResponse.text().catch(() => 'No se pudo leer el error');
        console.error('[ReferenceSelectorModal] Error en respuesta de todas las definiciones:', {
          status: allResponse.status,
          statusText: allResponse.statusText,
          error: errorData,
          errorText,
        });
        if (allResponse.status === 401 || allResponse.status === 403) {
          // Si no está autorizado, usar solo definiciones del post actual
          console.log('[ReferenceSelectorModal] No autorizado, usando solo definiciones del post actual');
          setDefinitions(currentPostDefinitions);
          return;
        }
        // Si falla, solo usar definiciones del post actual
        console.log('[ReferenceSelectorModal] Error en fetch, usando solo definiciones del post actual');
        setDefinitions(currentPostDefinitions);
        throw new Error(`Error ${allResponse.status}: ${errorData.message || allResponse.statusText}`);
      }

      const allData = await allResponse.json();
      console.log('[ReferenceSelectorModal] Todas las definiciones recibidas:', {
        definitionsCount: allData.definitions?.length || 0,
        definitions: allData.definitions,
      });
      const allDefinitions: Definition[] = allData.definitions || [];

      const definitionsMap = new Map<string, Definition>();
      allDefinitions.forEach((def) => {
        const key = `${def.postSlug}/${def.anchorId}`;
        definitionsMap.set(key, def);
      });
      currentPostDefinitions.forEach((def) => {
        const key = `${def.postSlug}/${def.anchorId}`;
        definitionsMap.set(key, def);
      });

      const finalDefinitions = Array.from(definitionsMap.values());
      console.log('[ReferenceSelectorModal] Definiciones finales a mostrar:', finalDefinitions.length);
      setDefinitions(finalDefinitions);
      console.log('[ReferenceSelectorModal] loadDefinitions completado exitosamente');
    } catch (err: any) {
      console.error('[ReferenceSelectorModal] Error fetching all definitions:', {
        error: err,
        message: err?.message,
        stack: err?.stack,
        name: err?.name,
      });
      // Si falla, usar solo definiciones del post actual
      console.log('[ReferenceSelectorModal] Usando solo definiciones del post actual debido al error');
      setDefinitions(currentPostDefinitions);
      // Re-lanzar el error para que se muestre en el modal
      throw err;
    }
  };

  const loadTheorems = async () => {
    console.log('[ReferenceSelectorModal] loadTheorems iniciado', { postId });
    let currentPostTheorems: Theorem[] = [];
    if (postId) {
      try {
        console.log(`[ReferenceSelectorModal] Fetching teoremas del post actual: /api/posts/${postId}/theorems`);
        const currentResponse = await fetch(`/api/posts/${postId}/theorems`);
        console.log(`[ReferenceSelectorModal] Respuesta del post actual (teoremas):`, {
          status: currentResponse.status,
          statusText: currentResponse.statusText,
          ok: currentResponse.ok,
        });
        if (currentResponse.ok) {
          const currentData = await currentResponse.json();
          console.log('[ReferenceSelectorModal] Teoremas del post actual recibidos:', {
            theoremsCount: currentData.theorems?.length || 0,
            theorems: currentData.theorems,
          });
          currentPostTheorems = currentData.theorems || [];
        } else {
          const errorText = await currentResponse.text().catch(() => 'No se pudo leer el error');
          console.error('[ReferenceSelectorModal] Error en respuesta del post actual (teoremas):', {
            status: currentResponse.status,
            statusText: currentResponse.statusText,
            errorText,
          });
        }
      } catch (err) {
        console.error('[ReferenceSelectorModal] Error fetching current post theorems:', {
          error: err,
          message: (err as any)?.message,
          stack: (err as any)?.stack,
        });
        // No lanzar error, continuar
      }
    }

    try {
      console.log('[ReferenceSelectorModal] Fetching todos los teoremas: /api/theorems');
      const allResponse = await fetch('/api/theorems');
      console.log(`[ReferenceSelectorModal] Respuesta de todos los teoremas:`, {
        status: allResponse.status,
        statusText: allResponse.statusText,
        ok: allResponse.ok,
      });
      if (!allResponse.ok) {
        const errorData = await allResponse.json().catch(() => ({}));
        const errorText = await allResponse.text().catch(() => 'No se pudo leer el error');
        console.error('[ReferenceSelectorModal] Error en respuesta de todos los teoremas:', {
          status: allResponse.status,
          statusText: allResponse.statusText,
          error: errorData,
          errorText,
        });
        if (allResponse.status === 401 || allResponse.status === 403) {
          // Si no está autorizado, usar solo teoremas del post actual
          console.log('[ReferenceSelectorModal] No autorizado, usando solo teoremas del post actual');
          setTheorems(currentPostTheorems);
          return;
        }
        // Si falla, solo usar teoremas del post actual
        console.log('[ReferenceSelectorModal] Error en fetch, usando solo teoremas del post actual');
        setTheorems(currentPostTheorems);
        throw new Error(`Error ${allResponse.status}: ${errorData.message || allResponse.statusText}`);
      }

      const allData = await allResponse.json();
      console.log('[ReferenceSelectorModal] Todos los teoremas recibidos:', {
        theoremsCount: allData.theorems?.length || 0,
        theorems: allData.theorems,
      });
      const allTheorems: Theorem[] = allData.theorems || [];

      const theoremsMap = new Map<string, Theorem>();
      allTheorems.forEach((thm) => {
        const key = `${thm.postSlug}/${thm.anchorId}`;
        theoremsMap.set(key, thm);
      });
      currentPostTheorems.forEach((thm) => {
        const key = `${thm.postSlug}/${thm.anchorId}`;
        theoremsMap.set(key, thm);
      });

      const finalTheorems = Array.from(theoremsMap.values());
      console.log('[ReferenceSelectorModal] Teoremas finales a mostrar:', finalTheorems.length);
      setTheorems(finalTheorems);
      console.log('[ReferenceSelectorModal] loadTheorems completado exitosamente');
    } catch (err: any) {
      console.error('[ReferenceSelectorModal] Error fetching all theorems:', {
        error: err,
        message: err?.message,
        stack: err?.stack,
        name: err?.name,
      });
      // Si falla, usar solo teoremas del post actual
      console.log('[ReferenceSelectorModal] Usando solo teoremas del post actual debido al error');
      setTheorems(currentPostTheorems);
      // Re-lanzar el error para que se muestre en el modal
      throw err;
    }
  };

  // Filtrar datos según búsqueda y filtro de post
  const filterData = <T extends { postSlug: string; anchorId: string }>(
    data: T[],
    searchFields: (item: T) => string[]
  ): T[] => {
    return data.filter((item) => {
      // Filtrar por tipo de post
      if (filterByPost === 'current' && currentPostSlug && item.postSlug !== currentPostSlug) {
        return false;
      }
      if (filterByPost === 'others' && currentPostSlug && item.postSlug === currentPostSlug) {
        return false;
      }

      // Filtrar por búsqueda
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const searchableText = searchFields(item).join(' ').toLowerCase();
        return searchableText.includes(search);
      }

      return true;
    });
  };

  const filteredEquations = filterData(equations, (eq) => [
    eq.anchorId,
    eq.description || '',
    eq.equation,
    eq.postTitle || '',
    eq.postSlug,
  ]);

  const filteredImages = filterData(images, (img) => [
    img.anchorId || '',
    img.description || '',
    img.originalName,
    img.alt || '',
    img.postSlug,
  ]);

  const filteredDefinitions = filterData(definitions, (def) => [
    def.anchorId,
    def.description || '',
    def.content,
    def.postTitle || '',
    def.postSlug,
  ]);

  const filteredTheorems = filterData(theorems, (thm) => [
    thm.anchorId,
    thm.description || '',
    thm.content,
    thm.postTitle || '',
    thm.postSlug,
  ]);

  const handleSelect = (anchorId: string, postSlug: string) => {
    console.log('[ReferenceSelectorModal] handleSelect llamado:', { activeTab, anchorId, postSlug });
    try {
      switch (activeTab) {
        case 'equations':
          console.log('[ReferenceSelectorModal] Llamando onSelectEquation');
          onSelectEquation(anchorId, postSlug);
          break;
        case 'images':
          console.log('[ReferenceSelectorModal] Llamando onSelectImage');
          onSelectImage(anchorId, postSlug);
          break;
        case 'definitions':
          console.log('[ReferenceSelectorModal] Llamando onSelectDefinition');
          onSelectDefinition(anchorId, postSlug);
          break;
        case 'theorems':
          console.log('[ReferenceSelectorModal] Llamando onSelectTheorem');
          onSelectTheorem(anchorId, postSlug);
          break;
      }
      console.log('[ReferenceSelectorModal] Cerrando modal');
      onClose();
    } catch (err) {
      console.error('[ReferenceSelectorModal] Error en handleSelect:', {
        error: err,
        message: (err as any)?.message,
        stack: (err as any)?.stack,
      });
      // No cerrar el modal si hay un error, para que el usuario pueda ver qué pasó
    }
  };

  const tabs = [
    { id: 'equations' as TabType, label: 'Ecuaciones', icon: '📐' },
    { id: 'images' as TabType, label: 'Imágenes', icon: '🖼️' },
    { id: 'definitions' as TabType, label: 'Definiciones', icon: '📖' },
    { id: 'theorems' as TabType, label: 'Teoremas', icon: '📚' },
  ];

  const renderContent = () => {
    console.log('[ReferenceSelectorModal] renderContent llamado:', { loading, error, activeTab, equationsCount: equations.length, imagesCount: images.length, definitionsCount: definitions.length, theoremsCount: theorems.length });
    
    try {
      if (loading) {
        console.log('[ReferenceSelectorModal] Mostrando estado de carga');
        return (
          <div className="text-center py-12 text-text-muted">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-star-cyan mx-auto mb-4"></div>
            Cargando...
          </div>
        );
      }

      if (error) {
        console.log('[ReferenceSelectorModal] Mostrando error:', error);
        return (
          <div className="text-center py-12">
            <div className="text-red-400 mb-2 font-semibold">Error al cargar datos</div>
            <div className="text-red-300 text-sm mb-4">{error}</div>
            <div className="text-text-muted text-xs">
              Revisa la consola del navegador (F12) y la terminal del servidor para más detalles.
            </div>
          </div>
        );
      }
      
      console.log('[ReferenceSelectorModal] Renderizando contenido para tab:', activeTab);

      console.log('[ReferenceSelectorModal] Renderizando contenido para tab:', activeTab);
      
      switch (activeTab) {
        case 'equations':
        if (filteredEquations.length === 0) {
          return (
            <div className="text-center py-12 text-text-muted">
              {searchTerm ? 'No se encontraron ecuaciones' : 'No hay ecuaciones disponibles'}
            </div>
          );
        }
        return (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredEquations.map((eq) => (
              <button
                key={`${eq.postSlug}/${eq.anchorId}`}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(eq.anchorId, eq.postSlug);
                }}
                className="w-full text-left p-4 rounded-lg border transition-all hover:border-star-cyan hover:bg-space-secondary hover:shadow-lg"
                style={{ borderColor: 'var(--border-glow)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-star-cyan">
                        {eq.anchorId}
                      </span>
                      {currentPostSlug && eq.postSlug === currentPostSlug && (
                        <span className="text-xs px-2 py-0.5 rounded bg-nebula-purple/20 text-nebula-purple border border-nebula-purple/50">
                          Este post
                        </span>
                      )}
                    </div>
                    {eq.description && (
                      <div className="text-sm text-text-secondary mb-2">
                        {eq.description}
                      </div>
                    )}
                    <div className="text-xs text-text-muted font-mono truncate mb-1">
                      {eq.equation.substring(0, 100)}
                      {eq.equation.length > 100 ? '...' : ''}
                    </div>
                    {eq.postTitle && (
                      <div className="text-xs text-text-muted">
                        Post: <span className="text-text-secondary">{eq.postTitle}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-text-muted text-xs whitespace-nowrap text-right">
                    <div>{eq.postSlug}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        );

      case 'images':
        if (filteredImages.length === 0) {
          return (
            <div className="text-center py-12 text-text-muted">
              {searchTerm ? 'No se encontraron imágenes' : 'No hay imágenes disponibles'}
            </div>
          );
        }
        return (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredImages.map((img) => {
              if (!img.anchorId) {
                console.warn('[ReferenceSelectorModal] Imagen sin anchorId:', img);
                return null;
              }
              return (
                <button
                  key={`${img.postSlug}/${img.anchorId}`}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('[ReferenceSelectorModal] Imagen seleccionada:', { anchorId: img.anchorId, postSlug: img.postSlug });
                    try {
                      if (!img.anchorId) {
                        console.error('[ReferenceSelectorModal] anchorId es null o undefined');
                        return;
                      }
                      handleSelect(img.anchorId, img.postSlug);
                    } catch (err) {
                      console.error('[ReferenceSelectorModal] Error al seleccionar imagen:', err);
                      // No propagar el error para evitar crashes
                    }
                  }}
                  className="w-full text-left p-4 rounded-lg border transition-all hover:border-star-cyan hover:bg-space-secondary hover:shadow-lg"
                  style={{ borderColor: 'var(--border-glow)' }}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={img.url}
                      alt={img.alt || img.originalName}
                      className="w-16 h-16 object-cover rounded border"
                      style={{ borderColor: 'var(--border-glow)' }}
                      onError={(e) => {
                        console.error('[ReferenceSelectorModal] Error cargando imagen:', img.url);
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%231a1a2e"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="10"%3EError%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-star-cyan">
                          {img.anchorId}
                        </span>
                        {currentPostSlug && img.postSlug === currentPostSlug && (
                          <span className="text-xs px-2 py-0.5 rounded bg-nebula-purple/20 text-nebula-purple border border-nebula-purple/50">
                            Este post
                          </span>
                        )}
                      </div>
                      {img.description && (
                        <div className="text-sm text-text-secondary mb-1">
                          {img.description}
                        </div>
                      )}
                      <div className="text-xs text-text-muted">
                        {img.originalName}
                      </div>
                      <div className="text-xs text-text-muted mt-1">
                        Post: <span className="text-text-secondary">{img.postSlug}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        );

      case 'definitions':
        console.log('[ReferenceSelectorModal] Renderizando definiciones, count:', filteredDefinitions.length);
        if (filteredDefinitions.length === 0) {
          return (
            <div className="text-center py-12 text-text-muted">
              {searchTerm ? 'No se encontraron definiciones' : 'No hay definiciones disponibles'}
            </div>
          );
        }
        try {
          // Validar datos antes de renderizar
          const validDefinitions = filteredDefinitions.filter((def, index) => {
            if (!def) {
              console.error(`[ReferenceSelectorModal] Definición ${index} es null/undefined`);
              return false;
            }
            if (!def.anchorId) {
              console.error(`[ReferenceSelectorModal] Definición ${index} sin anchorId:`, def);
              return false;
            }
            if (!def.postSlug) {
              console.error(`[ReferenceSelectorModal] Definición ${index} sin postSlug:`, def);
              return false;
            }
            if (def.content === null || def.content === undefined) {
              console.error(`[ReferenceSelectorModal] Definición ${index} sin content:`, def);
              return false;
            }
            if (typeof def.number !== 'number') {
              console.error(`[ReferenceSelectorModal] Definición ${index} sin number válido:`, def);
              return false;
            }
            return true;
          });
          
          console.log('[ReferenceSelectorModal] Definiciones válidas:', validDefinitions.length, 'de', filteredDefinitions.length);
          
          return (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {validDefinitions.map((def, index) => {
                try {
                  console.log(`[ReferenceSelectorModal] Renderizando definición ${index}:`, {
                    anchorId: def.anchorId,
                    postSlug: def.postSlug,
                    number: def.number,
                    hasContent: !!def.content,
                    contentLength: def.content?.length,
                    hasDescription: !!def.description,
                  });
                  
                  const contentPreview = (def.content || '').substring(0, 100);
                  
                  return (
                    <button
                      key={`${def.postSlug}/${def.anchorId}`}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('[ReferenceSelectorModal] Click en definición:', def.anchorId);
                        try {
                          handleSelect(def.anchorId, def.postSlug);
                        } catch (err) {
                          console.error('[ReferenceSelectorModal] Error en handleSelect:', err);
                        }
                      }}
                      className="w-full text-left p-4 rounded-lg border transition-all hover:border-star-cyan hover:bg-space-secondary hover:shadow-lg"
                      style={{ borderColor: 'var(--border-glow)' }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-star-cyan">
                              Definición {def.number}: {def.anchorId}
                            </span>
                            {currentPostSlug && def.postSlug === currentPostSlug && (
                              <span className="text-xs px-2 py-0.5 rounded bg-nebula-purple/20 text-nebula-purple border border-nebula-purple/50">
                                Este post
                              </span>
                            )}
                          </div>
                          {def.description && (
                            <div className="text-sm text-text-secondary mb-2">
                              {def.description}
                            </div>
                          )}
                          <div className="text-xs text-text-muted truncate mb-1">
                            {contentPreview}
                            {(def.content || '').length > 100 ? '...' : ''}
                          </div>
                          {def.postTitle && (
                            <div className="text-xs text-text-muted">
                              Post: <span className="text-text-secondary">{def.postTitle}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-text-muted text-xs whitespace-nowrap text-right">
                          <div>{def.postSlug}</div>
                        </div>
                      </div>
                    </button>
                  );
                } catch (err) {
                  console.error(`[ReferenceSelectorModal] Error renderizando definición ${index}:`, {
                    error: err,
                    def: def,
                    message: (err as any)?.message,
                    stack: (err as any)?.stack,
                  });
                  return null;
                }
              })}
            </div>
          );
        } catch (err) {
          console.error('[ReferenceSelectorModal] ERROR CRÍTICO renderizando definiciones:', {
            error: err,
            message: (err as any)?.message,
            stack: (err as any)?.stack,
            filteredDefinitions: filteredDefinitions,
          });
          return (
            <div className="text-center py-12 text-red-400">
              Error al renderizar definiciones. Revisa la consola.
            </div>
          );
        }

      case 'theorems':
        if (filteredTheorems.length === 0) {
          return (
            <div className="text-center py-12 text-text-muted">
              {searchTerm ? 'No se encontraron teoremas' : 'No hay teoremas disponibles'}
            </div>
          );
        }
        return (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredTheorems.map((thm) => (
              <button
                key={`${thm.postSlug}/${thm.anchorId}`}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(thm.anchorId, thm.postSlug);
                }}
                className="w-full text-left p-4 rounded-lg border transition-all hover:border-star-cyan hover:bg-space-secondary hover:shadow-lg"
                style={{ borderColor: 'var(--border-glow)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium" style={{ color: 'rgb(34, 197, 94)' }}>
                        Teorema {thm.number}: {thm.anchorId}
                      </span>
                      {currentPostSlug && thm.postSlug === currentPostSlug && (
                        <span className="text-xs px-2 py-0.5 rounded bg-nebula-purple/20 text-nebula-purple border border-nebula-purple/50">
                          Este post
                        </span>
                      )}
                    </div>
                    {thm.description && (
                      <div className="text-sm text-text-secondary mb-2">
                        {thm.description}
                      </div>
                    )}
                    <div className="text-xs text-text-muted truncate mb-1">
                      {thm.content.substring(0, 100)}
                      {thm.content.length > 100 ? '...' : ''}
                    </div>
                    {thm.postTitle && (
                      <div className="text-xs text-text-muted">
                        Post: <span className="text-text-secondary">{thm.postTitle}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-text-muted text-xs whitespace-nowrap text-right">
                    <div>{thm.postSlug}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        );
      }
    } catch (err) {
      console.error('[ReferenceSelectorModal] ERROR CRÍTICO en renderContent:', {
        error: err,
        message: (err as any)?.message,
        stack: (err as any)?.stack,
        activeTab,
        loading,
        error,
        equationsCount: equations.length,
        imagesCount: images.length,
        definitionsCount: definitions.length,
        theoremsCount: theorems.length,
      });
      // NO lanzar el error, retornar UI de error en su lugar
      return (
        <div className="text-center py-12 text-red-400">
          <div className="font-semibold mb-2">Error crítico al renderizar</div>
          <div className="text-sm mb-2">Tab: {activeTab}</div>
          <div className="text-xs">Revisa la consola para más detalles</div>
        </div>
      );
    }
  };

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('[ReferenceSelectorModal] Error capturado por ErrorBoundary:', {
          error,
          errorInfo,
        });
        setError(`Error de renderizado: ${error.message}`);
      }}
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[85vh] rounded-xl border overflow-hidden flex flex-col shadow-2xl p-6" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'var(--space-primary)' }}>
            <div className="text-red-400 mb-4">
              <h3 className="font-semibold mb-2">Error al renderizar el modal</h3>
              <p className="text-sm text-red-300">Revisa la consola para más detalles</p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border text-text-primary"
              style={{ borderColor: 'var(--border-glow)' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      }
    >
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        onMouseDown={(e) => {
          // Prevenir que el mousedown cause problemas con formularios
          e.preventDefault();
        }}
      >
        <div
          className="relative w-full max-w-4xl max-h-[85vh] rounded-xl border overflow-hidden flex flex-col shadow-2xl"
          style={{
            borderColor: 'var(--border-glow)',
            backgroundColor: 'var(--space-primary)',
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
        {/* Header con tabs */}
        <div className="border-b" style={{ borderColor: 'var(--border-glow)' }}>
          <div className="flex items-center justify-between p-4">
            <h3 className="text-xl font-semibold text-text-primary">
              Insertar Referencia
            </h3>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-t" style={{ borderColor: 'var(--border-glow)' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchTerm(''); // Limpiar búsqueda al cambiar tab
                }}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-all relative ${
                  activeTab === tab.id
                    ? 'text-star-cyan bg-space-secondary'
                    : 'text-text-muted hover:text-text-secondary hover:bg-space-secondary/50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-star-cyan"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b space-y-3" style={{ borderColor: 'var(--border-glow)' }}>
          <input
            type="text"
            placeholder={`Buscar ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border bg-space-secondary text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20"
            style={{ borderColor: 'var(--border-glow)' }}
            autoFocus
          />
          
          {/* Filtros por tipo de post */}
          {currentPostSlug && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilterByPost('all')}
                className={`px-3 py-1.5 text-xs rounded border transition-all ${
                  filterByPost === 'all'
                    ? 'bg-star-cyan/20 border-star-cyan text-star-cyan shadow-lg'
                    : 'border-transparent text-text-muted hover:text-text-secondary hover:bg-space-secondary'
                }`}
              >
                🌐 Todos
              </button>
              <button
                type="button"
                onClick={() => setFilterByPost('current')}
                className={`px-3 py-1.5 text-xs rounded border transition-all ${
                  filterByPost === 'current'
                    ? 'bg-star-cyan/20 border-star-cyan text-star-cyan shadow-lg'
                    : 'border-transparent text-text-muted hover:text-text-secondary hover:bg-space-secondary'
                }`}
              >
                📄 Este Post
              </button>
              <button
                type="button"
                onClick={() => setFilterByPost('others')}
                className={`px-3 py-1.5 text-xs rounded border transition-all ${
                  filterByPost === 'others'
                    ? 'bg-star-cyan/20 border-star-cyan text-star-cyan shadow-lg'
                    : 'border-transparent text-text-muted hover:text-text-secondary hover:bg-space-secondary'
                }`}
              >
                🔗 Otros Posts
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderContent()}
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}

