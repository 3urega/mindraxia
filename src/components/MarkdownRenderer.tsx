'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {
  extractAnchors,
  extractReferences,
  preprocessAnchors,
  getAnchorHtmlId,
} from '@/lib/markdown-anchors';
import {
  extractImageAnchors,
  extractImageReferences,
  getImageAnchorHtmlId,
  preprocessImageAnchors,
} from '@/lib/image-anchors';
import EquationAnchor from './EquationAnchor';
import EquationReference from './EquationReference';
import ImageAnchor from './ImageAnchor';
import ImageReference from './ImageReference';

interface MarkdownRendererProps {
  content: string;
  currentSlug?: string; // Slug del post actual para referencias relativas
}

export default function MarkdownRenderer({
  content,
  currentSlug,
}: MarkdownRendererProps) {
  // Preprocesar contenido: extraer anclas y referencias ANTES de modificar el contenido
  const anchors = extractAnchors(content);
  const references = extractReferences(content);
  const imageAnchors = extractImageAnchors(content);
  const imageReferences = extractImageReferences(content);
  
  // Crear mapas de anclas por ID para acceso rápido
  const anchorsMap = new Map(anchors.map(a => [a.anchorId, a]));
  const imageAnchorsMap = new Map(imageAnchors.map(a => [a.anchorId, a]));
  
  // Preprocesar markdown: convertir ecuaciones e imágenes con anclas
  let processedContent = preprocessAnchors(content);
  processedContent = preprocessImageAnchors(processedContent);
  
  // Crear mapas de referencias para acceso rápido durante el renderizado
  const referencesMap = new Map(
    references.map((ref, index) => [
      ref.fullMatch,
      {
        anchorId: ref.anchorId,
        postSlug: ref.postSlug,
        linkText: ref.linkText,
      },
    ])
  );
  
  const imageReferencesMap = new Map(
    imageReferences.map((ref, index) => [
      ref.fullMatch,
      {
        anchorId: ref.anchorId,
        postSlug: ref.postSlug,
        linkText: ref.linkText,
      },
    ])
  );

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Estilos personalizados para elementos markdown
          h1: ({ node, ...props }) => (
            <h1 className="text-4xl font-bold text-text-primary mb-4 mt-8" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-3xl font-bold text-text-primary mb-3 mt-6" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-2xl font-semibold text-text-primary mb-2 mt-4" {...props} />
          ),
          p: ({ node, children, ...props }: any) => {
            // Procesar children para detectar referencias (ecuaciones e imágenes)
            const processChildren = (children: any): any => {
              if (typeof children === 'string') {
                // Buscar referencias en el texto (ecuaciones e imágenes)
                const parts: any[] = [];
                let lastIndex = 0;
                let match;
                
                // Regex combinado para referencias de ecuaciones e imágenes
                const refRegex = /\{\{(eq|img):([^}|]+)\|([^}]+)\}\}/g;
                
                while ((match = refRegex.exec(children)) !== null) {
                  // Añadir texto antes de la referencia
                  if (match.index > lastIndex) {
                    parts.push(children.substring(lastIndex, match.index));
                  }
                  
                  // Procesar la referencia
                  const [, refType, path, linkText] = match;
                  const pathParts = path.split('/');
                  const anchorId = pathParts.length === 2 ? pathParts[1].trim() : pathParts[0].trim();
                  const postSlug = pathParts.length === 2 ? pathParts[0].trim() : undefined;
                  
                  if (refType === 'eq') {
                    parts.push(
                      <EquationReference
                        key={`eq-ref-${match.index}`}
                        anchorId={anchorId}
                        postSlug={postSlug}
                        linkText={linkText.trim()}
                        currentSlug={currentSlug}
                      />
                    );
                  } else if (refType === 'img') {
                    parts.push(
                      <ImageReference
                        key={`img-ref-${match.index}`}
                        anchorId={anchorId}
                        postSlug={postSlug}
                        linkText={linkText.trim()}
                        currentSlug={currentSlug}
                      />
                    );
                  }
                  
                  lastIndex = match.index + match[0].length;
                }
                
                // Añadir texto restante
                if (lastIndex < children.length) {
                  parts.push(children.substring(lastIndex));
                }
                
                return parts.length > 0 ? parts : children;
              }
              
              if (Array.isArray(children)) {
                return children.map((child, index) => (
                  <span key={index}>{processChildren(child)}</span>
                ));
              }
              
              return children;
            };
            
            const processedChildren = processChildren(children);
            
            return (
              <p className="text-text-secondary mb-4 leading-relaxed" {...props}>
                {processedChildren}
              </p>
            );
          },
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4 text-text-secondary space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4 text-text-secondary space-y-2" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-4" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="px-2 py-1 rounded bg-space-primary text-star-cyan text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            
            // Detectar si es un bloque de código especial para ecuaciones con anclas
            // El formato es: ```math-anchor:anchorId
            const language = className?.replace('language-', '') || '';
            const anchorMatch = language.match(/^math-anchor:(.+)$/);
            
            if (anchorMatch && currentSlug) {
              const anchorId = anchorMatch[1];
              const anchor = anchorsMap.get(anchorId);
              
              if (anchor) {
                // El contenido del código es la ecuación LaTeX (sin los $$)
                const equationContent = String(children?.[0] || '').trim();
                
                // Renderizar la ecuación con KaTeX
                let renderedEquation = '';
                try {
                  renderedEquation = katex.renderToString(equationContent, {
                    displayMode: true,
                    throwOnError: false,
                  });
                } catch (error) {
                  console.error('Error rendering equation:', error);
                  renderedEquation = `<span class="text-red-500">Error rendering equation: ${equationContent}</span>`;
                }
                
                return (
                  <EquationAnchor
                    anchorId={anchorId}
                    description={anchor.description}
                    postSlug={currentSlug}
                  >
                    <div 
                      className="katex-display"
                      dangerouslySetInnerHTML={{
                        __html: renderedEquation,
                      }}
                    />
                  </EquationAnchor>
                );
              }
            }
            
            return (
              <code
                className="block p-4 rounded-lg bg-space-primary text-text-secondary text-sm font-mono overflow-x-auto mb-4"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }) => (
            <pre className="mb-4" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 pl-4 italic text-text-muted mb-4"
              style={{ borderColor: 'var(--border-glow)' }}
              {...props}
            />
          ),
          img: ({ node, src, alt, ...props }: any) => {
            // Detectar si es una imagen con ancla
            const anchorId = props['data-img-anchor'];
            const description = props['data-img-desc'];
            
            if (anchorId && currentSlug) {
              const imageAnchor = imageAnchorsMap.get(anchorId);
              
              if (imageAnchor) {
                return (
                  <ImageAnchor
                    anchorId={anchorId}
                    description={description || imageAnchor.description}
                    imageUrl={src || imageAnchor.imageUrl}
                    alt={alt || imageAnchor.altText}
                    postSlug={currentSlug}
                  />
                );
              }
            }
            
            // Imagen normal sin ancla
            return (
              <img
                src={src}
                alt={alt || ''}
                className="w-full h-auto rounded-lg my-4"
                loading="lazy"
                {...props}
              />
            );
          },
          a: ({ node, href, className, ...props }: any) => {
            // Detectar si es una referencia a ecuación o imagen
            if (className === 'equation-reference' || href?.includes('#eq-')) {
              const anchorId = props['data-anchor'];
              const postSlug = props['data-post'];
              
              if (anchorId) {
                return (
                  <EquationReference
                    anchorId={anchorId}
                    postSlug={postSlug || undefined}
                    linkText={props.children as string}
                    currentSlug={currentSlug}
                  />
                );
              }
            }
            
            if (href?.includes('#img-')) {
              // Es una referencia a imagen, ya procesada en el componente p
              return <a href={href} {...props} />;
            }
            
            // Enlaces normales
            return (
              <a
                className="text-star-cyan hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                href={href}
                {...props}
              />
            );
          },
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-text-primary" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic" {...props} />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

