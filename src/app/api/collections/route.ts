import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';
import { z } from 'zod';

const createCollectionSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'El título es demasiado largo'),
  description: z.string().max(1000, 'La descripción es demasiado larga').optional(),
  isPublic: z.boolean().default(false),
});

/**
 * GET /api/collections
 * Listar agrupaciones públicas (o privadas del usuario autenticado si está logueado)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const searchParams = request.nextUrl.searchParams;
    const authorId = searchParams.get('authorId');

    // Construir filtro de visibilidad
    const where: any = {};
    
    if (authorId) {
      // Filtrar por autor
      where.authorId = authorId;
      // Si es el usuario autenticado, mostrar todas (públicas y privadas)
      // Si no, solo públicas
      if (!user || user.id !== authorId) {
        where.isPublic = true;
      }
    } else {
      // Sin filtro de autor: mostrar solo públicas
      where.isPublic = true;
    }

    const collections = await prisma.postCollection.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transformar datos para incluir count de items
    const collectionsWithCount = collections.map((collection) => ({
      id: collection.id,
      title: collection.title,
      description: collection.description,
      isPublic: collection.isPublic,
      author: collection.author,
      postCount: collection.items.length,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    }));

    return NextResponse.json({ collections: collectionsWithCount }, { status: 200 });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al obtener agrupaciones',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/collections
 * Crear nueva agrupación (requiere autenticación)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Debes estar autenticado para crear agrupaciones',
        },
        { status: 401 }
      );
    }

    // Parsear y validar datos
    const body = await request.json();
    const validationResult = createCollectionSchema.safeParse(body);

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

    const { title, description, isPublic } = validationResult.data;

    // Crear agrupación
    const collection = await prisma.postCollection.create({
      data: {
        title,
        description: description || null,
        isPublic: isPublic || false,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        collection: {
          ...collection,
          postCount: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al crear agrupación',
      },
      { status: 500 }
    );
  }
}


