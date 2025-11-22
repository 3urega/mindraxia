import { generateSlug } from './utils';

/**
 * Genera un slug único para una categoría
 */
export function generateCategorySlug(name: string): string {
  return generateSlug(name);
}

/**
 * Genera un slug único para una subcategoría
 */
export function generateSubcategorySlug(name: string): string {
  return generateSlug(name);
}

