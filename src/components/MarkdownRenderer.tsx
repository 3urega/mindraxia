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
import { remarkEquationReferences } from '@/lib/remark-equation-references';
import EquationAnchor from './EquationAnchor';
import EquationReference from './EquationReference';

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
  
  // Crear mapa de anclas por ID para acceso rápido
  const anchorsMap = new Map(anchors.map(a => [a.anchorId, a]));
  
  // Preprocesar markdown: convertir ecuaciones con anclas a bloques de código especiales
  let processedContent = preprocessAnchors(content);
  
  // Crear mapa de referencias para acceso rápido durante el renderizado
  // En lugar de usar placeholders, procesaremos las referencias directamente en los componentes
  const referencesMap = new Map(
    references.map((ref, index) => [
      ref.fullMatch,
      {
        postSlug: ref.postSlug,
        anchorId: ref.anchorId,
        linkText: ref.linkText,
      },
    ])
  );

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm, remarkEquationReferences]}
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
          p: ({ node, ...props }: any) => {
            // Función helper para procesar children y reemplazar referencias
            const processChildren = (children: any): React.ReactNode[] => {
              if (typeof children === 'string') {
                // Buscar referencias en el texto: {{eq:...|...}}
                const referenceRegex = /\{\{eq:([^}|]+)\|([^}]+)\}\}/g;
                const matches = Array.from(children.matchAll(referenceRegex));
                
                if (matches.length > 0) {
                  const parts: React.ReactNode[] = [];
                  let lastIndex = 0;
                  
                  matches.forEach((match, idx) => {
                    // Añadir texto antes de la referencia
                    if (match.index !== undefined && match.index > lastIndex) {
                      parts.push(
                        <span key={`text-before-${idx}`}>
                          {children.substring(lastIndex, match.index)}
                        </span>
                      );
                    }
                    
                    // Procesar la referencia
                    const fullMatch = match[0];
                    const path = match[1];
                    const linkText = match[2];
                    const pathParts = path.split('/');
                    
                    let postSlug: string | undefined;
                    let anchorId: string;
                    
                    if (pathParts.length === 2) {
                      // Referencia a otro post
                      postSlug = pathParts[0].trim();
                      anchorId = pathParts[1].trim();
                    } else {
                      // Referencia al mismo post
                      anchorId = path.trim();
                    }
                    
                    parts.push(
                      <EquationReference
                        key={`ref-${idx}`}
                        anchorId={anchorId}
                        postSlug={postSlug}
                        linkText={linkText.trim()}
                        currentSlug={currentSlug}
                      />
                    );
                    
                    lastIndex = (match.index || 0) + fullMatch.length;
                  });
                  
                  // Añadir texto restante
                  if (lastIndex < children.length) {
                    parts.push(
                      <span key="text-after">{children.substring(lastIndex)}</span>
                    );
                  }
                  
                  return parts;
                }
                return [children];
              }
              
              if (Array.isArray(children)) {
                return children.flatMap((child, idx) => {
                  if (typeof child === 'string') {
                    return processChildren(child);
                  }
                  return <span key={`child-${idx}`}>{child}</span>;
                });
              }
              
              return [children];
            };

            const processedChildren = processChildren(props.children);
            
            return (
              <p className="text-text-secondary mb-4 leading-relaxed">
                {processedChildren}
              </p>
            );
          },
          // También procesar en nodos de texto
          text: ({ node, ...props }: any) => {
            const value = String(props.children || '');
            // Buscar referencias en el texto: {{eq:...|...}}
            const referenceRegex = /\{\{eq:([^}|]+)\|([^}]+)\}\}/g;
            const matches = Array.from(value.matchAll(referenceRegex));
            
            if (matches.length > 0) {
              const parts: React.ReactNode[] = [];
              let lastIndex = 0;
              
              matches.forEach((match, idx) => {
                // Añadir texto antes de la referencia
                if (match.index !== undefined && match.index > lastIndex) {
                  parts.push(
                    <span key={`text-before-${idx}`}>
                      {value.substring(lastIndex, match.index)}
                    </span>
                  );
                }
                
                // Procesar la referencia
                const path = match[1];
                const linkText = match[2];
                const pathParts = path.split('/');
                
                let postSlug: string | undefined;
                let anchorId: string;
                
                if (pathParts.length === 2) {
                  // Referencia a otro post
                  postSlug = pathParts[0].trim();
                  anchorId = pathParts[1].trim();
                } else {
                  // Referencia al mismo post
                  anchorId = path.trim();
                }
                
                parts.push(
                  <EquationReference
                    key={`text-ref-${idx}`}
                    anchorId={anchorId}
                    postSlug={postSlug}
                    linkText={linkText.trim()}
                    currentSlug={currentSlug}
                  />
                );
                
                lastIndex = (match.index || 0) + match[0].length;
              });
              
              // Añadir texto restante
              if (lastIndex < value.length) {
                parts.push(
                  <span key="text-after">{value.substring(lastIndex)}</span>
                );
              }
              
              return <>{parts}</>;
            }
            
            return <>{value}</>;
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
          a: ({ node, ...props }) => (
            <a
              className="text-star-cyan hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
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

