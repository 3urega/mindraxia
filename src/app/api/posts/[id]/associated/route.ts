import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';

/**
 * GET /api/posts/[id]/associated
 * Obtiene todos los posts asociados de un post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Verificar que el post existe
    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Post not found',
        },
        { status: 404 }
      );
    }

    // Obtener posts asociados
    const associatedPosts = await prisma.post.findMany({
      where: {
        parentPostId: id,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Serializar fechas
    const serializedPosts = associatedPosts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      published: post.published,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString() ?? null,
    }));

    return NextResponse.json(
      {
        posts: serializedPosts,
        count: serializedPosts.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching associated posts:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch associated posts',
      },
      { status: 500 }
    );
  }
}
