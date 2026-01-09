import { prisma } from '@/lib/prisma';
import { extractProofAnchors } from './proof-anchors';

/**
 * Sincroniza las demostraciones de un post con la base de datos
 * Extrae todas las demostraciones con anclas del contenido y las guarda/actualiza en la BD
 * Asigna números automáticos basados en el orden de aparición
 */
export async function syncPostProofs(postId: string, content: string) {
  try {
    // Extraer todas las anclas del contenido
    const anchors = extractProofAnchors(content);

    // Obtener demostraciones existentes del post
    const existingProofs = await prisma.proof.findMany({
      where: { postId },
      orderBy: { number: 'asc' },
    });

    const existingAnchorsMap = new Map(
      existingProofs.map((prf) => [prf.anchorId, prf])
    );

    // Procesar cada demostración encontrada y asignar números
    const proofsToUpsert = anchors.map((anchor, index) => {
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

    // Upsert todas las demostraciones
    await Promise.all(
      proofsToUpsert.map((data) =>
        prisma.proof.upsert(data)
      )
    );

    // Eliminar demostraciones que ya no existen en el contenido
    const currentAnchorIds = new Set(anchors.map((a) => a.anchorId));
    const proofsToDelete = existingProofs.filter(
      (prf) => !currentAnchorIds.has(prf.anchorId)
    );

    if (proofsToDelete.length > 0) {
      await prisma.proof.deleteMany({
        where: {
          id: {
            in: proofsToDelete.map((prf) => prf.id),
          },
        },
      });
    }

    // Renumerar todas las demostraciones restantes para asegurar continuidad
    // (por si se eliminó alguna del medio)
    const remainingProofs = await prisma.proof.findMany({
      where: { postId },
      orderBy: { number: 'asc' },
    });

    // Actualizar números si es necesario
    for (let i = 0; i < remainingProofs.length; i++) {
      const prf = remainingProofs[i];
      if (prf.number !== i + 1) {
        await prisma.proof.update({
          where: { id: prf.id },
          data: { number: i + 1 },
        });
      }
    }

    return {
      synced: anchors.length,
      deleted: proofsToDelete.length,
    };
  } catch (error) {
    console.error('Error syncing proofs:', error);
    throw error;
  }
}


