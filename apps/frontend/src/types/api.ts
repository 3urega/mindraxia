// Tipos para los modelos de contenido de Mindraxia

export interface Categoria {
  name: string
  description: string
  slug: string
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface Autor {
  name: string
  bio?: string
  email?: string
  twitter?: string
  linkedin?: string
  avatar?: {
    data: {
      id: number
      attributes: {
        name: string
        url: string
        alternativeText?: string
      }
    }
  }
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface Articulo {
  title: string
  summary: string
  content: string
  slug: string
  publishedAt?: string
  readingTime?: number
  tags?: string
  author?: {
    data: {
      id: number
      attributes: Autor
    }
  }
  category?: {
    data: {
      id: number
      attributes: Categoria
    }
  }
  featuredImage?: {
    data: {
      id: number
      attributes: {
        name: string
        url: string
        alternativeText?: string
      }
    }
  }
  createdAt: string
  updatedAt: string
  publishedAt: string
}

// Tipos para respuestas de la API
export interface StrapiResponse<T> {
  data: T
  meta: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export interface StrapiEntity<T> {
  id: number
  attributes: T
}

// Tipos para arrays de entidades
export type CategoriaEntity = StrapiEntity<Categoria>
export type AutorEntity = StrapiEntity<Autor>
export type ArticuloEntity = StrapiEntity<Articulo>

// Tipos para respuestas específicas
export type CategoriasResponse = StrapiResponse<CategoriaEntity[]>
export type AutoresResponse = StrapiResponse<AutorEntity[]>
export type ArticulosResponse = StrapiResponse<ArticuloEntity[]>

export type CategoriaResponse = StrapiResponse<CategoriaEntity>
export type AutorResponse = StrapiResponse<AutorEntity>
export type ArticuloResponse = StrapiResponse<ArticuloEntity> 