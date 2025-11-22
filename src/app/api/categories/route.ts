import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';
import { generateCategorySlug } from '@/lib/category-utils';

/**
 * GET /api/categories
 * Lista todas las categorías con sus subcategorías
 */
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Crea una nueva categoría (requiere autenticación)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Debes estar autenticado para crear categorías',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'El nombre de la categoría es requerido',
        },
        { status: 400 }
      );
    }

    // Generar slug único
    let slug = generateCategorySlug(name);
    let slugExists = await prisma.category.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${generateCategorySlug(name)}-${counter}`;
      slugExists = await prisma.category.findUnique({ where: { slug } });
      counter++;
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
      },
      include: {
        subcategories: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to create category',
      },
      { status: 500 }
    );
  }
}

