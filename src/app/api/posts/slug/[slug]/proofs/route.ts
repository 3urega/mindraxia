import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/posts/slug/[slug]/proofs
 * Obtiene todas las demostraciones de un post publicado por slug (público)
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
      select: {
        id: true,
        slug: true,
        title: true,
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

    // Obtener demostraciones del post
    const proofs = await prisma.proof.findMany({
      where: { postId: post.id },
      select: {
        id: true,
        anchorId: true,
        description: true,
        content: true,
        number: true,
      },
      orderBy: {
        number: 'asc',
      },
    });

    return NextResponse.json(
      {
        proofs: proofs.map((prf) => ({
          anchorId: prf.anchorId,
          description: prf.description,
          content: prf.content,
          number: prf.number,
          postSlug: post.slug,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching proofs:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch proofs',
      },
      { status: 500 }
    );
  }
}



