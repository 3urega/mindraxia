// Tipos para la integración de IA con Mindraxia

export interface ArticleEmbedding {
  id: string
  title: string
  content: string
  embedding: number[]
  metadata: {
    author: string
    category: string
    tags: string[]
    publishedAt: string
  }
}

export interface SearchQuery {
  query: string
  limit?: number
  threshold?: number
}

export interface SearchResult {
  article: {
    id: string
    title: string
    summary: string
    similarity: number
  }
  metadata: Record<string, any>
}

// Placeholder para futuros tipos de agentes IA
export interface AIAgent {
  name: string
  description: string
  execute: (query: string) => Promise<string>
} 