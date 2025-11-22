import { prisma } from '@/lib/prisma';
import { extractDefinitionAnchors } from './definition-anchors';

/**
 * Sincroniza las definiciones de un post con la base de datos
 * Extrae todas las definiciones con anclas del contenido y las guarda/actualiza en la BD
 * Asigna números automáticos basados en el orden de aparición
 */
export async function syncPostDefinitions(postId: string, content: string) {
  try {
    // Extraer todas las anclas del contenido
    const anchors = extractDefinitionAnchors(content);

    // Obtener definiciones existentes del post
    const existingDefinitions = await prisma.definition.findMany({
      where: { postId },
      orderBy: { number: 'asc' },
    });

    const existingAnchorsMap = new Map(
      existingDefinitions.map((def) => [def.anchorId, def])
    );

    // Procesar cada definición encontrada y asignar números
    const definitionsToUpsert = anchors.map((anchor, index) => {
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

    // Upsert todas las definiciones
    await Promise.all(
      definitionsToUpsert.map((data) =>
        prisma.definition.upsert(data)
      )
    );

    // Eliminar definiciones que ya no existen en el contenido
    const currentAnchorIds = new Set(anchors.map((a) => a.anchorId));
    const definitionsToDelete = existingDefinitions.filter(
      (def) => !currentAnchorIds.has(def.anchorId)
    );

    if (definitionsToDelete.length > 0) {
      await prisma.definition.deleteMany({
        where: {
          id: {
            in: definitionsToDelete.map((def) => def.id),
          },
        },
      });
    }

    // Renumerar todas las definiciones restantes para asegurar continuidad
    // (por si se eliminó alguna del medio)
    const remainingDefinitions = await prisma.definition.findMany({
      where: { postId },
      orderBy: { number: 'asc' },
    });

    // Actualizar números si es necesario
    for (let i = 0; i < remainingDefinitions.length; i++) {
      const def = remainingDefinitions[i];
      if (def.number !== i + 1) {
        await prisma.definition.update({
          where: { id: def.id },
          data: { number: i + 1 },
        });
      }
    }

    return {
      synced: anchors.length,
      deleted: definitionsToDelete.length,
    };
  } catch (error) {
    console.error('Error syncing definitions:', error);
    throw error;
  }
}

