import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';
import { saveImage, deleteImage } from '@/lib/image-utils';
import { z } from 'zod';

/**
 * GET /api/posts/[id]/images
 * Obtiene todas las imágenes de un post
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
          message: 'No tienes permiso para acceder a las imágenes de este post',
        },
        { status: 403 }
      );
    }

    // Obtener imágenes del post
    const images = await prisma.image.findMany({
      where: { postId: id },
      select: {
        id: true,
        anchorId: true,
        description: true,
        filename: true,
        originalName: true,
        url: true,
        alt: true,
        size: true,
        mimeType: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      {
        images: images.map((img) => ({
          id: img.id,
          anchorId: img.anchorId,
          description: img.description,
          filename: img.filename,
          originalName: img.originalName,
          url: img.url,
          alt: img.alt,
          size: img.size,
          mimeType: img.mimeType,
          postSlug: post.slug,
          createdAt: img.createdAt.toISOString(),
        })),
        postSlug: post.slug,
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

/**
 * POST /api/posts/[id]/images
 * Sube una nueva imagen para un post
 */
const uploadImageSchema = z.object({
  alt: z.string().optional(),
  anchorId: z.string().optional(),
  description: z.string().optional(),
});

export async function POST(
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
          message: 'Debes estar autenticado para subir imágenes',
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
          message: 'No tienes permiso para subir imágenes a este post',
        },
        { status: 403 }
      );
    }

    // Parsear FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const alt = formData.get('alt') as string | null;
    const anchorId = formData.get('anchorId') as string | null;
    const description = formData.get('description') as string | null;

    if (!file) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'No se proporcionó ningún archivo',
        },
        { status: 400 }
      );
    }

    // Validar y guardar imagen
    const { filename, path, url } = await saveImage(id, file);

    // Verificar si el anchorId ya existe (si se proporciona)
    if (anchorId) {
      const existingImage = await prisma.image.findUnique({
        where: {
          postId_anchorId: {
            postId: id,
            anchorId: anchorId.trim(),
          },
        },
      });

      if (existingImage) {
        // Eliminar archivo recién subido ya que el anchorId ya existe
        await deleteImage(path);
        return NextResponse.json(
          {
            error: 'Conflict',
            message: 'Ya existe una imagen con este anchorId en este post',
          },
          { status: 409 }
        );
      }
    }

    // Guardar metadatos en BD
    const image = await prisma.image.create({
      data: {
        postId: id,
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path,
        url,
        alt: alt || null,
        anchorId: anchorId?.trim() || null,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json(
      {
        id: image.id,
        anchorId: image.anchorId,
        description: image.description,
        filename: image.filename,
        originalName: image.originalName,
        url: image.url,
        alt: image.alt,
        size: image.size,
        mimeType: image.mimeType,
        postSlug: post.slug,
        createdAt: image.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error.message || 'Failed to upload image',
      },
      { status: 500 }
    );
  }
}

