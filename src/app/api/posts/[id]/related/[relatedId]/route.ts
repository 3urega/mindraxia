import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/posts/[id]/related/[relatedId]
 * Elimina una relación entre dos posts
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; relatedId: string }> }
) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Debes estar autenticado para eliminar relaciones',
        },
        { status: 401 }
      );
    }

    const { id, relatedId } = await params;

    if (!id || typeof id !== 'string' || !relatedId || typeof relatedId !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid post IDs',
        },
        { status: 400 }
      );
    }

    // Verificar que el post existe y el usuario tiene permisos
    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!post) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Post no encontrado',
        },
        { status: 404 }
      );
    }

    if (post.authorId !== user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'No tienes permiso para eliminar relaciones de este post',
        },
        { status: 403 }
      );
    }

    // Normalizar IDs para buscar la relación en ambas direcciones
    const [normalizedPostAId, normalizedPostBId] = 
      id < relatedId ? [id, relatedId] : [relatedId, id];

    // Buscar y eliminar la relación
    const relation = await prisma.postRelation.findUnique({
      where: {
        postAId_postBId: {
          postAId: normalizedPostAId,
          postBId: normalizedPostBId,
        },
      },
    });

    if (!relation) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'La relación no existe',
        },
        { status: 404 }
      );
    }

    await prisma.postRelation.delete({
      where: {
        id: relation.id,
      },
    });

    return NextResponse.json(
      {
        message: 'Relación eliminada exitosamente',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting related post:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al eliminar relación',
      },
      { status: 500 }
    );
  }
}
