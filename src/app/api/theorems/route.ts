import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';

/**
 * GET /api/theorems
 * Obtiene todos los teoremas de todos los posts publicados
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

    // Construir query para teoremas
    const whereClause: any = {
      post: {
        published: true, // Solo posts publicados
      },
    };

    // Si se especifica un postSlug, filtrar por él
    if (postSlug) {
      whereClause.post.slug = postSlug;
    }

    // Obtener teoremas con información del post
    const theorems = await prisma.theorem.findMany({
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
          number: 'asc',
        },
      ],
    });

    // Filtrar por búsqueda si se proporciona
    let filteredTheorems = theorems;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTheorems = theorems.filter(
        (thm) =>
          thm.anchorId.toLowerCase().includes(searchLower) ||
          thm.description?.toLowerCase().includes(searchLower) ||
          thm.content.toLowerCase().includes(searchLower) ||
          thm.post.title.toLowerCase().includes(searchLower) ||
          thm.post.slug.toLowerCase().includes(searchLower)
      );
    }

    // Serializar resultados
    const result = filteredTheorems.map((thm) => ({
      anchorId: thm.anchorId,
      description: thm.description,
      content: thm.content,
      number: thm.number,
      postSlug: thm.post.slug,
      postTitle: thm.post.title,
      postId: thm.post.id,
    }));

    return NextResponse.json(
      {
        theorems: result,
        count: result.length,
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

