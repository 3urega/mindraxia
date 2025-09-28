import { anonCall, authCall } from '../api'
import type { AutoresResponse, AutorResponse } from '@/types/api'

// ====== LLAMADAS ANÓNIMAS (Contenido público) ======

/**
 * Obtener todos los autores publicados
 */
export const getAutores = async (): Promise<AutoresResponse> => {
  return anonCall<any>('/autores', {
    params: {
      'publicationState': 'live',
      'sort': 'nombre:asc',
      populate: {
        avatar: true,
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

/**
 * Obtener un autor específico por ID o identificador
 */
export const getAutor = async (identifier: string | number): Promise<AutorResponse> => {
  const isId = typeof identifier === 'number' || !isNaN(Number(identifier))
  
  if (isId) {
    // Buscar por ID
    return anonCall<any>(`/autores/${identifier}`, {
      params: {
        'publicationState': 'live',
        populate: {
          avatar: true,
          articulos: {
            populate: {
              categoria: true,
              imagenDestacada: true
            },
            sort: 'fechaPublicacion:desc',
            filters: {
              publishedAt: {
                $notNull: true
              }
            }
          }
        }
      }
    })
  } else {
    // Buscar por nombre
    return anonCall<any>('/autores', {
      params: {
        'filters[nombre][$containsi]': identifier,
        'publicationState': 'live',
        populate: {
          avatar: true,
          articulos: {
            populate: {
              categoria: true,
              imagenDestacada: true
            },
            sort: 'fechaPublicacion:desc',
            filters: {
              publishedAt: {
                $notNull: true
              }
            }
          }
        }
      }
    }).then(response => ({
      ...response,
      data: response.data[0]
    }))
  }
}

/**
 * Obtener autores más activos (con más artículos)
 */
export const getAutoresActivos = async (limit: number = 5): Promise<AutoresResponse> => {
  return anonCall<any>('/autores', {
    params: {
      'publicationState': 'live',
      'pagination[limit]': limit,
      populate: {
        avatar: true,
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

/**
 * Buscar autores por nombre
 */
export const buscarAutores = async (query: string): Promise<AutoresResponse> => {
  return anonCall<any>('/autores', {
    params: {
      'filters[nombre][$containsi]': query,
      'publicationState': 'live',
      populate: {
        avatar: true,
        articulos: {
          count: true
        }
      }
    }
  })
}

// ====== LLAMADAS AUTENTICADAS (Requieren API key) ======

/**
 * Crear nuevo autor (requiere autenticación)
 */
export const crearAutor = async (data: {
  nombre: string
  biografia?: string
  email?: string
  twitter?: string
  linkedin?: string
}) => {
  return authCall<any>('/autores', {
    method: 'POST',
    data: { data }
  })
}

/**
 * Actualizar autor (requiere autenticación)
 */
export const actualizarAutor = async (id: number, data: {
  nombre?: string
  biografia?: string
  email?: string
  twitter?: string
  linkedin?: string
}) => {
  return authCall<any>(`/autores/${id}`, {
    method: 'PUT',
    data: { data }
  })
}

/**
 * Subir avatar del autor (requiere autenticación)
 */
export const subirAvatarAutor = async (autorId: number, file: File) => {
  const formData = new FormData()
  formData.append('files', file)
  formData.append('ref', 'api::autor.autor')
  formData.append('refId', autorId.toString())
  formData.append('field', 'avatar')

  return authCall<any>('/upload', {
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * Eliminar autor (requiere autenticación)
 */
export const eliminarAutor = async (id: number): Promise<void> => {
  await authCall<any>(`/autores/${id}`, {
    method: 'DELETE'
  })
} 