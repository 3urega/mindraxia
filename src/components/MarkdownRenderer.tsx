'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useFontSize, useFontFamily, type FontSize, type FontFamily } from './FontSizeSelector';
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
import {
  extractDefinitionAnchors,
  extractDefinitionReferences,
  preprocessDefinitionAnchors,
} from '@/lib/definition-anchors';
import {
  extractTheoremAnchors,
  extractTheoremReferences,
  preprocessTheoremAnchors,
} from '@/lib/theorem-anchors';
import EquationAnchor from './EquationAnchor';
import EquationReference from './EquationReference';
import ImageAnchor from './ImageAnchor';
import ImageReference from './ImageReference';
import DefinitionAnchor from './DefinitionAnchor';
import DefinitionReference from './DefinitionReference';
import TheoremAnchor from './TheoremAnchor';
import TheoremReference from './TheoremReference';

interface MarkdownRendererProps {
  content: string;
  currentSlug?: string; // Slug del post actual para referencias relativas
}

export default function MarkdownRenderer({
  content,
  currentSlug,
}: MarkdownRendererProps) {
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [fontFamily, setFontFamily] = useState<FontFamily>('sans-serif');
  
  useEffect(() => {
    // Cargar preferencias iniciales desde localStorage
    if (typeof window !== 'undefined') {
      const savedSize = localStorage.getItem('blog-font-size');
      if (savedSize && (savedSize === 'small' || savedSize === 'normal' || savedSize === 'large')) {
        setFontSize(savedSize);
      }
      
      const savedFamily = localStorage.getItem('blog-font-family');
      if (savedFamily && (savedFamily === 'roboto' || savedFamily === 'sans-serif' || savedFamily === 'montserrat')) {
        setFontFamily(savedFamily);
      }
    }
    
    // Escuchar cambios de tamaño de fuente
    const handleFontSizeChange = (e: CustomEvent<FontSize>) => {
      setFontSize(e.detail);
    };
    
    // Escuchar cambios de familia de fuente
    const handleFontFamilyChange = (e: CustomEvent<FontFamily>) => {
      setFontFamily(e.detail);
    };
    
    window.addEventListener('fontSizeChanged', handleFontSizeChange as EventListener);
    window.addEventListener('fontFamilyChanged', handleFontFamilyChange as EventListener);
    
    return () => {
      window.removeEventListener('fontSizeChanged', handleFontSizeChange as EventListener);
      window.removeEventListener('fontFamilyChanged', handleFontFamilyChange as EventListener);
    };
  }, []);
  // Preprocesar contenido: extraer anclas y referencias ANTES de modificar el contenido
  const anchors = extractAnchors(content);
  const references = extractReferences(content);
  const imageAnchors = extractImageAnchors(content);
  const imageReferences = extractImageReferences(content);
  const definitionAnchors = extractDefinitionAnchors(content);
  const definitionReferences = extractDefinitionReferences(content);
  const theoremAnchors = extractTheoremAnchors(content);
  const theoremReferences = extractTheoremReferences(content);
  
  // Crear mapas de anclas por ID para acceso rápido, con números basados en orden de aparición
  const anchorsMap = new Map(
    anchors.map((eq, index) => [eq.anchorId, { ...eq, number: index + 1 }])
  );
  const imageAnchorsMap = new Map(imageAnchors.map(a => [a.anchorId, a]));
  
  // Crear mapas de definiciones y teoremas con números basados en orden de aparición
  const definitionAnchorsMap = new Map(
    definitionAnchors.map((def, index) => [def.anchorId, { ...def, number: index + 1 }])
  );
  const theoremAnchorsMap = new Map(
    theoremAnchors.map((thm, index) => [thm.anchorId, { ...thm, number: index + 1 }])
  );
  
  // Preprocesar markdown: convertir ecuaciones, imágenes, definiciones y teoremas con anclas
  let processedContent = preprocessAnchors(content);
  processedContent = preprocessImageAnchors(processedContent);
  processedContent = preprocessDefinitionAnchors(processedContent);
  processedContent = preprocessTheoremAnchors(processedContent);
  
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
  
  const definitionReferencesMap = new Map(
    definitionReferences.map((ref) => [
      ref.fullMatch,
      {
        anchorId: ref.anchorId,
        postSlug: ref.postSlug,
        linkText: ref.linkText,
      },
    ])
  );
  
  const theoremReferencesMap = new Map(
    theoremReferences.map((ref) => [
      ref.fullMatch,
      {
        anchorId: ref.anchorId,
        postSlug: ref.postSlug,
        linkText: ref.linkText,
      },
    ])
  );

  // Obtener clases de tamaño y familia de fuente
  const fontSizeClass = fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base';
  const fontFamilyClass = fontFamily === 'roboto' 
    ? '' 
    : fontFamily === 'montserrat' 
    ? '' 
    : 'font-sans';
  
  const fontFamilyStyle = fontFamily === 'montserrat' 
    ? { fontFamily: 'var(--font-montserrat), sans-serif' } 
    : fontFamily === 'roboto'
    ? { fontFamily: 'var(--font-roboto), sans-serif' }
    : {};

  // Componentes personalizados para ReactMarkdown (reutilizables para definiciones y teoremas)
  const markdownComponents = {
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
                
                // Regex combinado para referencias de ecuaciones, imágenes, definiciones y teoremas
                // Captura el tercer parámetro opcional (embed)
                const refRegex = /\{\{(eq|img|def|thm):([^}|]+)\|([^}|]+)(?:\|([^}]+))?\}\}/g;
                
                while ((match = refRegex.exec(children)) !== null) {
                  // Añadir texto antes de la referencia
                  if (match.index > lastIndex) {
                    parts.push(children.substring(lastIndex, match.index));
                  }
                  
                  // Procesar la referencia
                  const [, refType, path, linkText, flag] = match;
                  const pathParts = path.split('/');
                  const anchorId = pathParts.length === 2 ? pathParts[1].trim() : pathParts[0].trim();
                  const postSlug = pathParts.length === 2 ? pathParts[0].trim() : undefined;
                  const embed = flag?.trim().toLowerCase() === 'embed';
                  
                  if (refType === 'eq') {
                    parts.push(
                      <EquationReference
                        key={`eq-ref-${match.index}`}
                        anchorId={anchorId}
                        postSlug={postSlug}
                        linkText={linkText.trim()}
                        currentSlug={currentSlug}
                        embed={embed}
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
                        embed={embed}
                      />
                    );
                  } else if (refType === 'def') {
                    parts.push(
                      <DefinitionReference
                        key={`def-ref-${match.index}`}
                        anchorId={anchorId}
                        postSlug={postSlug}
                        linkText={linkText.trim()}
                        currentSlug={currentSlug}
                        embed={embed}
                      />
                    );
                  } else if (refType === 'thm') {
                    parts.push(
                      <TheoremReference
                        key={`thm-ref-${match.index}`}
                        anchorId={anchorId}
                        postSlug={postSlug}
                        linkText={linkText.trim()}
                        currentSlug={currentSlug}
                        embed={embed}
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
              <p 
                className="text-text-secondary mb-4 leading-relaxed" 
                style={{
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                  maxWidth: '100%',
                }}
                {...props}
              >
                {processedChildren}
              </p>
            );
          },
          ul: ({ node, ...props }) => (
            <ul 
              className="list-disc list-inside mb-4 text-text-secondary space-y-2" 
              style={{
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
              }}
              {...props} 
            />
          ),
          ol: ({ node, ...props }) => (
            <ol 
              className="list-decimal list-inside mb-4 text-text-secondary space-y-2" 
              style={{
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
              }}
              {...props} 
            />
          ),
          li: ({ node, ...props }) => (
            <li 
              className="ml-4" 
              style={{
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
              }}
              {...props} 
            />
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
            
            // Detectar si es un bloque de código especial para ecuaciones, definiciones o teoremas con anclas
            // El formato es: ```math-anchor:anchorId, ```definition-anchor:anchorId, o ```theorem-anchor:anchorId
            const language = className?.replace('language-', '') || '';
            const mathAnchorMatch = language.match(/^math-anchor:(.+)$/);
            const definitionAnchorMatch = language.match(/^definition-anchor:(.+)$/);
            const theoremAnchorMatch = language.match(/^theorem-anchor:(.+)$/);
            
            // Procesar ecuaciones
            if (mathAnchorMatch) {
              const anchorId = mathAnchorMatch[1];
              const anchor = anchorsMap.get(anchorId);
              
              // El contenido del código es la ecuación LaTeX (sin los $$)
              let equationContent = '';
              if (Array.isArray(children)) {
                equationContent = children.map(child => 
                  typeof child === 'string' ? child : String(child)
                ).join('');
              } else {
                equationContent = String(children || '').trim();
              }
              equationContent = equationContent.trim();
              
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
              
              // Usar currentSlug o un slug temporal para el preview
              const slug = currentSlug || 'preview';
              
              // Obtener el número de la ecuación (basado en orden de aparición)
              // Si no está en el mapa, calcularlo basándose en el índice
              const equationNumber = anchor?.number || anchors.findIndex(eq => eq.anchorId === anchorId) + 1 || 1;
              const description = anchor?.description;
              
              return (
                <EquationAnchor
                  anchorId={anchorId}
                  description={description}
                  number={equationNumber}
                  postSlug={slug}
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
            
            // Procesar definiciones
            if (definitionAnchorMatch) {
              const anchorId = definitionAnchorMatch[1];
              const anchor = definitionAnchorsMap.get(anchorId);
              
              // El contenido del código es el markdown de la definición
              // Procesar children que puede ser string o array
              let definitionContent = '';
              if (Array.isArray(children)) {
                definitionContent = children.map(child => 
                  typeof child === 'string' ? child : String(child)
                ).join('');
              } else {
                definitionContent = String(children || '').trim();
              }
              definitionContent = definitionContent.trim();
              
              // Preprocesar contenido: limpiar problemas comunes de LaTeX
              // Eliminar `\\` al final de líneas que causan problemas en LaTeX display mode
              // Esto se hace antes de que react-markdown procese el contenido
              definitionContent = definitionContent
                .replace(/\\+$/gm, '') // Eliminar \\ al final de líneas
                .replace(/\\newline\s*$/gm, ''); // Eliminar \newline al final de líneas
              
              // Usar currentSlug o un slug temporal para el preview
              const slug = currentSlug || 'preview';
              
              // Si no hay anchor en el mapa, usar valores por defecto (para preview)
              const number = anchor?.number || definitionAnchors.findIndex(d => d.anchorId === anchorId) + 1 || 1;
              const description = anchor?.description;
              
              return (
                <DefinitionAnchor
                  anchorId={anchorId}
                  description={description}
                  number={number}
                  postSlug={slug}
                >
                  <div
                    style={{
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word',
                      whiteSpace: 'normal',
                      maxWidth: '100%',
                      overflowX: 'hidden',
                    }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkMath, remarkGfm]}
                      rehypePlugins={[[rehypeKatex, { 
                        throwOnError: false,
                        strict: false,
                      }]]}
                      components={{
                        ...markdownComponents,
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
                          // Para bloques de código dentro de definiciones, usar el estilo normal
                          return (
                            <code
                              className="block p-4 rounded-lg bg-space-primary text-text-secondary text-sm font-mono overflow-x-auto mb-4"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {definitionContent}
                    </ReactMarkdown>
                  </div>
                </DefinitionAnchor>
              );
            }
            
            // Procesar teoremas
            if (theoremAnchorMatch) {
              const anchorId = theoremAnchorMatch[1];
              const anchor = theoremAnchorsMap.get(anchorId);
              
              // El contenido del código es el markdown del teorema
              // Procesar children que puede ser string o array
              let theoremContent = '';
              if (Array.isArray(children)) {
                theoremContent = children.map(child => 
                  typeof child === 'string' ? child : String(child)
                ).join('');
              } else {
                theoremContent = String(children || '').trim();
              }
              theoremContent = theoremContent.trim();
              
              // Preprocesar contenido: limpiar problemas comunes de LaTeX
              // Eliminar `\\` al final de líneas que causan problemas en LaTeX display mode
              // Esto se hace antes de que react-markdown procese el contenido
              theoremContent = theoremContent
                .replace(/\\+$/gm, '') // Eliminar \\ al final de líneas
                .replace(/\\newline\s*$/gm, ''); // Eliminar \newline al final de líneas
              
              // Usar currentSlug o un slug temporal para el preview
              const slug = currentSlug || 'preview';
              
              // Si no hay anchor en el mapa, usar valores por defecto (para preview)
              const number = anchor?.number || theoremAnchors.findIndex(t => t.anchorId === anchorId) + 1 || 1;
              const description = anchor?.description;
              
              return (
                <TheoremAnchor
                  anchorId={anchorId}
                  description={description}
                  number={number}
                  postSlug={slug}
                >
                  <div
                    style={{
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word',
                      whiteSpace: 'normal',
                      maxWidth: '100%',
                      overflowX: 'hidden',
                    }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkMath, remarkGfm]}
                      rehypePlugins={[[rehypeKatex, { 
                        throwOnError: false,
                        strict: false,
                      }]]}
                      components={{
                        ...markdownComponents,
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
                          // Para bloques de código dentro de teoremas, usar el estilo normal
                          return (
                            <code
                              className="block p-4 rounded-lg bg-space-primary text-text-secondary text-sm font-mono overflow-x-auto mb-4"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {theoremContent}
                    </ReactMarkdown>
                  </div>
                </TheoremAnchor>
              );
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
        };

  return (
    <div 
      className={`prose prose-invert max-w-none ${fontSizeClass} ${fontFamilyClass}`} 
      style={{
        ...fontFamilyStyle,
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
        maxWidth: '100%',
        overflowX: 'hidden',
      }}
    >
      <ReactMarkdown
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[[rehypeKatex, { 
              throwOnError: false,
              strict: false,
            }]]}
            components={markdownComponents}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

