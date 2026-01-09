/**
 * Utilidades para parsear secciones expandibles en markdown
 */

export interface ExpandableSection {
  title: string;
  content: string; // Markdown completo
  fullMatch: string; // Match completo del markdown original
}

/**
 * Extrae todas las secciones expandibles del markdown
 * Sintaxis: :::expand{Título}...:::
 */
export function extractExpandableSections(content: string): ExpandableSection[] {
  const sections: ExpandableSection[] = [];
  
  // Regex para detectar: :::expand{Título}...:::
  const sectionRegex = /:::expand\{([^}]+)\}([\s\S]*?):::/g;
  
  let match;
  while ((match = sectionRegex.exec(content)) !== null) {
    const [, title, content] = match;
    
    sections.push({
      title: title.trim(),
      content: content.trim(),
      fullMatch: match[0],
    });
  }
  
  return sections;
}

/**
 * Preprocesa el markdown para convertir secciones expandibles en formato renderizable
 * Reemplaza :::expand{Título}...::: con formato especial
 */
export function preprocessExpandableSections(content: string): string {
  // Reemplazar secciones expandibles por formato especial que react-markdown reconocerá
  return content.replace(
    /:::expand\{([^}]+)\}([\s\S]*?):::/g,
    (match, title, content) => {
      // Crear un bloque de código con marcador especial que luego procesaremos
      // Usamos un formato similar a definition-anchor pero más simple
      const normalizedTitle = title.trim();
      return `\`\`\`expandable-section:${normalizedTitle}\n${content.trim()}\n\`\`\``;
    }
  );
}


