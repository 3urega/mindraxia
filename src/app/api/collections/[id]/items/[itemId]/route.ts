import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';
import { z } from 'zod';

const updateItemSchema = z.object({
  description: z.string().max(500, 'La descripción es demasiado larga').optional().nullable(),
});

/**
 * PUT /api/collections/[id]/items/[itemId]
 * Actualizar descripción de un item
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Debes estar autenticado para actualizar items',
        },
        { status: 401 }
      );
    }

    const { id, itemId } = await params;

    if (!id || typeof id !== 'string' || !itemId || typeof itemId !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid collection or item ID',
        },
        { status: 400 }
      );
    }

    // Verificar que el item existe y pertenece a una agrupación del usuario
    const item = await prisma.postCollectionItem.findUnique({
      where: { id: itemId },
      include: {
        collection: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Item no encontrado',
        },
        { status: 404 }
      );
    }

    if (item.collectionId !== id) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'El item no pertenece a esta agrupación',
        },
        { status: 400 }
      );
    }

    if (item.collection.authorId !== user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Solo el autor puede actualizar items de esta agrupación',
        },
        { status: 403 }
      );
    }

    // Parsear y validar datos
    const body = await request.json();
    const validationResult = updateItemSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Datos inválidos',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { description } = validationResult.data;

    // Actualizar item
    const updatedItem = await prisma.postCollectionItem.update({
      where: { id: itemId },
      data: {
        description: description !== undefined ? description : undefined,
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            published: true,
          },
        },
      },
    });

    return NextResponse.json({ item: updatedItem }, { status: 200 });
  } catch (error) {
    console.error('Error updating collection item:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al actualizar item',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/collections/[id]/items/[itemId]
 * Eliminar item de la agrupación
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Debes estar autenticado para eliminar items',
        },
        { status: 401 }
      );
    }

    const { id, itemId } = await params;

    if (!id || typeof id !== 'string' || !itemId || typeof itemId !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid collection or item ID',
        },
        { status: 400 }
      );
    }

    // Verificar que el item existe y pertenece a una agrupación del usuario
    const item = await prisma.postCollectionItem.findUnique({
      where: { id: itemId },
      include: {
        collection: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Item no encontrado',
        },
        { status: 404 }
      );
    }

    if (item.collectionId !== id) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'El item no pertenece a esta agrupación',
        },
        { status: 400 }
      );
    }

    if (item.collection.authorId !== user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Solo el autor puede eliminar items de esta agrupación',
        },
        { status: 403 }
      );
    }

    // Eliminar item
    await prisma.postCollectionItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json(
      {
        message: 'Item eliminado correctamente',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting collection item:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al eliminar item',
      },
      { status: 500 }
    );
  }
}





