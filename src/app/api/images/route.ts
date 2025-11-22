import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';

/**
 * GET /api/images
 * Obtiene todas las imágenes con anclas de todos los posts publicados
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

    // Construir query para imágenes
    const whereClause: any = {
      post: {
        published: true, // Solo posts publicados
      },
      anchorId: {
        not: null, // Solo imágenes con anclas
      },
    };

    // Si se especifica un postSlug, filtrar por él
    if (postSlug) {
      whereClause.post.slug = postSlug;
    }

    // Obtener imágenes con información del post
    const images = await prisma.image.findMany({
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
          createdAt: 'desc',
        },
      ],
    });

    // Filtrar por búsqueda si se proporciona
    let filteredImages = images;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredImages = images.filter(
        (img) =>
          img.anchorId?.toLowerCase().includes(searchLower) ||
          img.description?.toLowerCase().includes(searchLower) ||
          img.originalName.toLowerCase().includes(searchLower) ||
          img.alt?.toLowerCase().includes(searchLower) ||
          img.post.title.toLowerCase().includes(searchLower) ||
          img.post.slug.toLowerCase().includes(searchLower)
      );
    }

    // Serializar resultados
    const result = filteredImages.map((img) => ({
      id: img.id,
      anchorId: img.anchorId,
      description: img.description,
      originalName: img.originalName,
      url: img.url,
      alt: img.alt,
      postSlug: img.post.slug,
      postTitle: img.post.title,
      postId: img.post.id,
    }));

    return NextResponse.json(
      {
        images: result,
        count: result.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch images',
      },
      { status: 500 }
    );
  }
}

