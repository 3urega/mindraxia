import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';
import { generateSubcategorySlug } from '@/lib/category-utils';

/**
 * GET /api/subcategories
 * Lista todas las subcategorías (opcionalmente filtradas por categoría)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const where = categoryId ? { categoryId } : {};

    const subcategories = await prisma.subcategory.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(subcategories, { status: 200 });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch subcategories',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subcategories
 * Crea una nueva subcategoría (requiere autenticación y categoryId)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Debes estar autenticado para crear subcategorías',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, categoryId } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'El nombre de la subcategoría es requerido',
        },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'El ID de la categoría padre es requerido',
        },
        { status: 400 }
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
          message: 'La categoría padre no existe',
        },
        { status: 400 }
      );
    }

    // Generar slug único
    let slug = generateSubcategorySlug(name);
    let slugExists = await prisma.subcategory.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSubcategorySlug(name)}-${counter}`;
      slugExists = await prisma.subcategory.findUnique({ where: { slug } });
      counter++;
    }

    const subcategory = await prisma.subcategory.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        categoryId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(subcategory, { status: 201 });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to create subcategory',
      },
      { status: 500 }
    );
  }
}

