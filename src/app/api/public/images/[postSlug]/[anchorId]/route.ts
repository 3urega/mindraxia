import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';

/**
 * GET /api/public/images/[postSlug]/[anchorId]
 * Obtiene una imagen específica por postSlug y anchorId (público, solo posts publicados)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postSlug: string; anchorId: string }> }
) {
  try {
    const { postSlug, anchorId } = await params;
    const user = await getCurrentUser();

    // Validar parámetros
    if (!postSlug || !anchorId) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'postSlug y anchorId son requeridos',
        },
        { status: 400 }
      );
    }

    // Buscar el post por slug:
    // - Público: solo publicado
    // - Si hay sesión: permitir también borradores del propio autor
    const post = await prisma.post.findFirst({
      where: {
        slug: postSlug,
        ...(user
          ? {
              OR: [{ published: true }, { authorId: user.id }],
            }
          : { published: true }),
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Post no encontrado o no publicado',
        },
        { status: 404 }
      );
    }

    // Buscar la imagen por postId y anchorId
    const image = await prisma.image.findFirst({
      where: {
        postId: post.id,
        anchorId: anchorId,
      },
      select: {
        id: true,
        anchorId: true,
        url: true,
        alt: true,
        description: true,
        filename: true,
      },
    });

    if (!image) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Imagen no encontrada',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        url: image.url,
        alt: image.alt,
        description: image.description,
        anchorId: image.anchorId,
        filename: image.filename,
        postTitle: post.title,
        postSlug: post.slug,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch image',
      },
      { status: 500 }
    );
  }
}
