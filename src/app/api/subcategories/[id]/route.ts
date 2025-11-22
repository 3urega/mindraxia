import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';
import { generateSubcategorySlug } from '@/lib/category-utils';

/**
 * GET /api/subcategories/[id]
 * Obtiene una subcategoría
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
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

    if (!subcategory) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Subcategoría no encontrada',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(subcategory, { status: 200 });
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch subcategory',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/subcategories/[id]
 * Actualiza una subcategoría
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
          message: 'Debes estar autenticado para actualizar subcategorías',
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, categoryId } = body;

    // Verificar que la subcategoría existe
    const existingSubcategory = await prisma.subcategory.findUnique({
      where: { id },
    });

    if (!existingSubcategory) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Subcategoría no encontrada',
        },
        { status: 404 }
      );
    }

    // Si se cambia la categoría padre, verificar que existe
    if (categoryId && categoryId !== existingSubcategory.categoryId) {
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
    }

    // Generar slug si el nombre cambió
    let slug = existingSubcategory.slug;
    if (name && name.trim() !== existingSubcategory.name) {
      slug = generateSubcategorySlug(name);
      // Verificar que el nuevo slug no exista
      const slugExists = await prisma.subcategory.findUnique({ where: { slug } });
      if (slugExists && slugExists.id !== id) {
        let counter = 1;
        let newSlug = `${slug}-${counter}`;
        while (await prisma.subcategory.findUnique({ where: { slug: newSlug } })) {
          counter++;
          newSlug = `${slug}-${counter}`;
        }
        slug = newSlug;
      }
    }

    const subcategory = await prisma.subcategory.update({
      where: { id },
      data: {
        name: name?.trim() || existingSubcategory.name,
        slug,
        description: description !== undefined ? description?.trim() || null : existingSubcategory.description,
        categoryId: categoryId || existingSubcategory.categoryId,
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

    return NextResponse.json(subcategory, { status: 200 });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to update subcategory',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subcategories/[id]
 * Elimina una subcategoría (solo si no tiene posts asociados)
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
          message: 'Debes estar autenticado para eliminar subcategorías',
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verificar que la subcategoría existe
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
      include: {
        posts: true,
      },
    });

    if (!subcategory) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Subcategoría no encontrada',
        },
        { status: 404 }
      );
    }

    // Validar que no tenga posts asociados
    if (subcategory.posts.length > 0) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'No se puede eliminar una subcategoría que tiene posts asociados',
        },
        { status: 400 }
      );
    }

    // Eliminar la subcategoría
    await prisma.subcategory.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        message: 'Subcategoría eliminada correctamente',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to delete subcategory',
      },
      { status: 500 }
    );
  }
}

