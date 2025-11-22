import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';

/**
 * GET /api/definitions
 * Obtiene todas las definiciones de todos los posts publicados
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

    // Construir query para definiciones
    const whereClause: any = {
      post: {
        published: true, // Solo posts publicados
      },
    };

    // Si se especifica un postSlug, filtrar por él
    if (postSlug) {
      whereClause.post.slug = postSlug;
    }

    // Obtener definiciones con información del post
    const definitions = await prisma.definition.findMany({
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
            createdAt: 'desc', // Usar createdAt en lugar de publishedAt que puede ser null
          },
        },
        {
          number: 'asc',
        },
      ],
    });

    // Filtrar por búsqueda si se proporciona
    let filteredDefinitions = definitions;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDefinitions = definitions.filter(
        (def) =>
          def.anchorId.toLowerCase().includes(searchLower) ||
          def.description?.toLowerCase().includes(searchLower) ||
          def.content.toLowerCase().includes(searchLower) ||
          def.post.title.toLowerCase().includes(searchLower) ||
          def.post.slug.toLowerCase().includes(searchLower)
      );
    }

    // Serializar resultados
    const result = filteredDefinitions.map((def) => ({
      anchorId: def.anchorId,
      description: def.description,
      content: def.content,
      number: def.number,
      postSlug: def.post.slug,
      postTitle: def.post.title,
      postId: def.post.id,
    }));

    return NextResponse.json(
      {
        definitions: result,
        count: result.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching definitions:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error?.message || 'Failed to fetch definitions',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}

