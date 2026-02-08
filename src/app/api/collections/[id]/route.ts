import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';
import { z } from 'zod';

const updateCollectionSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'El título es demasiado largo').optional(),
  description: z.string().max(1000, 'La descripción es demasiado larga').optional().nullable(),
  isPublic: z.boolean().optional(),
});

/**
 * GET /api/collections/[id]
 * Obtener agrupación individual (con verificación de privacidad)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid collection ID',
        },
        { status: 400 }
      );
    }

    const collection = await prisma.postCollection.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
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
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!collection) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Agrupación no encontrada',
        },
        { status: 404 }
      );
    }

    // Verificar permisos de visibilidad
    if (!collection.isPublic && (!user || user.id !== collection.authorId)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'No tienes permiso para ver esta agrupación',
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        collection: {
          ...collection,
          postCount: collection.items.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al obtener agrupación',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/collections/[id]
 * Actualizar agrupación (solo autor)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Debes estar autenticado para actualizar agrupaciones',
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid collection ID',
        },
        { status: 400 }
      );
    }

    // Verificar que la agrupación existe y el usuario es el autor
    const existingCollection = await prisma.postCollection.findUnique({
      where: { id },
    });

    if (!existingCollection) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Agrupación no encontrada',
        },
        { status: 404 }
      );
    }

    if (existingCollection.authorId !== user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Solo el autor puede actualizar esta agrupación',
        },
        { status: 403 }
      );
    }

    // Parsear y validar datos
    const body = await request.json();
    const validationResult = updateCollectionSchema.safeParse(body);

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

    const updateData = validationResult.data;
    const dataToUpdate: any = {};

    if (updateData.title !== undefined) {
      dataToUpdate.title = updateData.title;
    }
    if (updateData.description !== undefined) {
      dataToUpdate.description = updateData.description;
    }
    if (updateData.isPublic !== undefined) {
      dataToUpdate.isPublic = updateData.isPublic;
    }

    // Actualizar agrupación
    const collection = await prisma.postCollection.update({
      where: { id },
      data: dataToUpdate,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          select: {
            id: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        collection: {
          ...collection,
          postCount: collection.items.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al actualizar agrupación',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/collections/[id]
 * Eliminar agrupación (solo autor)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Debes estar autenticado para eliminar agrupaciones',
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid collection ID',
        },
        { status: 400 }
      );
    }

    // Verificar que la agrupación existe y el usuario es el autor
    const existingCollection = await prisma.postCollection.findUnique({
      where: { id },
    });

    if (!existingCollection) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Agrupación no encontrada',
        },
        { status: 404 }
      );
    }

    if (existingCollection.authorId !== user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Solo el autor puede eliminar esta agrupación',
        },
        { status: 403 }
      );
    }

    // Eliminar agrupación (los items se eliminarán en cascada)
    await prisma.postCollection.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        message: 'Agrupación eliminada correctamente',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al eliminar agrupación',
      },
      { status: 500 }
    );
  }
}







