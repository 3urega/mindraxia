import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/posts/slug/[slug]
 * Obtiene un post individual por slug (público, solo posts publicados)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Validar que el slug existe
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid slug parameter',
        },
        { status: 400 }
      );
    }

    // Buscar post por slug y verificar que esté publicado
    const post = await prisma.post.findFirst({
      where: {
        slug: slug,
        published: true,
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

    // Si no se encuentra el post o no está publicado
    if (!post) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Post not found or not published',
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
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString() ?? null,
      author: {
        id: post.author.id,
        name: post.author.name,
        email: post.author.email,
      },
      tags: post.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
      })),
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

