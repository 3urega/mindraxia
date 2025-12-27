import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * GET /api/posts/[id]/related
 * Obtiene todos los posts relacionados de un post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid post ID',
        },
        { status: 400 }
      );
    }

    // Buscar todas las relaciones donde este post aparece como postA o postB
    const relations = await prisma.postRelation.findMany({
      where: {
        OR: [
          { postAId: id },
          { postBId: id },
        ],
      },
      include: {
        postA: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            published: true,
          },
        },
        postB: {
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

    // Extraer los posts relacionados (el que no es el post actual)
    const relatedPosts = relations
      .map((relation) => {
        if (relation.postAId === id) {
          return relation.postB;
        } else {
          return relation.postA;
        }
      })
      .filter((post) => post.published); // Solo posts publicados

    return NextResponse.json({ relatedPosts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al obtener posts relacionados',
      },
      { status: 500 }
    );
  }
}

const addRelatedPostSchema = z.object({
  relatedPostId: z.string().min(1, 'El ID del post relacionado es requerido'),
});

/**
 * POST /api/posts/[id]/related
 * Añade una relación bidireccional entre dos posts
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
          message: 'Debes estar autenticado para relacionar posts',
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid post ID',
        },
        { status: 400 }
      );
    }

    // Parsear y validar body
    const body = await request.json();
    const validationResult = addRelatedPostSchema.safeParse(body);

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

    const { relatedPostId } = validationResult.data;

    // Validar que no se relaciona un post consigo mismo
    if (id === relatedPostId) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'No puedes relacionar un post consigo mismo',
        },
        { status: 400 }
      );
    }

    // Verificar que ambos posts existen y están publicados
    const [postA, postB] = await Promise.all([
      prisma.post.findUnique({
        where: { id },
        select: { id: true, published: true, authorId: true },
      }),
      prisma.post.findUnique({
        where: { id: relatedPostId },
        select: { id: true, published: true },
      }),
    ]);

    if (!postA || !postB) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Uno o ambos posts no existen',
        },
        { status: 404 }
      );
    }

    if (!postA.published || !postB.published) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Solo se pueden relacionar posts publicados',
        },
        { status: 400 }
      );
    }

    // Verificar permisos de edición (solo el autor puede relacionar)
    if (postA.authorId !== user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'No tienes permiso para relacionar este post',
        },
        { status: 403 }
      );
    }

    // Normalizar IDs para evitar duplicados (siempre postAId < postBId alfabéticamente)
    const [normalizedPostAId, normalizedPostBId] = 
      id < relatedPostId ? [id, relatedPostId] : [relatedPostId, id];

    // Verificar si la relación ya existe
    const existingRelation = await prisma.postRelation.findUnique({
      where: {
        postAId_postBId: {
          postAId: normalizedPostAId,
          postBId: normalizedPostBId,
        },
      },
    });

    if (existingRelation) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'Los posts ya están relacionados',
        },
        { status: 409 }
      );
    }

    // Crear la relación
    const relation = await prisma.postRelation.create({
      data: {
        postAId: normalizedPostAId,
        postBId: normalizedPostBId,
      },
      include: {
        postA: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
          },
        },
        postB: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
          },
        },
      },
    });

    // Retornar el post relacionado (el que no es el post actual)
    // Como normalizamos los IDs, necesitamos verificar cuál es el relacionado
    const relatedPost = normalizedPostAId === id ? relation.postB : relation.postA;

    return NextResponse.json(
      {
        message: 'Relación creada exitosamente',
        relatedPost,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding related post:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al añadir post relacionado',
      },
      { status: 500 }
    );
  }
}
