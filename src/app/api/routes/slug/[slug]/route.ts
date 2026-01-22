import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';

/**
 * GET /api/routes/slug/[slug]
 * Obtener ruta por slug con todos sus items ordenados
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid slug parameter',
        },
        { status: 400 }
      );
    }

    // Obtener usuario actual (si está autenticado)
    const user = await getCurrentUser();

    // Buscar ruta por slug
    const route = await prisma.postRoute.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          orderBy: {
            order: 'asc',
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
        },
      },
    });

    if (!route) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Ruta no encontrada',
        },
        { status: 404 }
      );
    }

    // Obtener progreso del usuario si está autenticado
    let progress: Array<{ postId: string; readAt: string }> = [];
    if (user) {
      const userProgress = await prisma.postRouteProgress.findMany({
        where: {
          userId: user.id,
          routeId: route.id,
        },
        select: {
          postId: true,
          readAt: true,
        },
      });
      progress = userProgress.map((p) => ({
        postId: p.postId,
        readAt: p.readAt.toISOString(),
      }));
    }

    // Filtrar solo posts publicados
    const publishedItems = route.items.filter((item) => item.post.published);

    const serializedRoute = {
      id: route.id,
      name: route.name,
      slug: route.slug,
      description: route.description,
      category: route.category,
      author: route.author,
      items: publishedItems.map((item) => ({
        id: item.id,
        postId: item.post.id,
        order: item.order,
        post: {
          id: item.post.id,
          title: item.post.title,
          slug: item.post.slug,
          excerpt: item.post.excerpt,
        },
      })),
      progress: progress,
      createdAt: route.createdAt.toISOString(),
      updatedAt: route.updatedAt.toISOString(),
    };

    return NextResponse.json({ route: serializedRoute }, { status: 200 });
  } catch (error) {
    console.error('Error fetching route:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al obtener ruta',
      },
      { status: 500 }
    );
  }
}






