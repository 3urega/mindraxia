'use client';

import { useState, useRef, DragEvent } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  postId: string;
  onSelect: (url: string, alt: string, anchorId?: string, description?: string) => void;
  onClose: () => void;
}

export default function ImageUploader({
  postId,
  onSelect,
  onClose,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [alt, setAlt] = useState('');
  const [anchorId, setAnchorId] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo es demasiado grande (máximo 5MB)');
      return;
    }

    // Guardar el archivo en el estado
    setSelectedFile(file);
    setError(null);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor selecciona una imagen');
      return;
    }

    if (!alt.trim()) {
      setError('Por favor completa el texto alternativo');
      return;
    }

    const file = selectedFile;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt', alt);
      if (anchorId) formData.append('anchorId', anchorId);
      if (description) formData.append('description', description);

      const response = await fetch(`/api/posts/${postId}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al subir la imagen');
      }

      const data = await response.json();
      
      // Insertar en markdown
      let markdownText = '';
      if (anchorId) {
        if (description) {
          markdownText = `![${alt}](${data.url}){#img:${anchorId}|descripción: ${description}}`;
        } else {
          markdownText = `![${alt}](${data.url}){#img:${anchorId}}`;
        }
      } else {
        markdownText = `![${alt}](${data.url})`;
      }

      onSelect(data.url, alt, anchorId || undefined, description || undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al subir la imagen');
      setUploading(false);
    }
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // Actualizar el input file
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
      }
      handleFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-lg border overflow-hidden flex flex-col"
        style={{
          borderColor: 'var(--border-glow)',
          backgroundColor: 'var(--space-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-glow)' }}>
          <h3 className="text-lg font-semibold text-text-primary">
            Insertar Imagen
          </h3>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-star-cyan bg-star-cyan/10'
                : 'border-text-muted hover:border-star-cyan'
            }`}
          >
            {preview ? (
              <div className="space-y-4">
                <div className="relative w-full max-w-md mx-auto aspect-video">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPreview(null);
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-sm text-text-muted hover:text-text-primary"
                >
                  Cambiar imagen
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-text-secondary">
                  Arrastra una imagen aquí o haz clic para seleccionar
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 rounded-lg border transition-colors hover:bg-space-secondary hover:text-star-cyan"
                  style={{ borderColor: 'var(--border-glow)' }}
                >
                  Seleccionar archivo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Texto alternativo (alt) *
              </label>
              <input
                type="text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Describe la imagen para accesibilidad"
                className="w-full px-4 py-2 rounded-lg border bg-space-secondary text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20"
                style={{ borderColor: 'var(--border-glow)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                ID de ancla (opcional, para referencias)
              </label>
              <input
                type="text"
                value={anchorId}
                onChange={(e) => setAnchorId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="mi-imagen-diagrama"
                className="w-full px-4 py-2 rounded-lg border bg-space-secondary text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20 font-mono text-sm"
                style={{ borderColor: 'var(--border-glow)' }}
              />
              <p className="mt-1 text-xs text-text-muted">
                Solo letras minúsculas, números y guiones
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Descripción (opcional, para búsquedas con IA)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción de la imagen para futuras búsquedas con IA"
                rows={3}
                className="w-full px-4 py-2 rounded-lg border bg-space-secondary text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20 resize-none"
                style={{ borderColor: 'var(--border-glow)' }}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-4 border-t" style={{ borderColor: 'var(--border-glow)' }}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="px-4 py-2 rounded-lg border transition-colors hover:bg-space-secondary text-text-secondary"
            style={{ borderColor: 'var(--border-glow)' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleUpload();
            }}
            disabled={uploading || !selectedFile || !alt.trim()}
            className="px-4 py-2 rounded-lg bg-star-cyan text-space-dark font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80"
          >
            {uploading ? 'Subiendo...' : 'Insertar'}
          </button>
        </div>
      </div>
    </div>
  );
}

