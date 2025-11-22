import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';
import { z } from 'zod';
import { syncPostEquations } from '@/lib/sync-equations';
import { syncPostImageAnchors } from '@/lib/sync-images';
import { syncPostDefinitions } from '@/lib/sync-definitions';
import { syncPostTheorems } from '@/lib/sync-theorems';

/**
 * GET /api/posts/[id]
 * Obtiene un post individual por ID (para admin, incluye borradores)
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
          message: 'Debes estar autenticado para acceder a esta ruta',
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validar que el ID existe
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid post ID',
        },
        { status: 400 }
      );
    }

    // Buscar post por ID (sin filtrar por published, para admin)
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // Si no se encuentra el post
    if (!post) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Post not found',
        },
        { status: 404 }
      );
    }

    // Serializar fechas a strings ISO
    const serializedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      published: post.published,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString() ?? null,
      author: post.author,
      tags: post.tags,
      categories: post.categories,
      subcategories: post.subcategories,
    };

    return NextResponse.json(serializedPost, { status: 200 });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch post',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/posts/[id]
 * Actualiza un post (requiere autenticación y ser autor)
 */
const updatePostSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones').optional(),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres').optional(),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  subcategoryIds: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

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
          message: 'Debes estar autenticado para actualizar posts',
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validar ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid post ID',
        },
        { status: 400 }
      );
    }

    // Buscar post existente
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { 
        tags: true,
        categories: true,
        subcategories: true,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Post not found',
        },
        { status: 404 }
      );
    }

    // Verificar autoría
    if (existingPost.authorId !== user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'No tienes permiso para editar este post',
        },
        { status: 403 }
      );
    }

    // Parsear y validar datos
    const body = await request.json();
    const validationResult = updatePostSchema.safeParse(body);

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

    // Si se actualiza el slug, verificar que no exista otro post con ese slug
    if (updateData.slug && updateData.slug !== existingPost.slug) {
      const slugExists = await prisma.post.findUnique({
        where: { slug: updateData.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          {
            error: 'Conflict',
            message: 'Ya existe un post con este slug',
          },
          { status: 409 }
        );
      }
    }

    // Preparar datos de actualización
    const dataToUpdate: any = {};
    if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
    if (updateData.slug !== undefined) dataToUpdate.slug = updateData.slug;
    if (updateData.content !== undefined) dataToUpdate.content = updateData.content;
    if (updateData.excerpt !== undefined) dataToUpdate.excerpt = updateData.excerpt || null;

    // Manejar published y publishedAt
    if (updateData.published !== undefined) {
      dataToUpdate.published = updateData.published;
      // Si se marca como publicado y no tiene publishedAt, establecerlo
      if (updateData.published && !existingPost.publishedAt) {
        dataToUpdate.publishedAt = new Date();
      }
      // Si se desmarca como publicado, mantener publishedAt (historial)
    }

    // Manejar tags
    let tagConnections: { id: string }[] = [];
    if (updateData.tags !== undefined) {
      tagConnections = await Promise.all(
        updateData.tags.map(async (tagName) => {
          const tagNameLower = tagName.toLowerCase().trim();
          const tag = await prisma.tag.upsert({
            where: { name: tagNameLower },
            update: {},
            create: { name: tagNameLower },
          });
          return { id: tag.id };
        })
      );
    }

    // Manejar categorías
    let categoryConnections: { id: string }[] = [];
    if (updateData.categoryIds !== undefined) {
      categoryConnections = (updateData.categoryIds || []).map((catId: string) => ({ id: catId }));
      if (categoryConnections.length > 0) {
        // Verificar que todas las categorías existen
        const existingCategories = await prisma.category.findMany({
          where: { id: { in: updateData.categoryIds || [] } },
        });
        if (existingCategories.length !== updateData.categoryIds?.length) {
          return NextResponse.json(
            {
              error: 'Bad Request',
              message: 'Una o más categorías no existen',
            },
            { status: 400 }
          );
        }
      }
    }

    // Manejar subcategorías
    let subcategoryConnections: { id: string }[] = [];
    if (updateData.subcategoryIds !== undefined) {
      subcategoryConnections = (updateData.subcategoryIds || []).map((subId: string) => ({ id: subId }));
      if (subcategoryConnections.length > 0) {
        // Verificar que todas las subcategorías existen
        const existingSubcategories = await prisma.subcategory.findMany({
          where: { id: { in: updateData.subcategoryIds || [] } },
        });
        if (existingSubcategories.length !== updateData.subcategoryIds?.length) {
          return NextResponse.json(
            {
              error: 'Bad Request',
              message: 'Una o más subcategorías no existen',
            },
            { status: 400 }
          );
        }
      }
    }

    // Actualizar el post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...dataToUpdate,
        ...(updateData.tags !== undefined && {
          tags: {
            set: tagConnections, // Reemplazar todos los tags
          },
        }),
        ...(updateData.categoryIds !== undefined && {
          categories: {
            set: categoryConnections, // Reemplazar todas las categorías
          },
        }),
        ...(updateData.subcategoryIds !== undefined && {
          subcategories: {
            set: subcategoryConnections, // Reemplazar todas las subcategorías
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Sincronizar ecuaciones, imágenes, definiciones y teoremas con anclas si el contenido cambió
    if (updateData.content !== undefined) {
      try {
        await syncPostEquations(id, updateData.content);
        await syncPostImageAnchors(id, updateData.content);
        await syncPostDefinitions(id, updateData.content);
        await syncPostTheorems(id, updateData.content);
      } catch (error) {
        console.error('Error syncing equations/images/definitions/theorems (non-fatal):', error);
        // No fallar la actualización del post si hay error sincronizando
      }
    }

    // Nota: revalidatePath no funciona en Route Handlers (API routes)
    // El caché se desactiva con cache: 'no-store' en la página

    // Serializar fechas
    const serializedPost = {
      id: updatedPost.id,
      title: updatedPost.title,
      slug: updatedPost.slug,
      excerpt: updatedPost.excerpt,
      content: updatedPost.content,
      published: updatedPost.published,
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
      publishedAt: updatedPost.publishedAt?.toISOString() ?? null,
      author: updatedPost.author,
      tags: updatedPost.tags,
      categories: updatedPost.categories,
      subcategories: updatedPost.subcategories,
    };

    return NextResponse.json(serializedPost, { status: 200 });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to update post',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[id]
 * Elimina un post (requiere autenticación y ser autor)
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
          message: 'Debes estar autenticado para eliminar posts',
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validar ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid post ID',
        },
        { status: 400 }
      );
    }

    // Buscar post existente
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Post not found',
        },
        { status: 404 }
      );
    }

    // Verificar autoría
    if (existingPost.authorId !== user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'No tienes permiso para eliminar este post',
        },
        { status: 403 }
      );
    }

    // Eliminar el post (cascade elimina relaciones automáticamente)
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        message: 'Post eliminado exitosamente',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to delete post',
      },
      { status: 500 }
    );
  }
}

