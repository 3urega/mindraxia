/**
 * Utilidades para parsear secciones y subsecciones en markdown
 */

export interface Section {
  id: string;
  title: string;
  level: 'section' | 'subsection';
  index: number;
  parentIndex?: number; // Para subsecciones, índice de la sección padre
  fullMatch: string; // Match completo del markdown original
}

/**
 * Genera un ID único para una sección basado en el índice y el título
 */
export function generateSectionId(title: string, index: number, level: 'section' | 'subsection'): string {
  // Normalizar título: convertir a minúsculas, reemplazar espacios con guiones, eliminar caracteres especiales
  const normalizedTitle = title
    .trim()
    .toLowerCase()
    .normalize('NFD') // Normalizar para eliminar acentos
    .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  const prefix = level === 'section' ? 'section' : 'subsection';
  return `${prefix}-${index}-${normalizedTitle}`;
}

/**
 * Extrae todas las secciones y subsecciones del markdown
 * Sintaxis: [[section:Nombre]] o [[subsection:Nombre]]
 */
export function extractSections(content: string): Section[] {
  const sections: Section[] = [];
  let sectionIndex = 0;
  let subsectionIndex = 0;
  let currentSectionIndex = -1;
  
  // Regex para detectar: [[section:nombre]] o [[subsection:nombre]]
  const sectionRegex = /\[\[(section|subsection):([^\]]+)\]\]/g;
  
  let match;
  while ((match = sectionRegex.exec(content)) !== null) {
    const [, level, title] = match;
    const trimmedTitle = title.trim();
    
    if (level === 'section') {
      sectionIndex++;
      currentSectionIndex = sectionIndex;
      subsectionIndex = 0; // Resetear contador de subsecciones
      
      sections.push({
        id: generateSectionId(trimmedTitle, sectionIndex, 'section'),
        title: trimmedTitle,
        level: 'section',
        index: sectionIndex,
        fullMatch: match[0],
      });
    } else if (level === 'subsection') {
      subsectionIndex++;
      
      sections.push({
        id: generateSectionId(trimmedTitle, subsectionIndex, 'subsection'),
        title: trimmedTitle,
        level: 'subsection',
        index: subsectionIndex,
        parentIndex: currentSectionIndex > 0 ? currentSectionIndex : undefined,
        fullMatch: match[0],
      });
    }
  }
  
  return sections;
}

/**
 * Preprocesa el markdown para convertir secciones en encabezados
 * Reemplaza [[section:nombre]] con ## nombre
 * Reemplaza [[subsection:nombre]] con ### nombre
 * Los IDs se asignarán en el componente usando el mapa de secciones
 */
export function preprocessSections(content: string): string {
  // Simplemente reemplazar la sintaxis especial con encabezados markdown normales
  return content.replace(
    /\[\[section:([^\]]+)\]\]/g,
    '## $1'
  ).replace(
    /\[\[subsection:([^\]]+)\]\]/g,
    '### $1'
  );
}

/**
 * Genera el ID HTML para una sección
 */
export function getSectionHtmlId(sectionId: string): string {
  return sectionId; // Ya incluye el prefijo section- o subsection-
}

