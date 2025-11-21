/**
 * Utilidades para parsear anclas y referencias de imágenes en markdown
 */

export interface ImageAnchor {
  anchorId: string;
  description?: string;
  imageUrl: string;
  altText?: string;
  fullMatch: string; // Match completo del markdown original
}

export interface ImageReference {
  postSlug?: string; // Si no existe, es referencia al mismo post
  anchorId: string;
  linkText: string;
  fullMatch: string;
}

/**
 * Extrae todas las anclas de imágenes del markdown
 * Sintaxis: ![alt](url){#img:anchor-id|descripción: texto}
 */
export function extractImageAnchors(content: string): ImageAnchor[] {
  const anchors: ImageAnchor[] = [];
  
  // Regex para detectar: ![alt](url){#img:id|descripción: texto}
  // También soporta: ![alt](url){#img:id} (sin descripción)
  const anchorRegex = /!\[([^\]]*)\]\(([^)]+)\)\{#img:([a-z0-9-]+)(?:\|descripción:\s*([^}]+))?\}/g;
  
  let match;
  while ((match = anchorRegex.exec(content)) !== null) {
    const [, altText, imageUrl, anchorId, description] = match;
    
    anchors.push({
      anchorId: anchorId.trim(),
      description: description?.trim(),
      imageUrl: imageUrl.trim(),
      altText: altText?.trim() || undefined,
      fullMatch: match[0],
    });
  }
  
  return anchors;
}

/**
 * Extrae todas las referencias a imágenes del markdown
 * Sintaxis: {{img:post-slug/anchor-id|texto}} o {{img:anchor-id|texto}}
 */
export function extractImageReferences(content: string): ImageReference[] {
  const references: ImageReference[] = [];
  
  // Regex para detectar: {{img:slug/anchor|texto}} o {{img:anchor|texto}}
  const referenceRegex = /\{\{img:([^}|]+)\|([^}]+)\}\}/g;
  
  let match;
  while ((match = referenceRegex.exec(content)) !== null) {
    const [, path, linkText] = match;
    const parts = path.split('/');
    
    if (parts.length === 2) {
      // Referencia a otro post: {{img:post-slug/anchor-id|texto}}
      references.push({
        postSlug: parts[0].trim(),
        anchorId: parts[1].trim(),
        linkText: linkText.trim(),
        fullMatch: match[0],
      });
    } else {
      // Referencia al mismo post: {{img:anchor-id|texto}}
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
 * Genera el ID HTML para un anchor de imagen
 */
export function getImageAnchorHtmlId(anchorId: string): string {
  return `img-${anchorId}`;
}

/**
 * Genera la URL para una referencia a una imagen
 */
export function getImageReferenceUrl(
  anchorId: string,
  postSlug?: string,
  currentSlug?: string
): string {
  const slug = postSlug || currentSlug;
  if (!slug) {
    return '#';
  }
  return `/blog/${slug}#${getImageAnchorHtmlId(anchorId)}`;
}

/**
 * Preprocesa el markdown para convertir imágenes con anclas en formato renderizable
 * Reemplaza ![alt](url){#img:id|desc} con formato especial
 */
export function preprocessImageAnchors(content: string): string {
  // Reemplazar imágenes con anclas por formato especial que react-markdown reconocerá
  return content.replace(
    /!\[([^\]]*)\]\(([^)]+)\)\{#img:([a-z0-9-]+)(?:\|descripción:\s*([^}]+))?\}/g,
    (match, alt, url, anchorId, description) => {
      // Crear un enlace markdown especial que luego procesaremos
      return `![${alt}](${url}){data-img-anchor="${anchorId}" data-img-desc="${description || ''}"}`;
    }
  );
}

