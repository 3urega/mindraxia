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
  const anchorRegex = /\$\$\{#eq:([a-z0-9-]+)(?:\|descripción:\s*([^}]+))?\}([\s\S]*?)\$\$/g;
  
  let match;
  while ((match = anchorRegex.exec(content)) !== null) {
    const [, anchorId, description, equation] = match;
    
    anchors.push({
      anchorId: anchorId.trim(),
      description: description?.trim(),
      equation: equation.trim(),
      fullMatch: match[0],
    });
  }
  
  return anchors;
}

/**
 * Extrae todas las referencias a ecuaciones del markdown
 * Sintaxis: {{eq:post-slug/anchor-id|texto}} o {{eq:anchor-id|texto}}
 */
export function extractReferences(content: string): EquationReference[] {
  const references: EquationReference[] = [];
  
  // Regex para detectar: {{eq:slug/anchor|texto}} o {{eq:anchor|texto}}
  const referenceRegex = /\{\{eq:([^}|]+)\|([^}]+)\}\}/g;
  
  let match;
  while ((match = referenceRegex.exec(content)) !== null) {
    const [, path, linkText] = match;
    const parts = path.split('/');
    
    if (parts.length === 2) {
      // Referencia a otro post: {{eq:post-slug/anchor-id|texto}}
      references.push({
        postSlug: parts[0].trim(),
        anchorId: parts[1].trim(),
        linkText: linkText.trim(),
        fullMatch: match[0],
      });
    } else {
      // Referencia al mismo post: {{eq:anchor-id|texto}}
      references.push({
        anchorId: path.trim(),
        linkText: linkText.trim(),
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
  return content.replace(
    /\$\$\{#eq:([a-z0-9-]+)(?:\|descripción:[^}]+)\}([\s\S]*?)\$\$/g,
    (match, anchorId, equation) => {
      // Crear un bloque de código con marcador especial que luego procesaremos
      return `\`\`\`math-anchor:${anchorId}\n${equation.trim()}\n\`\`\``;
    }
  ).replace(
    /\$\$\{#eq:([a-z0-9-]+)\}([\s\S]*?)\$\$/g,
    (match, anchorId, equation) => {
      // Sin descripción
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

