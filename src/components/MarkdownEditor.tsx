'use client';

import { useState, useRef, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import EquationReferenceSelector from './EquationReferenceSelector';
import ImageReferenceSelector from './ImageReferenceSelector';
import DefinitionReferenceSelector from './DefinitionReferenceSelector';
import TheoremReferenceSelector from './TheoremReferenceSelector';
import ImageUploader from './ImageUploader';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  postId?: string; // ID del post para obtener ecuaciones disponibles
  currentPostSlug?: string; // Slug del post actual para referencias relativas
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Escribe tu contenido en markdown...',
  postId,
  currentPostSlug,
}: MarkdownEditorProps) {
  const [view, setView] = useState<'split' | 'edit' | 'preview'>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [equationCounter, setEquationCounter] = useState(1);
  const [definitionCounter, setDefinitionCounter] = useState(1);
  const [theoremCounter, setTheoremCounter] = useState(1);
  const [showReferenceSelector, setShowReferenceSelector] = useState(false);
  const [showImageReferenceSelector, setShowImageReferenceSelector] = useState(false);
  const [showDefinitionReferenceSelector, setShowDefinitionReferenceSelector] = useState(false);
  const [showTheoremReferenceSelector, setShowTheoremReferenceSelector] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showImageExamples, setShowImageExamples] = useState(false);
  const [showDefinitionsDropdown, setShowDefinitionsDropdown] = useState(false);
  const [showTheoremsDropdown, setShowTheoremsDropdown] = useState(false);

  // Cerrar desplegables al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowDefinitionsDropdown(false);
        setShowTheoremsDropdown(false);
      }
    };

    if (showDefinitionsDropdown || showTheoremsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDefinitionsDropdown, showTheoremsDropdown]);

  // Función para insertar texto en la posición del cursor
  const insertText = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue =
      value.substring(0, start) + textToInsert + value.substring(end);
    
    onChange(newValue);

    // Restaurar posición del cursor después de la inserción
    setTimeout(() => {
      const newPosition = start + textToInsert.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  };

  // Insertar fórmula inline
  const insertInlineFormula = () => {
    insertText('$ $');
    // Mover cursor entre los signos de dólar
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const pos = textarea.selectionStart - 1;
        textarea.setSelectionRange(pos, pos);
      }
    }, 10);
  };

  // Insertar fórmula en bloque
  const insertBlockFormula = () => {
    insertText('$$\n\n$$');
    // Mover cursor entre los bloques de dólar
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const pos = textarea.selectionStart - 3;
        textarea.setSelectionRange(pos, pos);
      }
    }, 10);
  };

  // Insertar fórmula numerada
  const insertNumberedFormula = () => {
    const equationNumber = equationCounter;
    setEquationCounter(equationCounter + 1);
    // Insertar plantilla: $$ fórmula \tag{número} $$
    // El formato correcto es: fórmula primero, luego \tag
    const template = `$$\n \\tag{${equationNumber}}\n$$`;
    insertText(template);
    // Mover cursor a la línea donde va la fórmula (después de $$ inicial)
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + 3; // Después de $$\n, donde el usuario escribe la fórmula
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 10);
  };

  // Insertar integral con límites
  const insertIntegral = () => {
    const template = `$$\n\\int_{a}^{b} f(x) \\, dx\n$$`;
    insertText(template);
    // Mover cursor a la posición donde está 'a' (límite inferior)
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        // Posición después de \int_{
        const newPos = startPos + 7;
        textarea.setSelectionRange(newPos, newPos + 1); // Seleccionar 'a' para fácil reemplazo
      }
    }, 10);
  };

  // Insertar matriz
  const insertMatrix = () => {
    const template = `$$\n\\begin{pmatrix}\na & b \\\\\nc & d\n\\end{pmatrix}\n$$`;
    insertText(template);
    // Mover cursor a la primera posición de la matriz (elemento 'a')
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        // Posición después de \begin{pmatrix}\n
        const newPos = startPos + 18;
        textarea.setSelectionRange(newPos, newPos + 1); // Seleccionar 'a' para fácil reemplazo
      }
    }, 10);
  };

  // Insertar ecuaciones alineadas (align)
  const insertAlignedEquations = () => {
    const template = `$$\n\\begin{align}\nf(x) &= x^2 + 2x + 1 \\\\\ng(x) &= \\frac{1}{x}\n\\end{align}\n$$`;
    insertText(template);
    // Mover cursor al primer elemento
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + 14; // Después de \begin{align}\n
        textarea.setSelectionRange(newPos, newPos + 1);
      }
    }, 10);
  };

  // Insertar sistema de ecuaciones (cases)
  const insertCaseFunction = () => {
    const template = `$$\nf(x) = \\begin{cases}\n  x^2 & \\text{si } x \\geq 0 \\\\\n  -x & \\text{si } x < 0\n\\end{cases}\n$$`;
    insertText(template);
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + 14; // Después de f(x) = \begin{cases}\n
        textarea.setSelectionRange(newPos, newPos + 2);
      }
    }, 10);
  };

  // Insertar sumatoria con límites
  const insertSummation = () => {
    const template = `$$\n\\sum_{i=1}^{n} a_i = a_1 + a_2 + \\cdots + a_n\n$$`;
    insertText(template);
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + 7; // Después de \sum_{
        textarea.setSelectionRange(newPos, newPos + 1);
      }
    }, 10);
  };

  // Insertar ecuación con nombre/etiqueta
  const insertNamedEquation = () => {
    const equationNumber = equationCounter;
    setEquationCounter(equationCounter + 1);
    const template = `$$\nE = mc^2 \\tag{Ecuación de Einstein ${equationNumber}}\n$$`;
    insertText(template);
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + 4; // Después de $$\n, donde está E = mc^2
        textarea.setSelectionRange(newPos, newPos + 7); // Seleccionar "E = mc^2"
      }
    }, 10);
  };

  // Insertar fracción compleja
  const insertComplexFraction = () => {
    const template = `$$\n\\frac{\\frac{a}{b} + \\frac{c}{d}}{\\frac{e}{f} - \\frac{g}{h}}\n$$`;
    insertText(template);
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + 5; // Después de $$\n\frac{
        textarea.setSelectionRange(newPos, newPos + 1);
      }
    }, 10);
  };

  // Insertar ecuación con ancla
  const insertAnchoredEquation = () => {
    const template = '$${#eq:}\nE = mc^2\n$$';
    insertText(template);
    // Mover cursor al ID del anchor
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        // Posición después de $${#eq:
        const newPos = startPos + 6;
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 10);
  };

  // Insertar ecuación con ancla y descripción
  const insertAnchoredEquationWithDescription = () => {
    const template = '$${#eq:|descripción: }\nE = mc^2\n$$';
    insertText(template);
    // Mover cursor a la descripción
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        // Posición después de descripción: 
        const newPos = startPos + 20;
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 10);
  };

  // Insertar definición numerada (sin ancla)
  const insertNumberedDefinition = () => {
    const definitionNumber = definitionCounter;
    setDefinitionCounter(definitionCounter + 1);
    const template = `:::definition{#def:}\nContenido de la definición ${definitionNumber}.\n:::\n`;
    insertText(template);
    // Mover cursor al ID del anchor
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + template.indexOf('{#def:') + 6;
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 10);
  };

  // Insertar teorema numerado (sin ancla)
  const insertNumberedTheorem = () => {
    const theoremNumber = theoremCounter;
    setTheoremCounter(theoremCounter + 1);
    const template = `:::theorem{#thm:}\nContenido del teorema ${theoremNumber}.\n:::\n`;
    insertText(template);
    // Mover cursor al ID del anchor
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + template.indexOf('{#thm:') + 6;
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 10);
  };

  // Insertar definición con ancla
  const insertAnchoredDefinition = () => {
    const template = ':::definition{#def:}\nContenido de la definición.\n:::\n';
    insertText(template);
    // Mover cursor al ID del anchor
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + template.indexOf('{#def:') + 6;
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 10);
  };

  // Insertar definición con ancla y descripción
  const insertAnchoredDefinitionWithDescription = () => {
    const template = ':::definition{#def:|descripción: }\nContenido de la definición.\n:::\n';
    insertText(template);
    // Mover cursor a la descripción
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + template.indexOf('descripción: ') + 13;
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 10);
  };

  // Insertar teorema con ancla
  const insertAnchoredTheorem = () => {
    const template = ':::theorem{#thm:}\nContenido del teorema.\n:::\n';
    insertText(template);
    // Mover cursor al ID del anchor
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + template.indexOf('{#thm:') + 6;
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 10);
  };

  // Insertar teorema con ancla y descripción
  const insertAnchoredTheoremWithDescription = () => {
    const template = ':::theorem{#thm:|descripción: }\nContenido del teorema.\n:::\n';
    insertText(template);
    // Mover cursor a la descripción
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + template.indexOf('descripción: ') + 13;
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 10);
  };

  // Insertar imagen
  const handleImageSelect = (url: string, alt: string, anchorId?: string, description?: string) => {
    let markdownText = '';
    if (anchorId) {
      if (description) {
        markdownText = `![${alt}](${url}){#img:${anchorId}|descripción: ${description}}`;
      } else {
        markdownText = `![${alt}](${url}){#img:${anchorId}}`;
      }
    } else {
      markdownText = `![${alt}](${url})`;
    }
    
    insertText(markdownText);
  };

  // Insertar plantilla de imagen con ancla
  const insertImageAnchor = () => {
    const template = '![texto alternativo](url-de-la-imagen){#img:}';
    insertText(template);
    // Mover cursor al ID del anchor
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + template.indexOf('{#img:') + 6; // Después de {#img:
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 10);
  };

  // Insertar plantilla de imagen con ancla y descripción
  const insertImageAnchorWithDescription = () => {
    const template = '![texto alternativo](url-de-la-imagen){#img:|descripción: }';
    insertText(template);
    // Mover cursor a la descripción
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + template.indexOf('descripción: ') + 13; // Después de descripción:
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 10);
  };

  // Insertar referencia a imagen
  const handleInsertImageReference = (anchorId: string, postSlug: string) => {
    let referenceText: string;
    if (currentPostSlug === postSlug || !currentPostSlug) {
      // Referencia al mismo post: {{img:anchor-id|texto}}
      referenceText = `{{img:${anchorId}|texto del enlace}}`;
    } else {
      // Referencia a otro post: {{img:post-slug/anchor-id|texto}}
      referenceText = `{{img:${postSlug}/${anchorId}|texto del enlace}}`;
    }

    insertText(referenceText);

    // Seleccionar "texto del enlace" para fácil edición
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - referenceText.length;
        // Posición después de |
        const pipePos = referenceText.indexOf('|') + 1;
        const endPos = startPos + referenceText.length - 2; // Antes de }}
        textarea.setSelectionRange(startPos + pipePos, endPos);
      }
    }, 10);
  };

  // Insertar referencia a ecuación
  const handleInsertReference = (anchorId: string, postSlug: string) => {
    // Determinar si es referencia al mismo post o a otro
    // Por ahora asumimos que si no hay postId, es referencia al mismo post
    const isSamePost = !postId; // Si no hay postId, es nuevo post, así que misma referencia
    
    let referenceText: string;
    if (isSamePost) {
      // Referencia al mismo post: {{eq:anchor-id|texto}}
      referenceText = `{{eq:${anchorId}|texto del enlace}}`;
    } else {
      // Referencia a otro post: {{eq:post-slug/anchor-id|texto}}
      referenceText = `{{eq:${postSlug}/${anchorId}|texto del enlace}}`;
    }
    
    insertText(referenceText);
    
    // Seleccionar "texto del enlace" para fácil edición
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - referenceText.length;
        // Posición después de |
        const pipePos = referenceText.indexOf('|') + 1;
        const endPos = startPos + referenceText.length - 2; // Antes de }}
        textarea.setSelectionRange(startPos + pipePos, endPos);
      }
    }, 10);
  };

  // Insertar referencia a definición
  const handleInsertDefinitionReference = (anchorId: string, postSlug: string) => {
    const isSamePost = !postId || currentPostSlug === postSlug;
    
    let referenceText: string;
    if (isSamePost) {
      referenceText = `{{def:${anchorId}|texto del enlace}}`;
    } else {
      referenceText = `{{def:${postSlug}/${anchorId}|texto del enlace}}`;
    }
    
    insertText(referenceText);
    
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - referenceText.length;
        const pipePos = referenceText.indexOf('|') + 1;
        const endPos = startPos + referenceText.length - 2;
        textarea.setSelectionRange(startPos + pipePos, endPos);
      }
    }, 10);
  };

  // Insertar referencia a teorema
  const handleInsertTheoremReference = (anchorId: string, postSlug: string) => {
    const isSamePost = !postId || currentPostSlug === postSlug;
    
    let referenceText: string;
    if (isSamePost) {
      referenceText = `{{thm:${anchorId}|texto del enlace}}`;
    } else {
      referenceText = `{{thm:${postSlug}/${anchorId}|texto del enlace}}`;
    }
    
    insertText(referenceText);
    
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - referenceText.length;
        const pipePos = referenceText.indexOf('|') + 1;
        const endPos = startPos + referenceText.length - 2;
        textarea.setSelectionRange(startPos + pipePos, endPos);
      }
    }, 10);
  };

  return (
    <div className="w-full">
      {/* Botones de acción rápida */}
      <div className="mb-4 space-y-3">
        {/* Básicas */}
        <div className="flex flex-wrap gap-2 p-3 rounded-lg border" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.3)' }}>
          <span className="text-xs text-text-muted self-center mr-2 font-semibold">Básicas:</span>
          <button
            type="button"
            onClick={insertInlineFormula}
            className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
            style={{ borderColor: 'var(--border-glow)' }}
            title="Insertar fórmula inline ($...$)"
          >
            Fórmula Inline
          </button>
          <button
            type="button"
            onClick={insertBlockFormula}
            className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
            style={{ borderColor: 'var(--border-glow)' }}
            title="Insertar fórmula en bloque ($$...$$)"
          >
            Fórmula Bloque
          </button>
          <button
            type="button"
            onClick={insertNumberedFormula}
            className="px-3 py-1.5 text-xs font-medium rounded bg-nebula-purple/20 border border-nebula-purple/50 transition-colors hover:bg-nebula-purple/30 text-nebula-purple hover:text-nebula-purple"
            title="Insertar fórmula numerada"
          >
            Numerada ({equationCounter})
          </button>
          <button
            type="button"
            onClick={insertNamedEquation}
            className="px-3 py-1.5 text-xs font-medium rounded bg-nebula-purple/20 border border-nebula-purple/50 transition-colors hover:bg-nebula-purple/30 text-nebula-purple hover:text-nebula-purple"
            title="Insertar ecuación con nombre/etiqueta"
          >
            Con Nombre ({equationCounter})
          </button>
          
          {/* Desplegable de Definiciones y Teoremas */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDefinitionsDropdown(!showDefinitionsDropdown)}
              className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
              style={{ borderColor: 'var(--border-glow)' }}
              title="Definiciones y Teoremas"
            >
              Def/Teo ▼
            </button>
            {showDefinitionsDropdown && (
              <div className="absolute top-full left-0 mt-1 z-10 rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'var(--space-primary)' }}>
                <button
                  type="button"
                  onClick={() => {
                    insertNumberedDefinition();
                    setShowDefinitionsDropdown(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-xs hover:bg-space-secondary text-text-secondary"
                >
                  Definición Numerada ({definitionCounter})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    insertNumberedTheorem();
                    setShowDefinitionsDropdown(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-xs hover:bg-space-secondary text-text-secondary"
                >
                  Teorema Numerado ({theoremCounter})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Avanzadas */}
        <div className="flex flex-wrap gap-2 p-3 rounded-lg border" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.3)' }}>
          <span className="text-xs text-text-muted self-center mr-2 font-semibold">Avanzadas:</span>
          <button
            type="button"
            onClick={insertIntegral}
            className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
            style={{ borderColor: 'var(--border-glow)' }}
            title="Insertar integral con límites"
          >
            Integral
          </button>
          <button
            type="button"
            onClick={insertSummation}
            className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
            style={{ borderColor: 'var(--border-glow)' }}
            title="Insertar sumatoria con límites"
          >
            Sumatoria
          </button>
          <button
            type="button"
            onClick={insertMatrix}
            className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
            style={{ borderColor: 'var(--border-glow)' }}
            title="Insertar matriz"
          >
            Matriz
          </button>
          <button
            type="button"
            onClick={insertComplexFraction}
            className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
            style={{ borderColor: 'var(--border-glow)' }}
            title="Insertar fracción compleja"
          >
            Fracción Compleja
          </button>
          <button
            type="button"
            onClick={insertAlignedEquations}
            className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
            style={{ borderColor: 'var(--border-glow)' }}
            title="Insertar ecuaciones alineadas (múltiples ecuaciones)"
          >
            Ecuaciones Alineadas
          </button>
          <button
            type="button"
            onClick={insertCaseFunction}
            className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
            style={{ borderColor: 'var(--border-glow)' }}
            title="Insertar función por casos (piecewise)"
          >
            Función por Casos
          </button>
        </div>

        {/* Anclas */}
        <div className="flex flex-wrap gap-2 p-3 rounded-lg border" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.3)' }}>
          <span className="text-xs text-text-muted self-center mr-2 font-semibold">Anclas:</span>
          <button
            type="button"
            onClick={insertAnchoredEquation}
            className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
            style={{ borderColor: 'var(--border-glow)' }}
            title="Insertar ecuación con ancla (para referencias)"
          >
            Ecuación con Ancla
          </button>
          <button
            type="button"
            onClick={insertAnchoredEquationWithDescription}
            className="px-3 py-1.5 text-xs font-medium rounded bg-nebula-purple/20 border border-nebula-purple/50 transition-colors hover:bg-nebula-purple/30 text-nebula-purple hover:text-nebula-purple"
            title="Insertar ecuación con ancla y descripción (para IA)"
          >
            Ecuación con Ancla + Descripción
          </button>
          <button
            type="button"
            onClick={() => setShowReferenceSelector(true)}
            className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
            style={{ borderColor: 'var(--border-glow)' }}
            title="Insertar referencia a ecuación existente (de este u otros posts)"
          >
            Insertar Referencia
          </button>
          
          {/* Desplegable de Definiciones y Teoremas con Anclas */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTheoremsDropdown(!showTheoremsDropdown)}
              className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
              style={{ borderColor: 'var(--border-glow)' }}
              title="Definiciones y Teoremas con Anclas"
            >
              Def/Teo Anclas ▼
            </button>
            {showTheoremsDropdown && (
              <div className="absolute top-full left-0 mt-1 z-10 rounded-lg border overflow-hidden min-w-[200px]" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'var(--space-primary)' }}>
                <button
                  type="button"
                  onClick={() => {
                    insertAnchoredDefinition();
                    setShowTheoremsDropdown(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-xs hover:bg-space-secondary text-text-secondary border-b"
                  style={{ borderColor: 'var(--border-glow)' }}
                >
                  Definición con Ancla
                </button>
                <button
                  type="button"
                  onClick={() => {
                    insertAnchoredDefinitionWithDescription();
                    setShowTheoremsDropdown(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-xs hover:bg-space-secondary text-star-cyan border-b"
                  style={{ borderColor: 'var(--border-glow)' }}
                >
                  Definición + Descripción
                </button>
                <button
                  type="button"
                  onClick={() => {
                    insertAnchoredTheorem();
                    setShowTheoremsDropdown(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-xs hover:bg-space-secondary text-text-secondary border-b"
                  style={{ borderColor: 'var(--border-glow)' }}
                >
                  Teorema con Ancla
                </button>
                <button
                  type="button"
                  onClick={() => {
                    insertAnchoredTheoremWithDescription();
                    setShowTheoremsDropdown(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-xs hover:bg-space-secondary text-star-cyan border-b"
                  style={{ borderColor: 'var(--border-glow)' }}
                >
                  Teorema + Descripción
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDefinitionReferenceSelector(true);
                    setShowTheoremsDropdown(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-xs hover:bg-space-secondary text-text-secondary border-b"
                  style={{ borderColor: 'var(--border-glow)' }}
                >
                  Referencia a Definición
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTheoremReferenceSelector(true);
                    setShowTheoremsDropdown(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-xs hover:bg-space-secondary text-text-secondary"
                >
                  Referencia a Teorema
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Imágenes */}
        <div className="flex flex-wrap gap-2 p-3 rounded-lg border" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.3)' }}>
          <span className="text-xs text-text-muted self-center mr-2 font-semibold">Imágenes:</span>
          {postId && (
            <button
              type="button"
              onClick={() => setShowImageUploader(true)}
              className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
              style={{ borderColor: 'var(--border-glow)' }}
              title="Subir e insertar imagen"
            >
              Subir Imagen
            </button>
          )}
          <button
            type="button"
            onClick={insertImageAnchor}
            className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
            style={{ borderColor: 'var(--border-glow)' }}
            title="Insertar imagen con ancla (para referencias)"
          >
            Imagen con Ancla
          </button>
          <button
            type="button"
            onClick={insertImageAnchorWithDescription}
            className="px-3 py-1.5 text-xs font-medium rounded bg-nebula-purple/20 border border-nebula-purple/50 transition-colors hover:bg-nebula-purple/30 text-nebula-purple hover:text-nebula-purple"
            title="Insertar imagen con ancla y descripción (para IA)"
          >
            Imagen con Ancla + Descripción
          </button>
          {postId && (
            <button
              type="button"
              onClick={() => setShowImageReferenceSelector(true)}
              className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
              style={{ borderColor: 'var(--border-glow)' }}
              title="Insertar referencia a imagen existente"
            >
              Insertar Referencia a Imagen
            </button>
          )}
        </div>
      </div>

      {/* Modal de selección de referencias de ecuaciones */}
      {showReferenceSelector && (
        <EquationReferenceSelector
          postId={postId}
          currentPostSlug={currentPostSlug}
          onSelect={handleInsertReference}
          onClose={() => setShowReferenceSelector(false)}
        />
      )}

      {/* Modal de selección de referencias de imágenes */}
      {showImageReferenceSelector && postId && (
        <ImageReferenceSelector
          postId={postId}
          currentPostSlug={currentPostSlug}
          onSelect={handleInsertImageReference}
          onClose={() => setShowImageReferenceSelector(false)}
        />
      )}

      {/* Modal de selección de referencias de definiciones */}
      {showDefinitionReferenceSelector && (
        <DefinitionReferenceSelector
          postId={postId}
          currentPostSlug={currentPostSlug}
          onSelect={handleInsertDefinitionReference}
          onClose={() => setShowDefinitionReferenceSelector(false)}
        />
      )}

      {/* Modal de selección de referencias de teoremas */}
      {showTheoremReferenceSelector && (
        <TheoremReferenceSelector
          postId={postId}
          currentPostSlug={currentPostSlug}
          onSelect={handleInsertTheoremReference}
          onClose={() => setShowTheoremReferenceSelector(false)}
        />
      )}

      {/* Modal de subida de imágenes */}
      {showImageUploader && postId && (
        <ImageUploader
          postId={postId}
          onSelect={handleImageSelect}
          onClose={() => setShowImageUploader(false)}
        />
      )}

      {/* Tabs para cambiar vista */}
      <div className="flex gap-2 mb-4 border-b" style={{ borderColor: 'var(--border-glow)' }}>
        <button
          type="button"
          onClick={() => setView('edit')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            view === 'edit'
              ? 'text-star-cyan border-b-2'
              : 'text-text-muted hover:text-text-secondary'
          }`}
          style={view === 'edit' ? { borderColor: 'var(--star-cyan)' } : {}}
        >
          Editor
        </button>
        <button
          type="button"
          onClick={() => setView('preview')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            view === 'preview'
              ? 'text-star-cyan border-b-2'
              : 'text-text-muted hover:text-text-secondary'
          }`}
          style={view === 'preview' ? { borderColor: 'var(--star-cyan)' } : {}}
        >
          Preview
        </button>
        <button
          type="button"
          onClick={() => setView('split')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            view === 'split'
              ? 'text-star-cyan border-b-2'
              : 'text-text-muted hover:text-text-secondary'
          }`}
          style={view === 'split' ? { borderColor: 'var(--star-cyan)' } : {}}
        >
          Split
        </button>
      </div>

      {/* Contenedor del editor */}
      <div className="flex gap-4" style={{ minHeight: '500px' }}>
        {/* Editor */}
        {(view === 'edit' || view === 'split') && (
          <div className={`${view === 'split' ? 'w-1/2' : 'w-full'}`}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full h-full min-h-[500px] p-4 rounded-lg border bg-space-primary text-text-primary placeholder-text-muted font-mono text-sm resize-none focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20"
              style={{
                borderColor: 'var(--border-glow)',
              }}
            />
          </div>
        )}

        {/* Preview */}
        {(view === 'preview' || view === 'split') && (
          <div
            className={`${
              view === 'split' ? 'w-1/2' : 'w-full'
            } p-4 rounded-lg border overflow-y-auto`}
            style={{
              borderColor: 'var(--border-glow)',
              backgroundColor: 'rgba(26, 26, 46, 0.3)',
              minHeight: '500px',
            }}
          >
            {value ? (
              <MarkdownRenderer content={value} currentSlug={currentPostSlug} />
            ) : (
              <p className="text-text-muted italic">El preview aparecerá aquí...</p>
            )}
          </div>
        )}
      </div>

      {/* Sección de ejemplos de anclas */}
      <div className="mt-6 rounded-lg border" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.3)' }}>
        <button
          type="button"
          onClick={() => setShowExamples(!showExamples)}
          className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-space-secondary"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">Ejemplos de Anclas</span>
            <span className="text-xs text-text-muted">(Click para expandir/colapsar)</span>
          </div>
          <span className="text-text-muted">{showExamples ? '▼' : '▶'}</span>
        </button>

        {showExamples && (
          <div className="p-4 pt-0 space-y-4">
            {/* Ejemplo 1: Ecuación básica con ancla */}
            <div className="rounded border p-3" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.5)' }}>
              <h4 className="text-sm font-semibold text-star-cyan mb-2">1. Ecuación con ancla básica</h4>
              <pre className="text-xs text-text-secondary font-mono overflow-x-auto mb-2">
{'$${#eq:einstein-e=mc2}\nE = mc^2 \\tag{Ecuación de Einstein}\n$$'}
              </pre>
              <p className="text-xs text-text-muted">
                Crea una ecuación con ID único "einstein-e=mc2" que puede ser referenciada desde otros posts.
              </p>
            </div>

            {/* Ejemplo 2: Ecuación con descripción */}
            <div className="rounded border p-3" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.5)' }}>
              <h4 className="text-sm font-semibold text-star-cyan mb-2">2. Ecuación con ancla y descripción (para IA)</h4>
              <pre className="text-xs text-text-secondary font-mono overflow-x-auto mb-2">
{'$${#eq:integral-gauss|descripción: Integral de Gauss, fundamental en probabilidad y estadística}\n\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}\n$$'}
              </pre>
              <p className="text-xs text-text-muted">
                La descripción ayuda a futuras búsquedas con IA para encontrar ecuaciones relacionadas.
              </p>
            </div>

            {/* Ejemplo 3: Referencia al mismo post */}
            <div className="rounded border p-3" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.5)' }}>
              <h4 className="text-sm font-semibold text-star-cyan mb-2">3. Referencia a ecuación del mismo post</h4>
              <pre className="text-xs text-text-secondary font-mono overflow-x-auto mb-2">
{'Como vimos en {{eq:einstein-e=mc2|la ecuación de Einstein}}, \nla energía y la masa están relacionadas.'}
              </pre>
              <p className="text-xs text-text-muted">
                Usa solo el ID del anchor cuando la ecuación está en el mismo post.
              </p>
            </div>

            {/* Ejemplo 4: Referencia a otro post */}
            <div className="rounded border p-3" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.5)' }}>
              <h4 className="text-sm font-semibold text-star-cyan mb-2">4. Referencia a ecuación de otro post</h4>
              <pre className="text-xs text-text-secondary font-mono overflow-x-auto mb-2">
{'Según {{eq:relatividad-especial/einstein-e=mc2|la ecuación de Einstein}} \ndel post sobre relatividad especial, podemos calcular...'}
              </pre>
              <p className="text-xs text-text-muted">
                Usa "slug-del-post/anchor-id" para referenciar ecuaciones de otros posts.
              </p>
            </div>

            {/* Ejemplo 5: Múltiples ecuaciones con anclas */}
            <div className="rounded border p-3" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.5)' }}>
              <h4 className="text-sm font-semibold text-star-cyan mb-2">5. Sistema de ecuaciones con anclas</h4>
              <pre className="text-xs text-text-secondary font-mono overflow-x-auto mb-2">
{'$${#eq:sistema-newton|descripción: Segunda ley de Newton y fuerza}\n\\begin{align}\nF &= ma \\tag{1} \\\\\nE &= \\frac{1}{2}mv^2 \\tag{2}\n\\end{align}\n$$'}
              </pre>
              <p className="text-xs text-text-muted">
                Puedes crear sistemas completos de ecuaciones con una sola ancla.
              </p>
            </div>

            {/* Tips */}
            <div className="rounded border p-3 border-star-gold/30 bg-star-gold/5">
              <h4 className="text-sm font-semibold text-star-gold mb-2">💡 Consejos</h4>
              <ul className="text-xs text-text-secondary space-y-1 list-disc list-inside">
                <li>Los IDs de anclas deben ser únicos dentro del mismo post</li>
                <li>Usa IDs descriptivos y en minúsculas con guiones (ej: "einstein-e=mc2")</li>
                <li>Las descripciones ayudan a futuras búsquedas con IA</li>
                <li>Puedes copiar el enlace a una ecuación haciendo hover sobre ella</li>
                <li>Usa el botón "Insertar Referencia" para buscar ecuaciones disponibles</li>
              </ul>
            </div>
          </div>
        )}

        {/* Sección de Ejemplos de Anclas de Imágenes */}
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setShowImageExamples(!showImageExamples)}
            className="flex items-center gap-2 text-star-cyan hover:text-star-cyan/80 transition-colors text-sm font-semibold mb-4"
          >
            {showImageExamples ? '▼ Ocultar Ejemplos de Anclas de Imágenes' : '▶ Mostrar Ejemplos de Anclas de Imágenes'}
          </button>

          {showImageExamples && (
            <div className="space-y-4">
              {/* Ejemplo 1: Imagen con ancla básica */}
              <div className="rounded border p-3" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.5)' }}>
                <h4 className="text-sm font-semibold text-star-cyan mb-2">1. Imagen con ancla básica</h4>
                <pre className="text-xs text-text-secondary font-mono overflow-x-auto mb-2">
{'![Diagrama de flujo](/uploads/posts/post-id/diagrama.png){#img:diagrama-flujo}'}
                </pre>
                <p className="text-xs text-text-muted">
                  Crea una imagen con ID único "diagrama-flujo" que puede ser referenciada desde otros posts.
                </p>
              </div>

              {/* Ejemplo 2: Imagen con descripción */}
              <div className="rounded border p-3" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.5)' }}>
                <h4 className="text-sm font-semibold text-star-cyan mb-2">2. Imagen con ancla y descripción (para IA)</h4>
                <pre className="text-xs text-text-secondary font-mono overflow-x-auto mb-2">
{'![Arquitectura del sistema](/uploads/posts/post-id/arquitectura.png){#img:arquitectura-sistema|descripción: Diagrama de arquitectura del sistema distribuido}'}
                </pre>
                <p className="text-xs text-text-muted">
                  La descripción ayuda a futuras búsquedas con IA para encontrar imágenes relacionadas.
                </p>
              </div>

              {/* Ejemplo 3: Referencia al mismo post */}
              <div className="rounded border p-3" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.5)' }}>
                <h4 className="text-sm font-semibold text-star-cyan mb-2">3. Referencia a imagen del mismo post</h4>
                <pre className="text-xs text-text-secondary font-mono overflow-x-auto mb-2">
{'Como vemos en {{img:diagrama-flujo|el diagrama anterior}},\nel proceso consta de tres etapas.'}
                </pre>
                <p className="text-xs text-text-muted">
                  Usa solo el ID del anchor cuando la imagen está en el mismo post.
                </p>
              </div>

              {/* Ejemplo 4: Referencia a otro post */}
              <div className="rounded border p-3" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.5)' }}>
                <h4 className="text-sm font-semibold text-star-cyan mb-2">4. Referencia a imagen de otro post</h4>
                <pre className="text-xs text-text-secondary font-mono overflow-x-auto mb-2">
{'Según {{img:arquitectura-microservicios/arquitectura-sistema|el diagrama del post anterior}}\nsobre arquitectura de microservicios, podemos observar...'}
                </pre>
                <p className="text-xs text-text-muted">
                  Usa "slug-del-post/anchor-id" para referenciar imágenes de otros posts.
                </p>
              </div>

              {/* Tips */}
              <div className="rounded border p-3 border-star-gold/30 bg-star-gold/5">
                <h4 className="text-sm font-semibold text-star-gold mb-2">💡 Consejos</h4>
                <ul className="text-xs text-text-secondary space-y-1 list-disc list-inside">
                  <li>Los IDs de anclas deben ser únicos dentro del mismo post</li>
                  <li>Usa IDs descriptivos y en minúsculas con guiones (ej: "diagrama-flujo")</li>
                  <li>Las descripciones ayudan a futuras búsquedas con IA</li>
                  <li>Puedes copiar el enlace a una imagen haciendo hover sobre ella</li>
                  <li>Usa el botón "Insertar Referencia a Imagen" para buscar imágenes disponibles</li>
                  <li>Puedes añadir anclas a imágenes ya insertadas manualmente usando las plantillas</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

