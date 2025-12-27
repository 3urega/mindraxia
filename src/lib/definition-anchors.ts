/**
 * Utilidades para parsear anclas y referencias de definiciones en markdown
 */

export interface DefinitionAnchor {
  anchorId: string;
  description?: string;
  content: string; // Markdown completo
  fullMatch: string; // Match completo del markdown original
}

export interface DefinitionReference {
  postSlug?: string; // Si no existe, es referencia al mismo post
  anchorId: string;
  linkText: string;
  embed?: boolean; // Si es true, mostrar contenido completo en lugar de solo enlace
  fullMatch: string;
}

/**
 * Extrae todas las anclas de definiciones del markdown
 * Sintaxis: :::definition{#def:anchor-id|descripción: texto}...:::
 */
export function extractDefinitionAnchors(content: string): DefinitionAnchor[] {
  const anchors: DefinitionAnchor[] = [];
  
  // Regex para detectar: :::definition{#def:id|descripción: texto}...:::
  // También soporta: :::definition{#def:id}...::: (sin descripción)
  // Acepta IDs con espacios, mayúsculas, etc. (se normalizarán después)
  const anchorRegex = /:::definition\{#def:([^}|]+)(?:\|descripción:\s*([^}]+))?\}([\s\S]*?):::/g;
  
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
 * Extrae todas las referencias a definiciones del markdown
 * Sintaxis: {{def:post-slug/anchor-id|texto|embed}} o {{def:anchor-id|texto}}
 */
export function extractDefinitionReferences(content: string): DefinitionReference[] {
  const references: DefinitionReference[] = [];
  
  // Regex para detectar: {{def:slug/anchor|texto|embed}} o {{def:anchor|texto}}
  const referenceRegex = /\{\{def:([^}|]+)\|([^}|]+)(?:\|([^}]+))?\}\}/g;
  
  let match;
  while ((match = referenceRegex.exec(content)) !== null) {
    const [, path, linkText, flag] = match;
    const parts = path.split('/');
    const embed = flag?.trim().toLowerCase() === 'embed';
    
    if (parts.length === 2) {
      // Referencia a otro post: {{def:post-slug/anchor-id|texto|embed}}
      references.push({
        postSlug: parts[0].trim(),
        anchorId: parts[1].trim(),
        linkText: linkText.trim(),
        embed: embed,
        fullMatch: match[0],
      });
    } else {
      // Referencia al mismo post: {{def:anchor-id|texto|embed}}
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
 * Preprocesa el markdown para convertir definiciones con anclas en formato renderizable
 * Reemplaza :::definition{#def:id|desc}...::: con formato especial
 */
export function preprocessDefinitionAnchors(content: string): string {
  // Reemplazar definiciones con anclas por formato especial que react-markdown reconocerá
  // Acepta IDs con espacios y mayúsculas, los normaliza
  return content.replace(
    /:::definition\{#def:([^}|]+)(?:\|descripción:[^}]+)\}([\s\S]*?):::/g,
    (match, anchorId, content) => {
      // Normalizar el anchorId
      const normalizedAnchorId = anchorId.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      // Crear un bloque de código con marcador especial que luego procesaremos
      return `\`\`\`definition-anchor:${normalizedAnchorId}\n${content.trim()}\n\`\`\``;
    }
  ).replace(
    /:::definition\{#def:([^}|]+)\}([\s\S]*?):::/g,
    (match, anchorId, content) => {
      // Normalizar el anchorId
      const normalizedAnchorId = anchorId.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      // Sin descripción
      return `\`\`\`definition-anchor:${normalizedAnchorId}\n${content.trim()}\n\`\`\``;
    }
  );
}

/**
 * Genera el ID HTML para un anchor de definición
 */
export function getDefinitionHtmlId(anchorId: string): string {
  return `def-${anchorId}`;
}

/**
 * Genera la URL para una referencia a una definición
 */
export function getDefinitionReferenceUrl(
  anchorId: string,
  postSlug?: string,
  currentSlug?: string
): string {
  const slug = postSlug || currentSlug;
  if (!slug) {
    return '#';
  }
  return `/blog/${slug}#${getDefinitionHtmlId(anchorId)}`;
}

