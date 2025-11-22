import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';
import { syncPostEquations } from '@/lib/sync-equations';
import { syncPostImageAnchors } from '@/lib/sync-images';
import { syncPostDefinitions } from '@/lib/sync-definitions';
import { syncPostTheorems } from '@/lib/sync-theorems';

/**
 * GET /api/posts
 * Obtiene la lista de posts publicados
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener posts publicados con relaciones
    const posts = await prisma.post.findMany({
      where: {
        published: true,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          publishedAt: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });

    // Serializar fechas a strings ISO
    const serializedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString() ?? null,
      author: {
        id: post.author.id,
        name: post.author.name,
      },
      tags: post.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
      })),
    }));

    return NextResponse.json(
      {
        posts: serializedPosts,
        count: serializedPosts.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch posts',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts
 * Crea un nuevo post (requiere autenticación)
 */
const createPostSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  published: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Debes estar autenticado para crear posts',
        },
        { status: 401 }
      );
    }

    // Parsear y validar datos
    const body = await request.json();
    const validationResult = createPostSchema.safeParse(body);

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

    const { title, slug, content, excerpt, tags, published } = validationResult.data;

    // Verificar si el slug ya existe
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'Ya existe un post con este slug',
        },
        { status: 409 }
      );
    }

    // Crear o encontrar tags
    const tagConnections = await Promise.all(
      (tags || []).map(async (tagName) => {
        const tagNameLower = tagName.toLowerCase().trim();
        const tag = await prisma.tag.upsert({
          where: { name: tagNameLower },
          update: {},
          create: { name: tagNameLower },
        });
        return { id: tag.id };
      })
    );

    // Crear el post
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        published,
        publishedAt: published ? new Date() : null,
        authorId: user.id,
        tags: {
          connect: tagConnections,
        },
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

    // Sincronizar ecuaciones, imágenes, definiciones y teoremas con anclas del post
    try {
      await syncPostEquations(post.id, content);
      await syncPostImageAnchors(post.id, content);
      await syncPostDefinitions(post.id, content);
      await syncPostTheorems(post.id, content);
    } catch (error) {
      console.error('Error syncing equations/images/definitions/theorems (non-fatal):', error);
      // No fallar la creación del post si hay error sincronizando
    }

    // Nota: revalidatePath no funciona en Route Handlers (API routes)
    // El caché se desactiva con cache: 'no-store' en la página

    // Serializar fechas
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

    return NextResponse.json(serializedPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to create post',
      },
      { status: 500 }
    );
  }
}

