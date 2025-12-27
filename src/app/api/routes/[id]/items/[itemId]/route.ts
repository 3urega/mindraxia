import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';
import { z } from 'zod';

const updateItemSchema = z.object({
  order: z.number().int().positive(),
});

/**
 * PUT /api/routes/[id]/items/[itemId]
 * Actualizar orden de un item (solo autor)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Debes estar autenticado para actualizar items de rutas',
        },
        { status: 401 }
      );
    }

    const { id, itemId } = await params;

    if (!id || typeof id !== 'string' || !itemId || typeof itemId !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid route or item ID',
        },
        { status: 400 }
      );
    }

    // Buscar ruta y verificar autoría
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

    if (route.authorId !== user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'No tienes permiso para modificar esta ruta',
        },
        { status: 403 }
      );
    }

    // Buscar item existente
    const existingItem = await prisma.postRouteItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem || existingItem.routeId !== id) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Item no encontrado',
        },
        { status: 404 }
      );
    }

    // Parsear y validar datos
    const body = await request.json();
    const validationResult = updateItemSchema.safeParse(body);

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

    const { order: newOrder } = validationResult.data;
    const oldOrder = existingItem.order;

    if (newOrder === oldOrder) {
      // No hay cambios
      const item = await prisma.postRouteItem.findUnique({
        where: { id: itemId },
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
      });

      return NextResponse.json(
        {
          message: 'Item actualizado exitosamente',
          item: {
            id: item!.id,
            postId: item!.post.id,
            order: item!.order,
            post: {
              id: item!.post.id,
              title: item!.post.title,
              slug: item!.post.slug,
              excerpt: item!.post.excerpt,
              published: item!.post.published,
            },
          },
        },
        { status: 200 }
      );
    }

    // Obtener máximo order
    const maxOrderResult = await prisma.postRouteItem.findFirst({
      where: { routeId: id },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const maxOrder = maxOrderResult?.order || 0;

    // Ajustar newOrder si es mayor que el máximo
    const targetOrder = Math.min(newOrder, maxOrder);

    // Reordenar items
    if (targetOrder > oldOrder) {
      // Mover hacia abajo: desplazar items entre oldOrder+1 y targetOrder hacia arriba
      const itemsToShift = await prisma.postRouteItem.findMany({
        where: {
          routeId: id,
          order: { gt: oldOrder, lte: targetOrder },
        },
      });

      for (const item of itemsToShift) {
        await prisma.postRouteItem.update({
          where: { id: item.id },
          data: { order: item.order - 1 },
        });
      }
    } else {
      // Mover hacia arriba: desplazar items entre targetOrder y oldOrder-1 hacia abajo
      const itemsToShift = await prisma.postRouteItem.findMany({
        where: {
          routeId: id,
          order: { gte: targetOrder, lt: oldOrder },
        },
      });

      for (const item of itemsToShift) {
        await prisma.postRouteItem.update({
          where: { id: item.id },
          data: { order: item.order + 1 },
        });
      }
    }

    // Actualizar el item
    const updatedItem = await prisma.postRouteItem.update({
      where: { id: itemId },
      data: { order: targetOrder },
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
    });

    return NextResponse.json(
      {
        message: 'Item actualizado exitosamente',
        item: {
          id: updatedItem.id,
          postId: updatedItem.post.id,
          order: updatedItem.order,
          post: {
            id: updatedItem.post.id,
            title: updatedItem.post.title,
            slug: updatedItem.post.slug,
            excerpt: updatedItem.post.excerpt,
            published: updatedItem.post.published,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating route item:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al actualizar item de la ruta',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/routes/[id]/items/[itemId]
 * Eliminar item de ruta (solo autor)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Debes estar autenticado para eliminar items de rutas',
        },
        { status: 401 }
      );
    }

    const { id, itemId } = await params;

    if (!id || typeof id !== 'string' || !itemId || typeof itemId !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid route or item ID',
        },
        { status: 400 }
      );
    }

    // Buscar ruta y verificar autoría
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

    if (route.authorId !== user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'No tienes permiso para modificar esta ruta',
        },
        { status: 403 }
      );
    }

    // Buscar item existente
    const existingItem = await prisma.postRouteItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem || existingItem.routeId !== id) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Item no encontrado',
        },
        { status: 404 }
      );
    }

    const deletedOrder = existingItem.order;

    // Eliminar el item
    await prisma.postRouteItem.delete({
      where: { id: itemId },
    });

    // Reordenar items restantes (decrementar order de items con order > deletedOrder)
    const itemsToShift = await prisma.postRouteItem.findMany({
      where: {
        routeId: id,
        order: { gt: deletedOrder },
      },
    });

    for (const item of itemsToShift) {
      await prisma.postRouteItem.update({
        where: { id: item.id },
        data: { order: item.order - 1 },
      });
    }

    return NextResponse.json(
      {
        message: 'Item eliminado exitosamente',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting route item:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al eliminar item de la ruta',
      },
      { status: 500 }
    );
  }
}
