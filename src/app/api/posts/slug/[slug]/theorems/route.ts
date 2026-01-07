import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/posts/slug/[slug]/theorems
 * Obtiene todos los teoremas de un post publicado por slug (público)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Validar que el slug existe
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid slug parameter',
        },
        { status: 400 }
      );
    }

    // Buscar post por slug y verificar que esté publicado
    const post = await prisma.post.findFirst({
      where: {
        slug: slug,
        published: true,
      },
      select: {
        id: true,
        slug: true,
        title: true,
      },
    });

    // Si no se encuentra el post o no está publicado
    if (!post) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Post not found or not published',
        },
        { status: 404 }
      );
    }

    // Obtener teoremas del post
    const theorems = await prisma.theorem.findMany({
      where: { postId: post.id },
      select: {
        id: true,
        anchorId: true,
        description: true,
        content: true,
        number: true,
      },
      orderBy: {
        number: 'asc',
      },
    });

    return NextResponse.json(
      {
        theorems: theorems.map((thm) => ({
          anchorId: thm.anchorId,
          description: thm.description,
          content: thm.content,
          number: thm.number,
          postSlug: post.slug,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching theorems:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch theorems',
      },
      { status: 500 }
    );
  }
}

