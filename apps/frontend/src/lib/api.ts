import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

// Configuración base de la API
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
const API_BASE_URL = `${STRAPI_URL}/api`

// API Key para llamadas autenticadas (desde variables de entorno)
const API_KEY = process.env.NEXT_PUBLIC_STRAPI_API_KEY

// Cliente para llamadas anónimas (contenido público)
export const anonApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Cliente para llamadas autenticadas (operaciones que requieren permisos)
export const authApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` }),
  },
  timeout: 10000,
})

// Interceptor para manejo de errores global
const errorInterceptor = (error: any) => {
  if (error.response) {
    // Error de respuesta del servidor
    console.error('API Error:', {
      status: error.response.status,
      data: error.response.data,
      url: error.config?.url,
    })
  } else if (error.request) {
    // Error de red
    console.error('Network Error:', error.message)
  } else {
    // Error de configuración
    console.error('Request Error:', error.message)
  }
  return Promise.reject(error)
}

// Aplicar interceptor a ambos clientes
anonApiClient.interceptors.response.use(
  (response) => response,
  errorInterceptor
)

authApiClient.interceptors.response.use(
  (response) => response,
  errorInterceptor
)

// Tipos para las respuestas de Strapi
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

// Función helper para hacer llamadas con populate automático
export const makeApiCall = async <T>(
  client: AxiosInstance,
  endpoint: string,
  config: AxiosRequestConfig = {}
): Promise<StrapiResponse<T>> => {
  try {
    const response = await client.get(endpoint, {
      ...config,
    })
    return response.data
  } catch (error) {
    throw error
  }
}

// Función para llamadas anónimas (contenido público)
export const anonCall = async <T>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<StrapiResponse<T>> => {
  return makeApiCall<T>(anonApiClient, endpoint, config)
}

// Función para llamadas autenticadas
export const authCall = async <T>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<StrapiResponse<T>> => {
  if (!API_KEY) {
    console.warn('API Key not configured for authenticated call')
  }
  return makeApiCall<T>(authApiClient, endpoint, config)
}

// Función para POST autenticado
export const authPost = async <T>(
  endpoint: string,
  data: any,
  config?: AxiosRequestConfig
): Promise<StrapiResponse<T>> => {
  if (!API_KEY) {
    throw new Error('API Key required for authenticated POST requests')
  }
  
  try {
    const response = await authApiClient.post(endpoint, data, config)
    return response.data
  } catch (error) {
    throw error
  }
}

// Función para PUT autenticado
export const authPut = async <T>(
  endpoint: string,
  data: any,
  config?: AxiosRequestConfig
): Promise<StrapiResponse<T>> => {
  if (!API_KEY) {
    throw new Error('API Key required for authenticated PUT requests')
  }
  
  try {
    const response = await authApiClient.put(endpoint, data, config)
    return response.data
  } catch (error) {
    throw error
  }
}

// Función para DELETE autenticado
export const authDelete = async <T>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<void> => {
  if (!API_KEY) {
    throw new Error('API Key required for authenticated DELETE requests')
  }
  
  try {
    await authApiClient.delete(endpoint, config)
  } catch (error) {
    throw error
  }
} 