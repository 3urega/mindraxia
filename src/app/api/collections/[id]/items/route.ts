import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';
import { z } from 'zod';

const addItemSchema = z.object({
  postId: z.string().min(1, 'El ID del post es requerido'),
  description: z.string().max(500, 'La descripción es demasiado larga').optional(),
});

/**
 * GET /api/collections/[id]/items
 * Listar items de una agrupación
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

    // Verificar que la agrupación existe y permisos de acceso
    const collection = await prisma.postCollection.findUnique({
      where: { id },
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

    const items = await prisma.postCollectionItem.findMany({
      where: { collectionId: id },
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
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error('Error fetching collection items:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al obtener items de la agrupación',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/collections/[id]/items
 * Añadir post a la agrupación (con descripción opcional)
 */
export async function POST(
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
          message: 'Debes estar autenticado para añadir posts a agrupaciones',
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
    const collection = await prisma.postCollection.findUnique({
      where: { id },
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

    if (collection.authorId !== user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Solo el autor puede añadir posts a esta agrupación',
        },
        { status: 403 }
      );
    }

    // Parsear y validar datos
    const body = await request.json();
    const validationResult = addItemSchema.safeParse(body);

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

    const { postId, description } = validationResult.data;

    // Verificar que el post existe y está publicado
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'El post especificado no existe',
        },
        { status: 400 }
      );
    }

    if (!post.published) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Solo se pueden añadir posts publicados a las agrupaciones',
        },
        { status: 400 }
      );
    }

    // Verificar que el post no está ya en la agrupación
    const existingItem = await prisma.postCollectionItem.findUnique({
      where: {
        collectionId_postId: {
          collectionId: id,
          postId: postId,
        },
      },
    });

    if (existingItem) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Este post ya está en la agrupación',
        },
        { status: 400 }
      );
    }

    // Crear item
    const item = await prisma.postCollectionItem.create({
      data: {
        collectionId: id,
        postId: postId,
        description: description || null,
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

    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding collection item:', error);
    
    // Manejar error de constraint único de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Este post ya está en la agrupación',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al añadir post a la agrupación',
      },
      { status: 500 }
    );
  }
}








