/**
 * Utilidades para parsear anclas y referencias de demostraciones en markdown
 */

export interface ProofAnchor {
  anchorId: string;
  description?: string;
  content: string; // Markdown completo
  fullMatch: string; // Match completo del markdown original
}

export interface ProofReference {
  postSlug?: string; // Si no existe, es referencia al mismo post
  anchorId: string;
  linkText: string;
  embed?: boolean; // Si es true, mostrar contenido completo en lugar de solo enlace
  fullMatch: string;
}

/**
 * Extrae todas las anclas de demostraciones del markdown
 * Sintaxis: :::proof{#prf:anchor-id|descripción: texto}...:::
 */
export function extractProofAnchors(content: string): ProofAnchor[] {
  const anchors: ProofAnchor[] = [];
  
  // Regex para detectar: :::proof{#prf:id|descripción: texto}...:::
  // También soporta: :::proof{#prf:id}...::: (sin descripción)
  // Acepta IDs con espacios, mayúsculas, etc. (se normalizarán después)
  const anchorRegex = /:::proof\{#prf:([^}|]+)(?:\|descripción:\s*([^}]+))?\}([\s\S]*?):::/g;
  
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
 * Extrae todas las referencias a demostraciones del markdown
 * Sintaxis: {{prf:post-slug/anchor-id|texto|embed}} o {{prf:anchor-id|texto}}
 */
export function extractProofReferences(content: string): ProofReference[] {
  const references: ProofReference[] = [];
  
  // Regex para detectar: {{prf:slug/anchor|texto|embed}} o {{prf:anchor|texto}}
  const referenceRegex = /\{\{prf:([^}|]+)\|([^}|]+)(?:\|([^}]+))?\}\}/g;
  
  let match;
  while ((match = referenceRegex.exec(content)) !== null) {
    const [, path, linkText, flag] = match;
    const parts = path.split('/');
    const embed = flag?.trim().toLowerCase() === 'embed';
    
    if (parts.length === 2) {
      // Referencia a otro post: {{prf:post-slug/anchor-id|texto|embed}}
      references.push({
        postSlug: parts[0].trim(),
        anchorId: parts[1].trim(),
        linkText: linkText.trim(),
        embed: embed,
        fullMatch: match[0],
      });
    } else {
      // Referencia al mismo post: {{prf:anchor-id|texto|embed}}
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
 * Preprocesa el markdown para convertir demostraciones con anclas en formato renderizable
 * Reemplaza :::proof{#prf:id|desc}...::: con formato especial
 */
export function preprocessProofAnchors(content: string): string {
  // Reemplazar demostraciones con anclas por formato especial que react-markdown reconocerá
  // Acepta IDs con espacios y mayúsculas, los normaliza
  return content.replace(
    /:::proof\{#prf:([^}|]+)(?:\|descripción:[^}]+)\}([\s\S]*?):::/g,
    (match, anchorId, content) => {
      // Normalizar el anchorId
      const normalizedAnchorId = anchorId.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      // Crear un bloque de código con marcador especial que luego procesaremos
      return `\`\`\`proof-anchor:${normalizedAnchorId}\n${content.trim()}\n\`\`\``;
    }
  ).replace(
    /:::proof\{#prf:([^}|]+)\}([\s\S]*?):::/g,
    (match, anchorId, content) => {
      // Normalizar el anchorId
      const normalizedAnchorId = anchorId.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      // Sin descripción
      return `\`\`\`proof-anchor:${normalizedAnchorId}\n${content.trim()}\n\`\`\``;
    }
  );
}

/**
 * Genera el ID HTML para un anchor de demostración
 */
export function getProofHtmlId(anchorId: string): string {
  return `prf-${anchorId}`;
}

/**
 * Genera la URL para una referencia a una demostración
 */
export function getProofReferenceUrl(
  anchorId: string,
  postSlug?: string,
  currentSlug?: string
): string {
  const slug = postSlug || currentSlug;
  if (!slug) {
    return '#';
  }
  return `/blog/${slug}#${getProofHtmlId(anchorId)}`;
}



