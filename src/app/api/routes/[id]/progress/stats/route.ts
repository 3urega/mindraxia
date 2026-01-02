import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';

/**
 * GET /api/routes/[id]/progress/stats
 * Obtener estadísticas de progreso: total posts, posts leídos, porcentaje
 */
export async function GET(
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
          message: 'Debes estar autenticado para ver estadísticas',
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid route ID',
        },
        { status: 400 }
      );
    }

    // Verificar que la ruta existe
    const route = await prisma.postRoute.findUnique({
      where: { id },
      include: {
        items: {
          where: {
            post: {
              published: true,
            },
          },
          select: {
            postId: true,
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

    const totalPosts = route.items.length;

    // Contar posts leídos
    const readPosts = await prisma.postRouteProgress.count({
      where: {
        userId: user.id,
        routeId: id,
        postId: {
          in: route.items.map((item) => item.postId),
        },
      },
    });

    const percentage = totalPosts > 0 ? Math.round((readPosts / totalPosts) * 100) : 0;

    return NextResponse.json(
      {
        stats: {
          totalPosts,
          readPosts,
          unreadPosts: totalPosts - readPosts,
          percentage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching route progress stats:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al obtener estadísticas',
      },
      { status: 500 }
    );
  }
}

