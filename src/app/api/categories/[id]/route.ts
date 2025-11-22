import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';
import { generateCategorySlug } from '@/lib/category-utils';

/**
 * GET /api/categories/[id]
 * Obtiene una categoría con sus subcategorías
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: {
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Categoría no encontrada',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch category',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/categories/[id]
 * Actualiza una categoría
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
          message: 'Debes estar autenticado para actualizar categorías',
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    // Verificar que la categoría existe
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Categoría no encontrada',
        },
        { status: 404 }
      );
    }

    // Generar slug si el nombre cambió
    let slug = existingCategory.slug;
    if (name && name.trim() !== existingCategory.name) {
      slug = generateCategorySlug(name);
      // Verificar que el nuevo slug no exista
      const slugExists = await prisma.category.findUnique({ where: { slug } });
      if (slugExists && slugExists.id !== id) {
        let counter = 1;
        let newSlug = `${slug}-${counter}`;
        while (await prisma.category.findUnique({ where: { slug: newSlug } })) {
          counter++;
          newSlug = `${slug}-${counter}`;
        }
        slug = newSlug;
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name?.trim() || existingCategory.name,
        slug,
        description: description !== undefined ? description?.trim() || null : existingCategory.description,
      },
      include: {
        subcategories: true,
      },
    });

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to update category',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id]
 * Elimina una categoría (solo si no tiene posts asociados)
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
          message: 'Debes estar autenticado para eliminar categorías',
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verificar que la categoría existe
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        posts: true,
        subcategories: {
          include: {
            posts: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Categoría no encontrada',
        },
        { status: 404 }
      );
    }

    // Validar que no tenga posts asociados
    if (category.posts.length > 0) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'No se puede eliminar una categoría que tiene posts asociados',
        },
        { status: 400 }
      );
    }

    // Validar que las subcategorías no tengan posts
    const subcategoriesWithPosts = category.subcategories.filter(
      (sub) => sub.posts.length > 0
    );
    if (subcategoriesWithPosts.length > 0) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'No se puede eliminar una categoría que tiene subcategorías con posts asociados',
        },
        { status: 400 }
      );
    }

    // Eliminar la categoría (las subcategorías se eliminarán en cascada)
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        message: 'Categoría eliminada correctamente',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to delete category',
      },
      { status: 500 }
    );
  }
}

