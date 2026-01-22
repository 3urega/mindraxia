import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';

const updateRouteSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones').optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'La categoría es requerida').optional(),
});

/**
 * GET /api/routes/[id]
 * Obtener ruta por ID (requiere autenticación)
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
          message: 'Debes estar autenticado para ver rutas',
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

    // Buscar ruta por ID
    const route = await prisma.postRoute.findUnique({
      where: { id },
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

    // Verificar autoría (solo el autor puede ver/editar)
    if (route.authorId !== user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'No tienes permiso para ver esta ruta',
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        route: {
          id: route.id,
          name: route.name,
          slug: route.slug,
          description: route.description,
          categoryId: route.categoryId,
          category: route.category,
          author: route.author,
          createdAt: route.createdAt.toISOString(),
          updatedAt: route.updatedAt.toISOString(),
        },
      },
      { status: 200 }
    );
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

/**
 * PUT /api/routes/[id]
 * Actualizar ruta (solo autor)
 */
export async function PUT(
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
          message: 'Debes estar autenticado para actualizar rutas',
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

    // Buscar ruta existente
    const existingRoute = await prisma.postRoute.findUnique({
      where: { id },
    });

    if (!existingRoute) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Ruta no encontrada',
        },
        { status: 404 }
      );
    }

    // Verificar autoría
    if (existingRoute.authorId !== user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'No tienes permiso para editar esta ruta',
        },
        { status: 403 }
      );
    }

    // Parsear y validar datos
    const body = await request.json();
    const validationResult = updateRouteSchema.safeParse(body);

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

    const updateData = validationResult.data;

    // Si se actualiza el slug, verificar que no exista otro
    if (updateData.slug && updateData.slug !== existingRoute.slug) {
      const slugExists = await prisma.postRoute.findUnique({
        where: { slug: updateData.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          {
            error: 'Conflict',
            message: 'Ya existe una ruta con este slug',
          },
          { status: 409 }
        );
      }
    }

    // Si se actualiza la categoría, verificar que existe
    if (updateData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: updateData.categoryId },
      });

      if (!category) {
        return NextResponse.json(
          {
            error: 'Bad Request',
            message: 'La categoría especificada no existe',
          },
          { status: 400 }
        );
      }
    }

    // Actualizar ruta
    const updatedRoute = await prisma.postRoute.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.slug && { slug: updateData.slug }),
        ...(updateData.description !== undefined && { description: updateData.description || null }),
        ...(updateData.categoryId && { categoryId: updateData.categoryId }),
      },
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
      },
    });

    return NextResponse.json(
      {
        message: 'Ruta actualizada exitosamente',
        route: {
          id: updatedRoute.id,
          name: updatedRoute.name,
          slug: updatedRoute.slug,
          description: updatedRoute.description,
          category: updatedRoute.category,
          author: updatedRoute.author,
          createdAt: updatedRoute.createdAt.toISOString(),
          updatedAt: updatedRoute.updatedAt.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating route:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al actualizar ruta',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/routes/[id]
 * Eliminar ruta (solo autor, cascade elimina items y progress)
 */
export async function DELETE(
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
          message: 'Debes estar autenticado para eliminar rutas',
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

    // Buscar ruta existente
    const existingRoute = await prisma.postRoute.findUnique({
      where: { id },
    });

    if (!existingRoute) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Ruta no encontrada',
        },
        { status: 404 }
      );
    }

    // Verificar autoría
    if (existingRoute.authorId !== user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'No tienes permiso para eliminar esta ruta',
        },
        { status: 403 }
      );
    }

    // Eliminar ruta (cascade eliminará items y progress automáticamente)
    await prisma.postRoute.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        message: 'Ruta eliminada exitosamente',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting route:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al eliminar ruta',
      },
      { status: 500 }
    );
  }
}






