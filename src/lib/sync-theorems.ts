import { prisma } from '@/lib/prisma';
import { extractTheoremAnchors } from './theorem-anchors';

/**
 * Sincroniza los teoremas de un post con la base de datos
 * Extrae todos los teoremas con anclas del contenido y los guarda/actualiza en la BD
 * Asigna números automáticos basados en el orden de aparición
 */
export async function syncPostTheorems(postId: string, content: string) {
  try {
    // Extraer todas las anclas del contenido
    const anchors = extractTheoremAnchors(content);

    // Obtener teoremas existentes del post
    const existingTheorems = await prisma.theorem.findMany({
      where: { postId },
      orderBy: { number: 'asc' },
    });

    const existingAnchorsMap = new Map(
      existingTheorems.map((thm) => [thm.anchorId, thm])
    );

    // Procesar cada teorema encontrado y asignar números
    const theoremsToUpsert = anchors.map((anchor, index) => {
      const number = index + 1; // Numeración automática basada en orden de aparición
      const existing = existingAnchorsMap.get(anchor.anchorId);

      return {
        where: {
          postId_anchorId: {
            postId,
            anchorId: anchor.anchorId,
          },
        },
        update: {
          content: anchor.content,
          description: anchor.description || null,
          number, // Actualizar número por si cambió el orden
        },
        create: {
          postId,
          anchorId: anchor.anchorId,
          content: anchor.content,
          description: anchor.description || null,
          number,
        },
      };
    });

    // Upsert todos los teoremas
    await Promise.all(
      theoremsToUpsert.map((data) =>
        prisma.theorem.upsert(data)
      )
    );

    // Eliminar teoremas que ya no existen en el contenido
    const currentAnchorIds = new Set(anchors.map((a) => a.anchorId));
    const theoremsToDelete = existingTheorems.filter(
      (thm) => !currentAnchorIds.has(thm.anchorId)
    );

    if (theoremsToDelete.length > 0) {
      await prisma.theorem.deleteMany({
        where: {
          id: {
            in: theoremsToDelete.map((thm) => thm.id),
          },
        },
      });
    }

    // Renumerar todos los teoremas restantes para asegurar continuidad
    // (por si se eliminó alguno del medio)
    const remainingTheorems = await prisma.theorem.findMany({
      where: { postId },
      orderBy: { number: 'asc' },
    });

    // Actualizar números si es necesario
    for (let i = 0; i < remainingTheorems.length; i++) {
      const thm = remainingTheorems[i];
      if (thm.number !== i + 1) {
        await prisma.theorem.update({
          where: { id: thm.id },
          data: { number: i + 1 },
        });
      }
    }

    return {
      synced: anchors.length,
      deleted: theoremsToDelete.length,
    };
  } catch (error) {
    console.error('Error syncing theorems:', error);
    throw error;
  }
}

