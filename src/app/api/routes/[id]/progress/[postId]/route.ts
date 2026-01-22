import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';
import { z } from 'zod';

const markReadSchema = z.object({
  read: z.boolean(),
});

/**
 * POST /api/routes/[id]/progress/[postId]
 * Marcar post como leído o no leído (requiere autenticación)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Debes estar autenticado para marcar posts como leídos',
        },
        { status: 401 }
      );
    }

    const { id, postId } = await params;

    if (!id || typeof id !== 'string' || !postId || typeof postId !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid route or post ID',
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

    // Verificar que el post existe y está en la ruta
    const routeItem = await prisma.postRouteItem.findFirst({
      where: {
        routeId: id,
        postId: postId,
      },
    });

    if (!routeItem) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'El post especificado no está en esta ruta',
        },
        { status: 400 }
      );
    }

    // Parsear y validar datos
    const body = await request.json();
    const validationResult = markReadSchema.safeParse(body);

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

    const { read } = validationResult.data;

    if (read) {
      // Marcar como leído (crear o actualizar)
      await prisma.postRouteProgress.upsert({
        where: {
          userId_routeId_postId: {
            userId: user.id,
            routeId: id,
            postId: postId,
          },
        },
        update: {
          readAt: new Date(),
        },
        create: {
          userId: user.id,
          routeId: id,
          postId: postId,
          readAt: new Date(),
        },
      });
    } else {
      // Desmarcar como leído (eliminar)
      await prisma.postRouteProgress.deleteMany({
        where: {
          userId: user.id,
          routeId: id,
          postId: postId,
        },
      });
    }

    return NextResponse.json(
      {
        message: read ? 'Post marcado como leído' : 'Post desmarcado como leído',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating route progress:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al actualizar progreso',
      },
      { status: 500 }
    );
  }
}






