import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';

/**
 * GET /api/routes
 * Listar todas las rutas públicas
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categorySlug = searchParams.get('category');

    const where: any = {};

    // Filtrar por categoría si se especifica
    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        where.categoryId = category.id;
      }
    }

    const routes = await prisma.postRoute.findMany({
      where,
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
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const serializedRoutes = routes.map((route) => ({
      id: route.id,
      name: route.name,
      slug: route.slug,
      description: route.description,
      category: route.category,
      author: route.author,
      postCount: route.items.length,
      createdAt: route.createdAt.toISOString(),
      updatedAt: route.updatedAt.toISOString(),
    }));

    return NextResponse.json({ routes: serializedRoutes }, { status: 200 });
  } catch (error) {
    console.error('Error fetching routes:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al obtener rutas',
      },
      { status: 500 }
    );
  }
}

const createRouteSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones').optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'La categoría es requerida'),
});

/**
 * POST /api/routes
 * Crear nueva ruta (requiere autenticación)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Debes estar autenticado para crear rutas',
        },
        { status: 401 }
      );
    }

    // Parsear y validar datos
    const body = await request.json();
    const validationResult = createRouteSchema.safeParse(body);

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

    const { name, slug, description, categoryId } = validationResult.data;

    // Generar slug si no se proporciona
    const finalSlug = slug || generateSlug(name);

    // Verificar que el slug no existe
    const existingRoute = await prisma.postRoute.findUnique({
      where: { slug: finalSlug },
    });

    if (existingRoute) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'Ya existe una ruta con este slug',
        },
        { status: 409 }
      );
    }

    // Verificar que la categoría existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
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

    // Crear la ruta
    const route = await prisma.postRoute.create({
      data: {
        name,
        slug: finalSlug,
        description: description || null,
        categoryId,
        authorId: user.id,
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
        message: 'Ruta creada exitosamente',
        route: {
          id: route.id,
          name: route.name,
          slug: route.slug,
          description: route.description,
          category: route.category,
          author: route.author,
          createdAt: route.createdAt.toISOString(),
          updatedAt: route.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating route:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al crear ruta',
      },
      { status: 500 }
    );
  }
}



