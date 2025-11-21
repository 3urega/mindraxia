import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';
import { deleteImage } from '@/lib/image-utils';

/**
 * DELETE /api/posts/[id]/images/[imageId]
 * Elimina una imagen de un post
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Debes estar autenticado para eliminar imágenes',
        },
        { status: 401 }
      );
    }

    const { id, imageId } = await params;

    // Validar IDs
    if (!id || typeof id !== 'string' || !imageId || typeof imageId !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid post ID or image ID',
        },
        { status: 400 }
      );
    }

    // Buscar imagen
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      include: {
        post: {
          select: {
            id: true,
            authorId: true,
          },
        },
      },
    });

    if (!image) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Image not found',
        },
        { status: 404 }
      );
    }

    // Verificar que la imagen pertenece al post
    if (image.postId !== id) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Image does not belong to this post',
        },
        { status: 400 }
      );
    }

    // Verificar autoría
    if (image.post.authorId !== user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'No tienes permiso para eliminar esta imagen',
        },
        { status: 403 }
      );
    }

    // Eliminar archivo del sistema de archivos
    try {
      await deleteImage(image.path);
    } catch (error) {
      console.error('Error deleting image file:', error);
      // Continuar aunque falle la eliminación del archivo
    }

    // Eliminar registro de la BD
    await prisma.image.delete({
      where: { id: imageId },
    });

    return NextResponse.json(
      {
        message: 'Imagen eliminada exitosamente',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to delete image',
      },
      { status: 500 }
    );
  }
}

