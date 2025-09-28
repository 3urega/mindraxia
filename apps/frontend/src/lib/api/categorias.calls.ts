import { anonCall, authCall } from '../api'
import type { CategoriasResponse, CategoriaResponse } from '@/types/api'

// ====== LLAMADAS ANÓNIMAS (Contenido público) ======

/**
 * Obtener todas las categorías publicadas
 */
export const getCategorias = async (): Promise<CategoriasResponse> => {
  return anonCall<any>('/categorias', {
    params: {
      'sort': 'nombre:asc',
      'populate': '*'
    }
  })
}

/**
 * Obtener una categoría específica por slug
 */
export const getCategoria = async (slug: string): Promise<CategoriaResponse> => {
  return anonCall<any>('/categorias', {
    params: {
      'filters[slug][$eq]': slug,
      'publicationState': 'live',
      populate: {
        articulos: {
          populate: {
            autor: {
              populate: ['avatar']
            },
            imagenDestacada: true
          },
          sort: 'fechaPublicacion:desc'
        }
      }
    }
  }).then(response => ({
    ...response,
    data: response.data[0]
  }))
}

/**
 * Obtener categorías con conteo de artículos para estadísticas
 */
export const getCategoriasConConteo = async (): Promise<CategoriasResponse> => {
  return anonCall<any>('/categorias', {
    params: {
      'publicationState': 'live',
      'sort': 'nombre:asc',
      populate: {
        articulos: {
          count: true,
          filters: {
            publishedAt: {
              $notNull: true
            }
          }
        }
      }
    }
  })
}

// ====== LLAMADAS AUTENTICADAS (Requieren API key) ======

/**
 * Crear nueva categoría (requiere autenticación)
 */
export const crearCategoria = async (data: {
  nombre: string
  descripcion?: string
  slug?: string
}) => {
  return authCall<any>('/categorias', {
    method: 'POST',
    data: { data }
  })
}

/**
 * Actualizar categoría (requiere autenticación)
 */
export const actualizarCategoria = async (id: number, data: {
  nombre?: string
  descripcion?: string
  slug?: string
}) => {
  return authCall<any>(`/categorias/${id}`, {
    method: 'PUT',
    data: { data }
  })
}

/**
 * Eliminar categoría (requiere autenticación)
 */
export const eliminarCategoria = async (id: number): Promise<void> => {
  await authCall<any>(`/categorias/${id}`, {
    method: 'DELETE'
  })
} 