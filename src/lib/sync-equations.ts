import { prisma } from '@/lib/prisma';
import { extractAnchors } from './markdown-anchors';

/**
 * Sincroniza las ecuaciones de un post con la base de datos
 * Extrae todas las ecuaciones con anclas del contenido y las guarda/actualiza en la BD
 */
export async function syncPostEquations(postId: string, content: string) {
  try {
    // Extraer todas las anclas del contenido
    const anchors = extractAnchors(content);

    // Obtener ecuaciones existentes del post
    const existingEquations = await prisma.equation.findMany({
      where: { postId },
    });

    const existingAnchorsMap = new Map(
      existingEquations.map((eq) => [eq.anchorId, eq])
    );

    // Procesar cada ecuación encontrada
    const equationsToUpsert = anchors.map((anchor) => ({
      where: {
        postId_anchorId: {
          postId,
          anchorId: anchor.anchorId,
        },
      },
      update: {
        equation: anchor.equation,
        description: anchor.description || null,
      },
      create: {
        postId,
        anchorId: anchor.anchorId,
        equation: anchor.equation,
        description: anchor.description || null,
      },
    }));

    // Upsert todas las ecuaciones
    await Promise.all(
      equationsToUpsert.map((data) =>
        prisma.equation.upsert(data)
      )
    );

    // Eliminar ecuaciones que ya no existen en el contenido
    const currentAnchorIds = new Set(anchors.map((a) => a.anchorId));
    const equationsToDelete = existingEquations.filter(
      (eq) => !currentAnchorIds.has(eq.anchorId)
    );

    if (equationsToDelete.length > 0) {
      await prisma.equation.deleteMany({
        where: {
          id: {
            in: equationsToDelete.map((eq) => eq.id),
          },
        },
      });
    }

    return {
      synced: anchors.length,
      deleted: equationsToDelete.length,
    };
  } catch (error) {
    console.error('Error syncing equations:', error);
    throw error;
  }
}

