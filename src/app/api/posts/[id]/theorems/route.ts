import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';

/**
 * GET /api/posts/[id]/theorems
 * Obtiene todos los teoremas con anclas de un post
 * Útil para autocompletado en el editor
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

    // Buscar post y verificar autoría
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
        slug: true,
      },
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

    // Verificar autoría
    if (post.authorId !== user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'No tienes permiso para acceder a los teoremas de este post',
        },
        { status: 403 }
      );
    }

    // Obtener teoremas del post
    const theorems = await prisma.theorem.findMany({
      where: { postId: id },
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
        theorems: theorems.map((thm) => ({
          anchorId: thm.anchorId,
          description: thm.description,
          content: thm.content,
          number: thm.number,
          postSlug: post.slug,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching theorems:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch theorems',
      },
      { status: 500 }
    );
  }
}

