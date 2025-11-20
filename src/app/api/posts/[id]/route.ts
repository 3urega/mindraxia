import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';
import { z } from 'zod';
import { syncPostEquations } from '@/lib/sync-equations';

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
      include: { tags: true },
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

    // Sincronizar ecuaciones si el contenido cambió
    if (updateData.content !== undefined) {
      try {
        await syncPostEquations(id, updateData.content);
      } catch (error) {
        console.error('Error syncing equations (non-fatal):', error);
        // No fallar la actualización del post si hay error sincronizando ecuaciones
      }
    }

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

