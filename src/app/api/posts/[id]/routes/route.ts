import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/posts/[id]/routes
 * Obtener todas las rutas en las que aparece un post
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

    // Buscar todas las rutas que contienen este post
    const routeItems = await prisma.postRouteItem.findMany({
      where: {
        postId: id,
      },
      include: {
        route: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        route: {
          createdAt: 'desc',
        },
      },
    });

    const routes = routeItems.map((item) => ({
      id: item.route.id,
      name: item.route.name,
      slug: item.route.slug,
      description: item.route.description,
      category: item.route.category,
      order: item.order,
    }));

    return NextResponse.json({ routes }, { status: 200 });
  } catch (error) {
    console.error('Error fetching post routes:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al obtener rutas del post',
      },
      { status: 500 }
    );
  }
}



