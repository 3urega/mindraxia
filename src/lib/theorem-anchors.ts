/**
 * Utilidades para parsear anclas y referencias de teoremas en markdown
 */

export interface TheoremAnchor {
  anchorId: string;
  description?: string;
  content: string; // Markdown completo
  fullMatch: string; // Match completo del markdown original
}

export interface TheoremReference {
  postSlug?: string; // Si no existe, es referencia al mismo post
  anchorId: string;
  linkText: string;
  fullMatch: string;
}

/**
 * Extrae todas las anclas de teoremas del markdown
 * Sintaxis: :::theorem{#thm:anchor-id|descripción: texto}...:::
 */
export function extractTheoremAnchors(content: string): TheoremAnchor[] {
  const anchors: TheoremAnchor[] = [];
  
  // Regex para detectar: :::theorem{#thm:id|descripción: texto}...:::
  // También soporta: :::theorem{#thm:id}...::: (sin descripción)
  // Acepta IDs con espacios, mayúsculas, etc. (se normalizarán después)
  const anchorRegex = /:::theorem\{#thm:([^}|]+)(?:\|descripción:\s*([^}]+))?\}([\s\S]*?):::/g;
  
  let match;
  while ((match = anchorRegex.exec(content)) !== null) {
    const [, anchorId, description, content] = match;
    
    // Normalizar el anchorId: convertir a minúsculas y reemplazar espacios con guiones
    const normalizedAnchorId = anchorId.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    anchors.push({
      anchorId: normalizedAnchorId,
      description: description?.trim(),
      content: content.trim(),
      fullMatch: match[0],
    });
  }
  
  return anchors;
}

/**
 * Extrae todas las referencias a teoremas del markdown
 * Sintaxis: {{thm:post-slug/anchor-id|texto}} o {{thm:anchor-id|texto}}
 */
export function extractTheoremReferences(content: string): TheoremReference[] {
  const references: TheoremReference[] = [];
  
  // Regex para detectar: {{thm:slug/anchor|texto}} o {{thm:anchor|texto}}
  const referenceRegex = /\{\{thm:([^}|]+)\|([^}]+)\}\}/g;
  
  let match;
  while ((match = referenceRegex.exec(content)) !== null) {
    const [, path, linkText] = match;
    const parts = path.split('/');
    
    if (parts.length === 2) {
      // Referencia a otro post: {{thm:post-slug/anchor-id|texto}}
      references.push({
        postSlug: parts[0].trim(),
        anchorId: parts[1].trim(),
        linkText: linkText.trim(),
        fullMatch: match[0],
      });
    } else {
      // Referencia al mismo post: {{thm:anchor-id|texto}}
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
 * Preprocesa el markdown para convertir teoremas con anclas en formato renderizable
 * Reemplaza :::theorem{#thm:id|desc}...::: con formato especial
 */
export function preprocessTheoremAnchors(content: string): string {
  // Reemplazar teoremas con anclas por formato especial que react-markdown reconocerá
  // Acepta IDs con espacios y mayúsculas, los normaliza
  return content.replace(
    /:::theorem\{#thm:([^}|]+)(?:\|descripción:[^}]+)\}([\s\S]*?):::/g,
    (match, anchorId, content) => {
      // Normalizar el anchorId
      const normalizedAnchorId = anchorId.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      // Crear un bloque de código con marcador especial que luego procesaremos
      return `\`\`\`theorem-anchor:${normalizedAnchorId}\n${content.trim()}\n\`\`\``;
    }
  ).replace(
    /:::theorem\{#thm:([^}|]+)\}([\s\S]*?):::/g,
    (match, anchorId, content) => {
      // Normalizar el anchorId
      const normalizedAnchorId = anchorId.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      // Sin descripción
      return `\`\`\`theorem-anchor:${normalizedAnchorId}\n${content.trim()}\n\`\`\``;
    }
  );
}

/**
 * Genera el ID HTML para un anchor de teorema
 */
export function getTheoremHtmlId(anchorId: string): string {
  return `thm-${anchorId}`;
}

/**
 * Genera la URL para una referencia a un teorema
 */
export function getTheoremReferenceUrl(
  anchorId: string,
  postSlug?: string,
  currentSlug?: string
): string {
  const slug = postSlug || currentSlug;
  if (!slug) {
    return '#';
  }
  return `/blog/${slug}#${getTheoremHtmlId(anchorId)}`;
}

