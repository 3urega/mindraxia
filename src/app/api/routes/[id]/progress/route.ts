import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';

/**
 * GET /api/routes/[id]/progress
 * Obtener progreso del usuario actual en una ruta
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
          message: 'Debes estar autenticado para ver el progreso',
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

    // Obtener progreso del usuario
    const progress = await prisma.postRouteProgress.findMany({
      where: {
        userId: user.id,
        routeId: id,
      },
      select: {
        postId: true,
        readAt: true,
      },
    });

    const serializedProgress = progress.map((p) => ({
      postId: p.postId,
      readAt: p.readAt.toISOString(),
    }));

    return NextResponse.json({ progress: serializedProgress }, { status: 200 });
  } catch (error) {
    console.error('Error fetching route progress:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al obtener progreso',
      },
      { status: 500 }
    );
  }
}






