import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';

/**
 * GET /api/equations
 * Obtiene todas las ecuaciones de todos los posts publicados
 * Útil para referencias cruzadas entre posts
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

    // Obtener query params para filtros opcionales
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const postSlug = searchParams.get('postSlug'); // Filtrar por post específico

    // Construir query para ecuaciones
    const whereClause: any = {
      post: {
        published: true, // Solo posts publicados
      },
    };

    // Si se especifica un postSlug, filtrar por él
    if (postSlug) {
      whereClause.post.slug = postSlug;
    }

    // Obtener ecuaciones con información del post
    const equations = await prisma.equation.findMany({
      where: whereClause,
      include: {
        post: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
      orderBy: [
        {
          post: {
            publishedAt: 'desc',
          },
        },
        {
          createdAt: 'asc',
        },
      ],
    });

    // Filtrar por búsqueda si se proporciona
    let filteredEquations = equations;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEquations = equations.filter(
        (eq) =>
          eq.anchorId.toLowerCase().includes(searchLower) ||
          eq.description?.toLowerCase().includes(searchLower) ||
          eq.equation.toLowerCase().includes(searchLower) ||
          eq.post.title.toLowerCase().includes(searchLower) ||
          eq.post.slug.toLowerCase().includes(searchLower)
      );
    }

    // Serializar resultados
    const result = filteredEquations.map((eq) => ({
      anchorId: eq.anchorId,
      description: eq.description,
      equation: eq.equation,
      postSlug: eq.post.slug,
      postTitle: eq.post.title,
      postId: eq.post.id,
    }));

    return NextResponse.json(
      {
        equations: result,
        count: result.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching equations:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch equations',
      },
      { status: 500 }
    );
  }
}

