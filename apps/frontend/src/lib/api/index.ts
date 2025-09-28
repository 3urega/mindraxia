// Exportar funciones por entidad para una mejor organización
export * as articulosApi from './articulos.calls'
export * as categoriasApi from './categorias.calls'  
export * as autoresApi from './autores.calls'

// También exportar funciones individuales para facilidad de uso
export {
  // Artículos
  getArticulos,
  getArticulo,
  getArticulosDestacados,
  getArticulosRelacionados,
  buscarArticulos,
  getArticulosRecientes,
  getArticulosPorCategoria,
  getArticulosPorAutor,
  crearArticulo,
  actualizarArticulo,
  eliminarArticulo,
  subirImagenArticulo,
} from './articulos.calls'

export {
  // Categorías
  getCategorias,
  getCategoria,
  getCategoriasConConteo,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from './categorias.calls'

export {
  // Autores
  getAutores,
  getAutor,
  getAutoresActivos,
  buscarAutores,
  crearAutor,
  actualizarAutor,
  subirAvatarAutor,
  eliminarAutor,
} from './autores.calls'

// Re-exportar configuración base de la API
export { anonCall, authCall } from '../api' 