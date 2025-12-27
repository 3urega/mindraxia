import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/public/definitions/[postSlug]/[anchorId]
 * Obtiene una definición específica por postSlug y anchorId (público, solo posts publicados)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postSlug: string; anchorId: string }> }
) {
  try {
    const { postSlug, anchorId } = await params;

    // Validar parámetros
    if (!postSlug || !anchorId) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'postSlug y anchorId son requeridos',
        },
        { status: 400 }
      );
    }

    // Buscar el post por slug (solo publicado)
    const post = await prisma.post.findFirst({
      where: {
        slug: postSlug,
        published: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Post no encontrado o no publicado',
        },
        { status: 404 }
      );
    }

    // Buscar la definición por postId y anchorId
    const definition = await prisma.definition.findFirst({
      where: {
        postId: post.id,
        anchorId: anchorId,
      },
      select: {
        id: true,
        anchorId: true,
        content: true,
        description: true,
        number: true,
      },
    });

    if (!definition) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Definición no encontrada',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        content: definition.content,
        description: definition.description,
        anchorId: definition.anchorId,
        number: definition.number,
        postTitle: post.title,
        postSlug: post.slug,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching definition:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch definition',
      },
      { status: 500 }
    );
  }
}
