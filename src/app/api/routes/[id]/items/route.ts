import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';
import { z } from 'zod';

const addItemSchema = z.object({
  postId: z.string().min(1, 'El ID del post es requerido'),
  order: z.number().int().positive().optional(),
});

/**
 * GET /api/routes/[id]/items
 * Obtener items de una ruta ordenados por order
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
          message: 'Invalid route ID',
        },
        { status: 400 }
      );
    }

    const items = await prisma.postRouteItem.findMany({
      where: { routeId: id },
      orderBy: { order: 'asc' },
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

    const serializedItems = items.map((item) => ({
      id: item.id,
      postId: item.post.id,
      order: item.order,
      post: {
        id: item.post.id,
        title: item.post.title,
        slug: item.post.slug,
        excerpt: item.post.excerpt,
        published: item.post.published,
      },
    }));

    return NextResponse.json({ items: serializedItems }, { status: 200 });
  } catch (error) {
    console.error('Error fetching route items:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al obtener items de la ruta',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/routes/[id]/items
 * Añadir post a ruta (solo autor)
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
          message: 'Debes estar autenticado para añadir items a rutas',
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

    // Parsear y validar datos
    const body = await request.json();
    const validationResult = addItemSchema.safeParse(body);

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

    const { postId, order } = validationResult.data;

    // Verificar que el post existe y está publicado
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, published: true },
    });

    if (!post) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Post no encontrado',
        },
        { status: 404 }
      );
    }

    if (!post.published) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Solo se pueden añadir posts publicados a rutas',
        },
        { status: 400 }
      );
    }

    // Verificar que el post no está ya en la ruta
    const existingItem = await prisma.postRouteItem.findFirst({
      where: {
        routeId: id,
        postId: postId,
      },
    });

    if (existingItem) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'Este post ya está en la ruta',
        },
        { status: 409 }
      );
    }

    // Determinar el order (si no se especifica, añadir al final)
    let finalOrder: number;
    if (order) {
      // Si se especifica un order, desplazar otros items
      const maxOrder = await prisma.postRouteItem.findFirst({
        where: { routeId: id },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      const targetOrder = Math.min(order, (maxOrder?.order || 0) + 1);

      // Desplazar items que tengan order >= targetOrder
      const itemsToShift = await prisma.postRouteItem.findMany({
        where: {
          routeId: id,
          order: { gte: targetOrder },
        },
      });

      for (const item of itemsToShift) {
        await prisma.postRouteItem.update({
          where: { id: item.id },
          data: { order: item.order + 1 },
        });
      }

      finalOrder = targetOrder;
    } else {
      // Añadir al final
      const maxOrder = await prisma.postRouteItem.findFirst({
        where: { routeId: id },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      finalOrder = (maxOrder?.order || 0) + 1;
    }

    // Crear el item
    const item = await prisma.postRouteItem.create({
      data: {
        routeId: id,
        postId: postId,
        order: finalOrder,
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
    });

    return NextResponse.json(
      {
        message: 'Item añadido exitosamente',
        item: {
          id: item.id,
          postId: item.post.id,
          order: item.order,
          post: {
            id: item.post.id,
            title: item.post.title,
            slug: item.post.slug,
            excerpt: item.post.excerpt,
            published: item.post.published,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding route item:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al añadir item a la ruta',
      },
      { status: 500 }
    );
  }
}






