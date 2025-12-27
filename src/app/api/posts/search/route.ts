import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/posts/search
 * Busca posts por título (mínimo 3 caracteres, solo publicados)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    // Validar que el query tiene al menos 3 caracteres
    if (!query || query.length < 3) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'La búsqueda debe tener al menos 3 caracteres',
        },
        { status: 400 }
      );
    }

    // Buscar posts publicados cuyo título contenga el query
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        title: {
          contains: query,
          mode: 'insensitive', // Búsqueda case-insensitive
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
      },
      orderBy: {
        title: 'asc',
      },
      take: 50, // Limitar a 50 resultados
    });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error('Error searching posts:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al buscar posts',
      },
      { status: 500 }
    );
  }
}
