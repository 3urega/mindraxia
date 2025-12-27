/**
 * Utilidades para parsear anclas y referencias de ecuaciones en markdown
 */

export interface EquationAnchor {
  anchorId: string;
  description?: string;
  equation: string; // LaTeX completo incluyendo $$
  fullMatch: string; // Match completo del markdown original
}

export interface EquationReference {
  postSlug?: string; // Si no existe, es referencia al mismo post
  anchorId: string;
  linkText: string;
  embed?: boolean; // Si es true, mostrar contenido completo en lugar de solo enlace
  fullMatch: string;
}

/**
 * Extrae todas las anclas de ecuaciones del markdown
 * Sintaxis: $${#eq:anchor-id|descripción: texto}...$$
 */
export function extractAnchors(content: string): EquationAnchor[] {
  const anchors: EquationAnchor[] = [];
  
  // Regex para detectar: $${#eq:id|descripción: texto}...$$
  // También soporta: $${#eq:id}...$$ (sin descripción)
  // El ID ahora puede contener espacios y otros caracteres, que se normalizarán
  const anchorRegex = /\$\$\{#eq:([^}|]+)(?:\|descripción:\s*([^}]+))?\}([\s\S]*?)\$\$/g;
  
  let match;
  while ((match = anchorRegex.exec(content)) !== null) {
    const [, rawAnchorId, description, equation] = match;
    // Normalizar ID: convertir a minúsculas, reemplazar espacios con guiones, eliminar caracteres especiales
    const anchorId = rawAnchorId.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    anchors.push({
      anchorId: anchorId,
      description: description?.trim(),
      equation: equation.trim(),
      fullMatch: match[0],
    });
  }
  
  return anchors;
}

/**
 * Extrae todas las referencias a ecuaciones del markdown
 * Sintaxis: {{eq:post-slug/anchor-id|texto|embed}} o {{eq:anchor-id|texto}}
 */
export function extractReferences(content: string): EquationReference[] {
  const references: EquationReference[] = [];
  
  // Regex para detectar: {{eq:slug/anchor|texto|embed}} o {{eq:anchor|texto}}
  // El tercer parámetro es opcional y puede ser "embed" o cualquier otro flag
  const referenceRegex = /\{\{eq:([^}|]+)\|([^}|]+)(?:\|([^}]+))?\}\}/g;
  
  let match;
  while ((match = referenceRegex.exec(content)) !== null) {
    const [, path, linkText, flag] = match;
    const parts = path.split('/');
    const embed = flag?.trim().toLowerCase() === 'embed';
    
    if (parts.length === 2) {
      // Referencia a otro post: {{eq:post-slug/anchor-id|texto|embed}}
      references.push({
        postSlug: parts[0].trim(),
        anchorId: parts[1].trim(),
        linkText: linkText.trim(),
        embed: embed,
        fullMatch: match[0],
      });
    } else {
      // Referencia al mismo post: {{eq:anchor-id|texto|embed}}
      references.push({
        anchorId: path.trim(),
        linkText: linkText.trim(),
        embed: embed,
        fullMatch: match[0],
      });
    }
  }
  
  return references;
}

/**
 * Preprocesa el markdown para convertir ecuaciones con anclas en formato renderizable
 * Reemplaza $${#eq:id|desc}...$$ con formato especial que mantiene el código pero marca la ancla
 */
export function preprocessAnchors(content: string): string {
  // Reemplazar ecuaciones con anclas por formato especial que react-markdown reconocerá como código
  // Mantenemos el formato de código pero añadimos un marcador especial
  // El ID puede contener espacios y otros caracteres, que se normalizarán
  return content.replace(
    /\$\$\{#eq:([^}|]+)(?:\|descripción:[^}]+)\}([\s\S]*?)\$\$/g,
    (match, rawAnchorId, equation) => {
      // Normalizar ID igual que en extractAnchors
      const anchorId = rawAnchorId.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      // Crear un bloque de código con marcador especial que luego procesaremos
      return `\`\`\`math-anchor:${anchorId}\n${equation.trim()}\n\`\`\``;
    }
  ).replace(
    /\$\$\{#eq:([^}|]+)\}([\s\S]*?)\$\$/g,
    (match, rawAnchorId, equation) => {
      // Sin descripción
      // Normalizar ID igual que en extractAnchors
      const anchorId = rawAnchorId.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return `\`\`\`math-anchor:${anchorId}\n${equation.trim()}\n\`\`\``;
    }
  );
}

/**
 * Preprocesa el markdown para convertir referencias en placeholders
 * que luego serán reemplazados por componentes React
 */
export function preprocessReferences(content: string): string {
  // Las referencias se procesarán en el componente, aquí solo las marcamos
  return content;
}

/**
 * Genera el ID HTML para un anchor
 */
export function getAnchorHtmlId(anchorId: string): string {
  return `eq-${anchorId}`;
}

/**
 * Genera la URL para una referencia a una ecuación
 */
export function getEquationReferenceUrl(
  anchorId: string,
  postSlug?: string,
  currentSlug?: string
): string {
  const slug = postSlug || currentSlug;
  if (!slug) {
    return '#';
  }
  return `/blog/${slug}#${getAnchorHtmlId(anchorId)}`;
}

