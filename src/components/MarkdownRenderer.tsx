'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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
import {
  extractProofAnchors,
  extractProofReferences,
  preprocessProofAnchors,
} from '@/lib/proof-anchors';
import {
  extractExpandableSections,
  preprocessExpandableSections,
} from '@/lib/expandable-anchors';
import {
  extractSections,
  preprocessSections,
  type Section,
} from '@/lib/section-anchors';
import EquationAnchor from './EquationAnchor';
import EquationReference from './EquationReference';
import ImageAnchor from './ImageAnchor';
import ImageReference from './ImageReference';
import DefinitionAnchor from './DefinitionAnchor';
import DefinitionReference from './DefinitionReference';
import TheoremAnchor from './TheoremAnchor';
import TheoremReference from './TheoremReference';
import ProofAnchor from './ProofAnchor';
import ProofReference from './ProofReference';
import ExpandableSection from './ExpandableSection';

interface MarkdownRendererProps {
  content: string;
  currentSlug?: string; // Slug del post actual para referencias relativas
  onExpandableSectionsChange?: (sectionIds: string[]) => void; // Callback para pasar IDs al control
  onSectionsChange?: (sections: Section[]) => void; // Callback para pasar secciones al índice
  enableLineMapping?: boolean; // Habilitar mapeo de líneas para sincronización editor-preview
}

export default function MarkdownRenderer({
  content,
  currentSlug,
  onExpandableSectionsChange,
  onSectionsChange,
  enableLineMapping = false,
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
  const proofAnchors = extractProofAnchors(content);
  const proofReferences = extractProofReferences(content);
  const expandableSections = extractExpandableSections(content);
  const sections = extractSections(content);
  
  // Generar IDs únicos para cada sección expandible
  const expandableSectionIds = expandableSections.map((section, index) => 
    `expandable-${index}-${section.title.replace(/\s+/g, '-').toLowerCase()}`
  );
  
  // Notificar a el componente padre sobre los IDs de las secciones expandibles
  useEffect(() => {
    if (onExpandableSectionsChange) {
      onExpandableSectionsChange(expandableSectionIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandableSections.length]);

  // Notificar a el componente padre sobre las secciones
  useEffect(() => {
    if (onSectionsChange) {
      onSectionsChange(sections);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.length]);
  
  // Crear mapas de anclas por ID para acceso rápido, con números basados en orden de aparición
  const anchorsMap = new Map(
    anchors.map((eq, index) => [eq.anchorId, { ...eq, number: index + 1 }])
  );
  const imageAnchorsMap = new Map(imageAnchors.map(a => [a.anchorId, a]));
  
  // Crear mapas de definiciones, teoremas y demostraciones con números basados en orden de aparición
  const definitionAnchorsMap = new Map(
    definitionAnchors.map((def, index) => [def.anchorId, { ...def, number: index + 1 }])
  );
  const theoremAnchorsMap = new Map(
    theoremAnchors.map((thm, index) => [thm.anchorId, { ...thm, number: index + 1 }])
  );
  const proofAnchorsMap = new Map(
    proofAnchors.map((prf, index) => [prf.anchorId, { ...prf, number: index + 1 }])
  );

  // Crear mapa de secciones por título para asignar IDs a encabezados
  const sectionsMap = new Map(
    sections.map((section) => [section.title.trim(), section])
  );
  
  // Preprocesar markdown: convertir ecuaciones, imágenes, definiciones, teoremas y demostraciones con anclas
  // IMPORTANTE: preprocessSections debe ejecutarse ANTES de otros preprocesamientos para que los encabezados se generen correctamente
  let processedContent = preprocessSections(content);
  processedContent = preprocessAnchors(processedContent);
  processedContent = preprocessImageAnchors(processedContent);
  processedContent = preprocessDefinitionAnchors(processedContent);
  processedContent = preprocessTheoremAnchors(processedContent);
  processedContent = preprocessProofAnchors(processedContent);
  processedContent = preprocessExpandableSections(processedContent);

  /**
   * Calcula las líneas del markdown original que corresponden a un fragmento de texto
   * Usa el contenido original (content) para el mapeo, no el procesado
   */
  const getLineRangeForText = useCallback((text: string, searchInProcessed = false): { start: number; end: number } => {
    if (!enableLineMapping || !text) {
      return { start: 0, end: 0 };
    }

    const searchContent = searchInProcessed ? processedContent : content;
    // Buscar la primera ocurrencia del texto en el contenido
    const index = searchContent.indexOf(text);
    if (index === -1) {
      return { start: 0, end: 0 };
    }

    // Calcular líneas basándose en el contenido original
    const textBefore = content.substring(0, Math.min(index, content.length));
    const startLine = textBefore.split('\n').length - 1;
    const endLine = startLine + text.split('\n').length - 1;

    return { start: Math.max(0, startLine), end: Math.max(0, endLine) };
  }, [enableLineMapping, content, processedContent]);

  /**
   * Helper para agregar data attributes de línea a un elemento
   */
  const addLineAttributes = useCallback((text: string, props: any, searchInProcessed = false) => {
    if (!enableLineMapping) return props;

    const lineRange = getLineRangeForText(text, searchInProcessed);
    return {
      ...props,
      'data-line-start': lineRange.start,
      'data-line-end': lineRange.end,
    };
  }, [enableLineMapping, getLineRangeForText]);
  
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
  
  const proofReferencesMap = new Map(
    proofReferences.map((ref) => [
      ref.fullMatch,
      {
        anchorId: ref.anchorId,
        postSlug: ref.postSlug,
        linkText: ref.linkText,
        embed: ref.embed,
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
          h1: ({ node, children, ...props }: any) => {
            const text = typeof children === 'string' 
              ? children 
              : Array.isArray(children) 
                ? children.map((c: any) => typeof c === 'string' ? c : '').join('')
                : '';
            const lineProps = addLineAttributes(`# ${text}`, props);
            return (
              <h1 className="text-4xl font-bold text-text-primary mb-4 mt-8" {...lineProps}>
                {children}
              </h1>
            );
          },
          h2: ({ node, children, ...props }: any) => {
            // Buscar si este encabezado corresponde a una sección
            const titleText = typeof children === 'string' 
              ? children 
              : Array.isArray(children) 
                ? children.map((c: any) => typeof c === 'string' ? c : '').join('')
                : '';
            const section = sectionsMap.get(titleText.trim());
            const id = section ? section.id : undefined;
            
            // Agregar data attributes para mapeo de líneas
            const lineProps = addLineAttributes(`## ${titleText}`, props);
            
            return (
              <h2
                id={id}
                className="text-3xl font-bold text-text-primary mb-3 mt-6 scroll-mt-20"
                {...lineProps}
              >
                {children}
              </h2>
            );
          },
          h3: ({ node, children, ...props }: any) => {
            // Buscar si este encabezado corresponde a una subsección
            const titleText = typeof children === 'string' 
              ? children 
              : Array.isArray(children) 
                ? children.map((c: any) => typeof c === 'string' ? c : '').join('')
                : '';
            const section = sectionsMap.get(titleText.trim());
            const id = section ? section.id : undefined;
            
            // Agregar data attributes para mapeo de líneas
            const lineProps = addLineAttributes(`### ${titleText}`, props);
            
            return (
              <h3
                id={id}
                className="text-2xl font-semibold text-text-primary mb-2 mt-4 scroll-mt-20"
                {...lineProps}
              >
                {children}
              </h3>
            );
          },
          p: ({ node, children, ...props }: any) => {
            let hasEmbeddedRef = false; // Flag para detectar referencias embebidas
            
            // Procesar children para detectar referencias (ecuaciones e imágenes)
            const processChildren = (children: any): any => {
              if (typeof children === 'string') {
                // Buscar referencias en el texto (ecuaciones e imágenes)
                const parts: any[] = [];
                let lastIndex = 0;
                let match;
                
                // Regex combinado para referencias de ecuaciones, imágenes, definiciones, teoremas y demostraciones
                // Captura el tercer parámetro opcional (embed)
                const refRegex = /\{\{(eq|img|def|thm|prf):([^}|]+)\|([^}|]+)(?:\|([^}]+))?\}\}/g;
                
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
                  
                  // Si hay una referencia embebida, marcar el flag
                  if (embed) {
                    hasEmbeddedRef = true;
                  }
                  
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
                  } else if (refType === 'prf') {
                    parts.push(
                      <ProofReference
                        key={`prf-ref-${match.index}`}
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
            
            // Extraer texto para mapeo de líneas
            const text = typeof children === 'string' 
              ? children 
              : Array.isArray(children) 
                ? children.map((c: any) => typeof c === 'string' ? c : '').join('')
                : '';
            const lineProps = addLineAttributes(text, props);
            
            const commonStyles = {
              wordWrap: 'break-word' as const,
              overflowWrap: 'break-word' as const,
              wordBreak: 'break-word' as const,
              whiteSpace: 'normal' as const,
              maxWidth: '100%',
            };
            
            // Si hay referencias embebidas, usar div en lugar de p (porque los divs no pueden estar dentro de p)
            if (hasEmbeddedRef) {
              return (
                <div 
                  className="text-text-secondary mb-4 leading-relaxed" 
                  style={commonStyles}
                  {...lineProps}
                >
                  {processedChildren}
                </div>
              );
            }
            
            return (
              <p 
                className="text-text-secondary mb-4 leading-relaxed" 
                style={commonStyles}
                {...lineProps}
              >
                {processedChildren}
              </p>
            );
          },
          ul: ({ node, children, ...props }: any) => {
            const text = typeof children === 'string' 
              ? children 
              : Array.isArray(children) 
                ? children.map((c: any) => typeof c === 'string' ? c : '').join('')
                : '';
            const lineProps = addLineAttributes(text, props);
            return (
              <ul 
                className="list-disc list-inside mb-4 text-text-secondary space-y-2" 
                style={{
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                }}
                {...lineProps} 
              >
                {children}
              </ul>
            );
          },
          ol: ({ node, children, ...props }: any) => {
            const text = typeof children === 'string' 
              ? children 
              : Array.isArray(children) 
                ? children.map((c: any) => typeof c === 'string' ? c : '').join('')
                : '';
            const lineProps = addLineAttributes(text, props);
            return (
              <ol 
                className="list-decimal list-inside mb-4 text-text-secondary space-y-2" 
                style={{
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                }}
                {...lineProps} 
              >
                {children}
              </ol>
            );
          },
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
            
            // Detectar si es un bloque de código especial para ecuaciones, definiciones, teoremas o secciones expandibles con anclas
            // El formato es: ```math-anchor:anchorId, ```definition-anchor:anchorId, ```theorem-anchor:anchorId, ```proof-anchor:anchorId, o ```expandable-section:title
            const language = className?.replace('language-', '') || '';
            const mathAnchorMatch = language.match(/^math-anchor:(.+)$/);
            const definitionAnchorMatch = language.match(/^definition-anchor:(.+)$/);
            const theoremAnchorMatch = language.match(/^theorem-anchor:(.+)$/);
            const proofAnchorMatch = language.match(/^proof-anchor:(.+)$/);
            const expandableSectionMatch = language.match(/^expandable-section:(.+)$/);
            
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
            
            // Procesar demostraciones
            if (proofAnchorMatch) {
              const anchorId = proofAnchorMatch[1];
              const anchor = proofAnchorsMap.get(anchorId);
              
              // El contenido del código es el markdown de la demostración
              // Procesar children que puede ser string o array
              let proofContent = '';
              if (Array.isArray(children)) {
                proofContent = children.map(child => 
                  typeof child === 'string' ? child : String(child)
                ).join('');
              } else {
                proofContent = String(children || '').trim();
              }
              proofContent = proofContent.trim();
              
              // Preprocesar contenido: limpiar problemas comunes de LaTeX
              // Eliminar `\\` al final de líneas que causan problemas en LaTeX display mode
              // Esto se hace antes de que react-markdown procese el contenido
              proofContent = proofContent
                .replace(/\\+$/gm, '') // Eliminar \\ al final de líneas
                .replace(/\\newline\s*$/gm, ''); // Eliminar \newline al final de líneas
              
              // Usar currentSlug o un slug temporal para el preview
              const slug = currentSlug || 'preview';
              
              // Si no hay anchor en el mapa, usar valores por defecto (para preview)
              const number = anchor?.number || proofAnchors.findIndex(p => p.anchorId === anchorId) + 1 || 1;
              const description = anchor?.description;
              
              return (
                <ProofAnchor
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
                          // Para bloques de código dentro de demostraciones, usar el estilo normal
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
                      {proofContent}
                    </ReactMarkdown>
                  </div>
                </ProofAnchor>
              );
            }
            
            // Procesar secciones expandibles
            if (expandableSectionMatch) {
              const title = expandableSectionMatch[1];
              
              // El contenido del código es el markdown de la sección expandible
              // Procesar children que puede ser string o array
              let sectionContent = '';
              if (Array.isArray(children)) {
                sectionContent = children.map(child => 
                  typeof child === 'string' ? child : String(child)
                ).join('');
              } else {
                sectionContent = String(children || '').trim();
              }
              sectionContent = sectionContent.trim();
              
              // Preprocesar contenido: limpiar problemas comunes de LaTeX
              sectionContent = sectionContent
                .replace(/\\+$/gm, '') // Eliminar \\ al final de líneas
                .replace(/\\newline\s*$/gm, ''); // Eliminar \newline al final de líneas
              
              // Encontrar el índice de esta sección para generar el ID
              const sectionIndex = expandableSections.findIndex(s => s.title.trim() === title);
              const sectionId = expandableSectionIds[sectionIndex] || `expandable-${sectionIndex}-${title.replace(/\s+/g, '-').toLowerCase()}`;
              
              return (
                <ExpandableSection id={sectionId} title={title}>
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
                          // Para bloques de código dentro de secciones expandibles, usar el estilo normal
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
                      {sectionContent}
                    </ReactMarkdown>
                  </div>
                </ExpandableSection>
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

