import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/posts/slug/[slug]/equations
 * Obtiene todas las ecuaciones de un post publicado por slug (público)
 * Las ecuaciones se ordenan por createdAt y se numeran según ese orden
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

    // Obtener ecuaciones del post ordenadas por creación
    const equations = await prisma.equation.findMany({
      where: { postId: post.id },
      select: {
        id: true,
        anchorId: true,
        description: true,
        equation: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Asignar números según el orden de aparición
    const equationsWithNumbers = equations.map((eq, index) => ({
      anchorId: eq.anchorId,
      description: eq.description,
      equation: eq.equation,
      number: index + 1,
      postSlug: post.slug,
    }));

    return NextResponse.json(
      {
        equations: equationsWithNumbers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching equations:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch equations',
      },
      { status: 500 }
    );
  }
}







