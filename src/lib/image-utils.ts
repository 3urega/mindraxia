import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Valida el tipo MIME de una imagen
 */
export function isValidImageType(mimeType: string): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml', // SVG permitido pero requiere precaución por seguridad
  ];
  return allowedTypes.includes(mimeType.toLowerCase());
}

/**
 * Valida el tamaño de una imagen (máximo 5MB)
 */
export function isValidImageSize(size: number): boolean {
  const maxSize = 5 * 1024 * 1024; // 5MB
  return size <= maxSize;
}

/**
 * Genera un nombre único para un archivo de imagen
 */
export function generateImageFilename(originalName: string): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const sanitizedName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .toLowerCase()
    .substring(0, 50);
  
  return `${timestamp}-${sanitizedName}.${extension}`;
}

/**
 * Guarda una imagen en el sistema de archivos
 */
export async function saveImage(
  postId: string,
  file: File
): Promise<{ filename: string; path: string; url: string }> {
  // Validar tipo
  if (!isValidImageType(file.type)) {
    throw new Error(`Tipo de archivo no permitido: ${file.type}`);
  }

  // Validar tamaño
  if (!isValidImageSize(file.size)) {
    throw new Error('El archivo es demasiado grande (máximo 5MB)');
  }

  // Generar nombre único
  const filename = generateImageFilename(file.name);
  
  // Crear directorio si no existe
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'posts', postId);
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  // Guardar archivo
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filePath = join(uploadDir, filename);
  await writeFile(filePath, buffer);

  // Generar URL pública
  const url = `/uploads/posts/${postId}/${filename}`;
  const path = `uploads/posts/${postId}/${filename}`;

  return { filename, path, url };
}

/**
 * Elimina una imagen del sistema de archivos
 */
export async function deleteImage(filePath: string): Promise<void> {
  const fullPath = join(process.cwd(), 'public', filePath);
  if (existsSync(fullPath)) {
    await unlink(fullPath);
  }
}

