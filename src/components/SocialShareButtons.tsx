'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SocialShareButtonsProps {
  title: string;
  url: string;
  description?: string;
  author?: string;
  date?: string;
}

export default function SocialShareButtons({ title, url, description, author, date }: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Construir URL completa
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
  const shareText = description || title;

  // Función para copiar enlace
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  // Función para descargar PDF
  const downloadPDF = async () => {
    if (typeof window === 'undefined') return;
    
    setDownloading(true);
    try {
      // Buscar el contenedor del contenido del post
      const contentElement = document.querySelector('[data-blog-content]');
      if (!contentElement) {
        console.error('No se encontró el contenido del post');
        setDownloading(false);
        return;
      }

      // Capturar el contenido como imagen
      const canvas = await html2canvas(contentElement as HTMLElement, {
        backgroundColor: '#1a1a2e',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Crear PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calcular dimensiones escaladas para que quepa en el ancho de la página
      const margin = 10;
      const contentWidth = pdfWidth - (margin * 2);
      const ratio = contentWidth / imgWidth;
      const imgScaledWidth = contentWidth;
      const imgScaledHeight = imgHeight * ratio;

      // Agregar título en la primera página
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text(title, pdfWidth / 2, margin, { align: 'center', maxWidth: contentWidth });
      
      let currentY = margin + 12;
      
      // Agregar línea separadora
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, currentY, pdfWidth - margin, currentY);
      currentY += 8;
      
      // Agregar metadatos
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100); // Color gris para metadatos
      
      if (author) {
        pdf.text(`Por: ${author}`, margin, currentY);
        currentY += 6;
      }
      
      if (date) {
        pdf.text(`Fecha de publicación: ${date}`, margin, currentY);
        currentY += 6;
      }
      
      // Agregar URL del post (puede ser largo, así que lo dividimos si es necesario)
      const urlText = `URL: ${fullUrl}`;
      const urlLines = pdf.splitTextToSize(urlText, contentWidth);
      pdf.text(urlLines, margin, currentY);
      currentY += urlLines.length * 5 + 4;
      
      // Agregar línea separadora después de metadatos
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, currentY, pdfWidth - margin, currentY);
      currentY += 8;
      
      // Restaurar color del texto para el contenido
      pdf.setTextColor(0, 0, 0);
      
      // Agregar descripción si existe
      if (description) {
        pdf.setFontSize(12);
        pdf.setFontStyle('italic');
        const descLines = pdf.splitTextToSize(description, contentWidth);
        pdf.text(descLines, pdfWidth / 2, currentY, { align: 'center', maxWidth: contentWidth });
        currentY += descLines.length * 6 + 6;
        pdf.setFontStyle('normal');
      }
      
      const titleSpace = currentY - margin + 5; // Espacio total usado para título y metadatos

      // Calcular cuántas páginas necesitamos
      const availableHeight = pdfHeight - margin - titleSpace;
      const totalPages = Math.ceil(imgScaledHeight / availableHeight);

      // Agregar la imagen dividida en páginas
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const yPosition = i === 0 ? margin + titleSpace : margin;
        const sourceY = (i * availableHeight) / ratio;
        const sourceHeight = Math.min(availableHeight / ratio, imgHeight - sourceY);
        const scaledHeight = sourceHeight * ratio;

        // Crear un canvas temporal para la porción de la imagen
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imgWidth;
        tempCanvas.height = sourceHeight;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);
          const tempImgData = tempCanvas.toDataURL('image/png');
          pdf.addImage(tempImgData, 'PNG', margin, yPosition, imgScaledWidth, scaledHeight);
        }
      }

      // Descargar el PDF
      const fileName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    } finally {
      setDownloading(false);
    }
  };

  // URLs de compartir para cada red social
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${fullUrl}`)}`,
  };

  const socialButtons = [
    {
      name: 'Twitter',
      href: shareLinks.twitter,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: 'hover:text-blue-400',
    },
    {
      name: 'Facebook',
      href: shareLinks.facebook,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      ),
      color: 'hover:text-blue-500',
    },
    {
      name: 'LinkedIn',
      href: shareLinks.linkedin,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      color: 'hover:text-blue-600',
    },
    {
      name: 'WhatsApp',
      href: shareLinks.whatsapp,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      ),
      color: 'hover:text-green-500',
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-muted">Compartir:</span>
        <div className="flex gap-2">
          {socialButtons.map((button) => (
            <a
              key={button.name}
              href={button.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors text-text-muted ${button.color} hover:bg-space-secondary`}
              style={{ borderColor: 'var(--border-glow)' }}
              title={`Compartir en ${button.name}`}
            >
              {button.icon}
            </a>
          ))}
          <button
            onClick={copyToClipboard}
            className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors text-text-muted hover:text-star-cyan hover:bg-space-secondary ${
              copied ? 'text-star-cyan' : ''
            }`}
            style={{ borderColor: 'var(--border-glow)' }}
            title="Copiar enlace"
          >
            {copied ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Botón de descargar PDF */}
      <div className="flex items-center gap-2">
        <button
          onClick={downloadPDF}
          disabled={downloading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm ${
            downloading
              ? 'text-text-muted cursor-not-allowed opacity-50'
              : 'text-text-muted hover:text-star-cyan hover:bg-space-secondary'
          }`}
          style={{ borderColor: 'var(--border-glow)' }}
          title="Descargar como PDF"
        >
          {downloading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Generando PDF...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Descargar PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

