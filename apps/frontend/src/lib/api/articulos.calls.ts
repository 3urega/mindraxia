import { anonCall, authCall } from '../api'
import type { ArticulosResponse, ArticuloResponse } from '@/types/api'

// ====== LLAMADAS ANÓNIMAS (Contenido público) ======

/**
 * Obtener todos los artículos publicados con filtros opcionales
 */
export const getArticulos = async (params?: {
  page?: number
  pageSize?: number
  categoria?: string
  autor?: string
  limit?: number
}): Promise<ArticulosResponse> => {
  const queryParams: Record<string, any> = {
    'publicationState': 'live',
    'sort': 'fechaPublicacion:desc',
  }

  if (params?.page) queryParams.page = params.page
  if (params?.pageSize) queryParams.pageSize = params.pageSize
  if (params?.limit) queryParams['pagination[limit]'] = params.limit
  
  // Filtrar por categoría
  if (params?.categoria) {
    queryParams['filters[categoria][slug][$eq]'] = params.categoria
  }
  
  // Filtrar por autor
  if (params?.autor) {
    queryParams['filters[autor][nombre][$containsi]'] = params.autor
  }

  return anonCall<any>('/articulos', {
    params: {
      ...queryParams,
      populate: {
        autor: {
          populate: ['avatar']
        },
        categoria: true,
        imagenDestacada: true
      }
    }
  })
}

/**
 * Obtener un artículo específico por slug
 */
export const getArticulo = async (slug: string): Promise<ArticuloResponse> => {
  return anonCall<any>('/articulos', {
    params: {
      'filters[slug][$eq]': slug,
      'publicationState': 'live',
      populate: {
        autor: {
          populate: ['avatar']
        },
        categoria: true,
        imagenDestacada: true
      }
    }
  }).then(response => ({
    ...response,
    data: response.data[0] // Strapi devuelve array, pero queremos el primer elemento
  }))
}

/**
 * Obtener artículos destacados para la página principal
 */
export const getArticulosDestacados = async (limit: number = 6): Promise<ArticulosResponse> => {
  return anonCall<any>('/articulos', {
    params: {
      'publicationState': 'live',
      'pagination[limit]': limit,
      'sort': 'fechaPublicacion:desc',
      populate: {
        autor: {
          populate: ['avatar']
        },
        categoria: true,
        imagenDestacada: true
      }
    }
  })
}

/**
 * Obtener artículos relacionados (misma categoría, excluyendo el actual)
 */
export const getArticulosRelacionados = async (
  categoriaId: number,
  articuloActualId: number,
  limit: number = 3
): Promise<ArticulosResponse> => {
  return anonCall<any>('/articulos', {
    params: {
      'filters[categoria][id][$eq]': categoriaId,
      'filters[id][$ne]': articuloActualId,
      'publicationState': 'live',
      'pagination[limit]': limit,
      'sort': 'fechaPublicacion:desc',
      populate: {
        autor: {
          populate: ['avatar']
        },
        categoria: true,
        imagenDestacada: true
      }
    }
  })
}

/**
 * Buscar artículos por texto en título, resumen o contenido
 */
export const buscarArticulos = async (
  query: string,
  limit: number = 10
): Promise<ArticulosResponse> => {
  return anonCall<any>('/articulos', {
    params: {
      'filters[$or][0][titulo][$containsi]': query,
      'filters[$or][1][resumen][$containsi]': query,
      'filters[$or][2][contenido][$containsi]': query,
      'publicationState': 'live',
      'pagination[limit]': limit,
      'sort': 'fechaPublicacion:desc',
      populate: {
        autor: {
          populate: ['avatar']
        },
        categoria: true,
        imagenDestacada: true
      }
    }
  })
}

/**
 * Obtener artículos recientes (últimos N artículos)
 */
export const getArticulosRecientes = async (limit: number = 5): Promise<ArticulosResponse> => {
  return anonCall<any>('/articulos', {
    params: {
      'publicationState': 'live',
      'pagination[limit]': limit,
      'sort': 'createdAt:desc',
      populate: {
        autor: true,
        categoria: true,
        imagenDestacada: true
      }
    }
  })
}

/**
 * Obtener artículos por categoría específica
 */
export const getArticulosPorCategoria = async (
  categoriaSlug: string,
  page: number = 1,
  pageSize: number = 10
): Promise<ArticulosResponse> => {
  return anonCall<any>('/articulos', {
    params: {
      'filters[categoria][slug][$eq]': categoriaSlug,
      'publicationState': 'live',
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'sort': 'fechaPublicacion:desc',
      populate: {
        autor: {
          populate: ['avatar']
        },
        categoria: true,
        imagenDestacada: true
      }
    }
  })
}

/**
 * Obtener artículos por autor específico
 */
export const getArticulosPorAutor = async (
  autorId: number,
  page: number = 1,
  pageSize: number = 10
): Promise<ArticulosResponse> => {
  return anonCall<any>('/articulos', {
    params: {
      'filters[autor][id][$eq]': autorId,
      'publicationState': 'live',
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'sort': 'fechaPublicacion:desc',
      populate: {
        autor: {
          populate: ['avatar']
        },
        categoria: true,
        imagenDestacada: true
      }
    }
  })
}

// ====== LLAMADAS AUTENTICADAS (Requieren API key) ======

/**
 * Crear nuevo artículo (requiere autenticación)
 */
export const crearArticulo = async (data: {
  titulo: string
  resumen: string
  contenido: string
  slug?: string
  fechaPublicacion?: string
  tiempoLectura?: number
  etiquetas?: string[]
  autor?: number
  categoria?: number
}) => {
  // Usar authPost cuando esté disponible
  return authCall<any>('/articulos', {
    // method: 'POST', // Temporal hasta arreglar la API
    // data: { data }
  })
}

/**
 * Actualizar artículo existente (requiere autenticación)
 */
export const actualizarArticulo = async (id: number, data: {
  titulo?: string
  resumen?: string
  contenido?: string
  slug?: string
  fechaPublicacion?: string
  tiempoLectura?: number
  etiquetas?: string[]
  autor?: number
  categoria?: number
}) => {
  return authCall<any>(`/articulos/${id}`, {
    // method: 'PUT', // Temporal hasta arreglar la API
    // data: { data }
  })
}

/**
 * Eliminar artículo (requiere autenticación)
 */
export const eliminarArticulo = async (id: number): Promise<void> => {
  await authCall<any>(`/articulos/${id}`, {
    // method: 'DELETE' // Temporal hasta arreglar la API
  })
}

/**
 * Subir imagen destacada para artículo (requiere autenticación)
 */
export const subirImagenArticulo = async (articuloId: number, file: File) => {
  const formData = new FormData()
  formData.append('files', file)
  formData.append('ref', 'api::articulo.articulo')
  formData.append('refId', articuloId.toString())
  formData.append('field', 'imagenDestacada')

  return authCall<any>('/upload', {
    // method: 'POST', // Temporal hasta arreglar la API
    // data: formData,
    // headers: { 'Content-Type': 'multipart/form-data' }
  })
} 