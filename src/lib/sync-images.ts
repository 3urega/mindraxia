import { prisma } from '@/lib/prisma';
import { extractImageAnchors } from './image-anchors';

/**
 * Sincroniza las imágenes con anclas de un post con la base de datos
 * Extrae todas las imágenes con anclas del contenido y las actualiza en la BD
 */
export async function syncPostImageAnchors(postId: string, content: string) {
  try {
    // Extraer todas las anclas de imágenes del contenido
    const anchors = extractImageAnchors(content);

    // Obtener imágenes existentes del post con anclas
    const existingImages = await prisma.image.findMany({
      where: { 
        postId,
        anchorId: { not: null },
      },
    });

    const existingAnchorsMap = new Map(
      existingImages.map((img) => [img.anchorId!, img])
    );

    // Procesar cada ancla encontrada
    const anchorsToUpdate = anchors.map((anchor) => ({
      where: {
        postId_anchorId: {
          postId,
          anchorId: anchor.anchorId,
        },
      },
      update: {
        description: anchor.description || null,
        alt: anchor.altText || null,
      },
      create: {
        // No creamos la imagen aquí, solo actualizamos anclas
        // Las imágenes se crean al subirlas
        postId,
        anchorId: anchor.anchorId,
        description: anchor.description || null,
        alt: anchor.altText || null,
        // Estos campos deben ser proporcionados al crear la imagen
        filename: '',
        originalName: '',
        mimeType: 'image/jpeg',
        size: 0,
        path: anchor.imageUrl,
        url: anchor.imageUrl,
      },
    }));

    // Upsert todas las anclas (solo si la imagen ya existe)
    await Promise.all(
      anchorsToUpdate.map(async (data) => {
        // Verificar si la imagen ya existe
        const existing = existingAnchorsMap.get(data.where.postId_anchorId.anchorId);
        if (existing) {
          // Actualizar ancla existente
          await prisma.image.update({
            where: { id: existing.id },
            data: data.update,
          });
        }
        // Si no existe, la imagen debe ser creada primero mediante upload
      })
    );

    // Eliminar anclas que ya no existen en el contenido
    const currentAnchorIds = new Set(anchors.map((a) => a.anchorId));
    const anchorsToRemove = existingImages.filter(
      (img) => !currentAnchorIds.has(img.anchorId!)
    );

    if (anchorsToRemove.length > 0) {
      // Solo eliminar la ancla, no la imagen
      await prisma.image.updateMany({
        where: {
          id: {
            in: anchorsToRemove.map((img) => img.id),
          },
        },
        data: {
          anchorId: null,
          description: null,
        },
      });
    }

    return {
      synced: anchors.length,
      removed: anchorsToRemove.length,
    };
  } catch (error) {
    console.error('Error syncing image anchors:', error);
    throw error;
  }
}

