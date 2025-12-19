import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';

/**
 * GET /api/posts/admin
 * Obtiene todos los posts (publicados y borradores) para el panel de administración
 * Requiere autenticación
 */
export async function GET(request: NextRequest) {
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

    // Obtener todos los posts (sin filtrar por published)
    const posts = await prisma.post.findMany({
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
        parentPost: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        associatedPosts: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            published: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Serializar fechas a strings ISO
    const serializedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      published: post.published,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString() ?? null,
      parentPostId: post.parentPostId,
      parentPost: post.parentPost ? {
        id: post.parentPost.id,
        title: post.parentPost.title,
        slug: post.parentPost.slug,
      } : null,
      associatedPosts: post.associatedPosts.map((ap) => ({
        id: ap.id,
        title: ap.title,
        slug: ap.slug,
        excerpt: ap.excerpt,
        published: ap.published,
        createdAt: ap.createdAt.toISOString(),
        updatedAt: ap.updatedAt.toISOString(),
      })),
      author: {
        id: post.author.id,
        name: post.author.name,
      },
      tags: post.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
      })),
      categories: post.categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      })),
      subcategories: post.subcategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        category: {
          id: sub.category.id,
          name: sub.category.name,
          slug: sub.category.slug,
        },
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
    console.error('Error fetching admin posts:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch posts',
      },
      { status: 500 }
    );
  }
}

