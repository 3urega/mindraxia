'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import DefinitionAnchor from './DefinitionAnchor';
import TheoremAnchor from './TheoremAnchor';
import ProofAnchor from './ProofAnchor';
import EquationAnchor from './EquationAnchor';

interface Definition {
  anchorId: string;
  description?: string;
  content: string;
  number: number;
  postSlug: string;
}

interface Equation {
  anchorId: string;
  description?: string;
  equation: string;
  number: number;
  postSlug: string;
}

interface Theorem {
  anchorId: string;
  description?: string;
  content: string;
  number: number;
  postSlug: string;
}

interface Proof {
  anchorId: string;
  description?: string;
  content: string;
  number: number;
  postSlug: string;
}

interface PostSummaryViewProps {
  definitions: Definition[];
  equations: Equation[];
  theorems: Theorem[];
  proofs: Proof[];
  postSlug: string;
}

export default function PostSummaryView({
  definitions,
  equations,
  theorems,
  proofs,
  postSlug,
}: PostSummaryViewProps) {
  // Componentes de markdown básicos (sin procesamiento de anclas especiales)
  const markdownComponents = {
    p: ({ children }: any) => <p className="mb-4 text-text-secondary">{children}</p>,
    h1: ({ children }: any) => <h1 className="mb-4 text-3xl font-bold text-text-primary">{children}</h1>,
    h2: ({ children }: any) => <h2 className="mb-3 mt-6 text-2xl font-bold text-text-primary">{children}</h2>,
    h3: ({ children }: any) => <h3 className="mb-2 mt-4 text-xl font-semibold text-text-primary">{children}</h3>,
    ul: ({ children }: any) => <ul className="mb-4 ml-6 list-disc text-text-secondary">{children}</ul>,
    ol: ({ children }: any) => <ol className="mb-4 ml-6 list-decimal text-text-secondary">{children}</ol>,
    li: ({ children }: any) => <li className="mb-1">{children}</li>,
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
      return (
        <code
          className="block p-4 rounded-lg bg-space-primary text-text-secondary text-sm font-mono overflow-x-auto mb-4"
          {...props}
        >
          {children}
        </code>
      );
    },
  };

  // Renderizar ecuación con KaTeX
  const renderEquation = (equation: Equation) => {
    try {
      const rendered = katex.renderToString(equation.equation, {
        throwOnError: false,
        displayMode: true,
        strict: false,
      });
      
      return (
        <EquationAnchor
          key={equation.anchorId}
          anchorId={equation.anchorId}
          description={equation.description}
          number={equation.number}
          postSlug={equation.postSlug}
        >
          <div 
            className="katex-display"
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        </EquationAnchor>
      );
    } catch (error) {
      console.error('Error rendering equation:', error);
      return (
        <EquationAnchor
          key={equation.anchorId}
          anchorId={equation.anchorId}
          description={equation.description}
          number={equation.number}
          postSlug={equation.postSlug}
        >
          <div className="text-red-400">
            Error al renderizar ecuación: {equation.equation}
          </div>
        </EquationAnchor>
      );
    }
  };

  // Preprocesar contenido de definición/teorema para eliminar problemas de LaTeX
  const preprocessContent = (content: string) => {
    return content
      .replace(/\\+$/gm, '') // Eliminar \\ al final de líneas
      .replace(/\\newline\s*$/gm, ''); // Eliminar \newline al final de líneas
  };

  return (
    <div className="space-y-8">
      {/* Sección de Definiciones */}
      {definitions.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-bold text-text-primary border-b pb-2" style={{ borderColor: 'var(--border-glow)' }}>
            Definiciones
          </h2>
          <div className="space-y-6">
            {definitions.map((def) => (
              <DefinitionAnchor
                key={def.anchorId}
                anchorId={def.anchorId}
                description={def.description}
                number={def.number}
                postSlug={def.postSlug}
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
                    components={markdownComponents}
                  >
                    {preprocessContent(def.content)}
                  </ReactMarkdown>
                </div>
              </DefinitionAnchor>
            ))}
          </div>
        </section>
      )}

      {/* Sección de Ecuaciones */}
      {equations.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-bold text-text-primary border-b pb-2" style={{ borderColor: 'var(--border-glow)' }}>
            Fórmulas
          </h2>
          <div className="space-y-6">
            {equations.map((eq) => renderEquation(eq))}
          </div>
        </section>
      )}

      {/* Sección de Teoremas */}
      {theorems.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-bold text-text-primary border-b pb-2" style={{ borderColor: 'var(--border-glow)' }}>
            Teoremas
          </h2>
          <div className="space-y-6">
            {theorems.map((thm) => (
              <TheoremAnchor
                key={thm.anchorId}
                anchorId={thm.anchorId}
                description={thm.description}
                number={thm.number}
                postSlug={thm.postSlug}
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
                    components={markdownComponents}
                  >
                    {preprocessContent(thm.content)}
                  </ReactMarkdown>
                </div>
              </TheoremAnchor>
            ))}
          </div>
        </section>
      )}

      {/* Sección de Demostraciones */}
      {proofs.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-bold text-text-primary border-b pb-2" style={{ borderColor: 'var(--border-glow)' }}>
            Demostraciones
          </h2>
          <div className="space-y-6">
            {proofs.map((prf) => (
              <ProofAnchor
                key={prf.anchorId}
                anchorId={prf.anchorId}
                description={prf.description}
                number={prf.number}
                postSlug={prf.postSlug}
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
                    components={markdownComponents}
                  >
                    {preprocessContent(prf.content)}
                  </ReactMarkdown>
                </div>
              </ProofAnchor>
            ))}
          </div>
        </section>
      )}

      {/* Mensaje si no hay contenido */}
      {definitions.length === 0 && equations.length === 0 && theorems.length === 0 && proofs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted text-lg">
            Este post no contiene definiciones, fórmulas, teoremas ni demostraciones.
          </p>
        </div>
      )}
    </div>
  );
}

