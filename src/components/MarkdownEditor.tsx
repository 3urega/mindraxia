'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import ReferenceSelectorModal from './ReferenceSelectorModal';
import ImageUploader from './ImageUploader';
import { useEditorPreviewSync } from '@/hooks/useEditorPreviewSync';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  postId?: string; // ID del post para obtener ecuaciones disponibles
  currentPostSlug?: string; // Slug del post actual para referencias relativas
  onSave?: () => void; // Función para guardar
  onSaveAndContinue?: () => void; // Función para guardar y continuar
  saving?: boolean; // Estado de guardado
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Escribe tu contenido en markdown...',
  postId,
  currentPostSlug,
  onSave,
  onSaveAndContinue,
  saving = false,
}: MarkdownEditorProps) {
  const [view, setView] = useState<'split' | 'edit' | 'preview'>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [equationCounter, setEquationCounter] = useState(1);
  const [definitionCounter, setDefinitionCounter] = useState(1);
  const [theoremCounter, setTheoremCounter] = useState(1);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showImageExamples, setShowImageExamples] = useState(false);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [isPanelAnimating, setIsPanelAnimating] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [toolbarTop, setToolbarTop] = useState(0);

  // Calcular la posición de la barra de herramientas basada en la altura del header
  useEffect(() => {
    const calculateToolbarPosition = () => {
      // Buscar el header del admin (sticky)
      const adminHeader = document.querySelector('header.sticky');
      if (adminHeader) {
        const headerHeight = adminHeader.getBoundingClientRect().height;
        setToolbarTop(headerHeight);
      } else {
        // Si no hay header admin, usar 0 (para páginas públicas)
        setToolbarTop(0);
      }
    };

    calculateToolbarPosition();
    window.addEventListener('resize', calculateToolbarPosition);
    
    // Recalcular después de un pequeño delay para asegurar que el DOM esté listo
    const timeout = setTimeout(calculateToolbarPosition, 100);

    return () => {
      window.removeEventListener('resize', calculateToolbarPosition);
      clearTimeout(timeout);
    };
  }, []);

  // Hook de sincronización editor-preview (solo en modo split)
  useEditorPreviewSync({
    enabled: view === 'split',
    markdownContent: value,
    previewContainerRef,
    textareaRef,
  });

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

  // Función para aplicar formato al texto seleccionado
  const applyFormat = (before: string, after: string = '', placeholder: string = 'texto') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newValue: string;
    let newCursorPos: number;

    if (selectedText) {
      // Si hay texto seleccionado, envolverlo con el formato
      newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);
      newCursorPos = start + before.length + selectedText.length + after.length;
    } else {
      // Si no hay selección, insertar plantilla
      newValue = value.substring(0, start) + before + placeholder + after + value.substring(end);
      newCursorPos = start + before.length + placeholder.length;
    }

    onChange(newValue);

    setTimeout(() => {
      if (textarea) {
        if (selectedText) {
          // Si había selección, colocar cursor al final del texto formateado
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        } else {
          // Si no había selección, seleccionar el placeholder para fácil edición
          const placeholderStart = start + before.length;
          const placeholderEnd = placeholderStart + placeholder.length;
          textarea.setSelectionRange(placeholderStart, placeholderEnd);
        }
        textarea.focus();
      }
    }, 0);
  };

  // Funciones de formato
  const applyBold = () => applyFormat('**', '**', 'texto en negrita');
  const applyItalic = () => applyFormat('*', '*', 'texto en cursiva');
  const applyUnderline = () => applyFormat('<u>', '</u>', 'texto subrayado');
  const applyStrikethrough = () => applyFormat('~~', '~~', 'texto tachado');
  const applyCode = () => applyFormat('`', '`', 'código');
  const applyYellowHighlight = () => applyFormat('==', '==', 'texto resaltado');
  const applyPinkHighlight = () => applyFormat('::', '::', 'texto resaltado');
  const applyCodeBlock = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newValue: string;
    let newCursorPos: number;

    if (selectedText) {
      newValue = value.substring(0, start) + '```\n' + selectedText + '\n```' + value.substring(end);
      newCursorPos = start + 4 + selectedText.length + 5;
    } else {
      newValue = value.substring(0, start) + '```\ncódigo\n```' + value.substring(end);
      newCursorPos = start + 7;
    }

    onChange(newValue);

    setTimeout(() => {
      if (textarea) {
        if (selectedText) {
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        } else {
          const codeStart = start + 4;
          const codeEnd = codeStart + 6;
          textarea.setSelectionRange(codeStart, codeEnd);
        }
        textarea.focus();
      }
    }, 0);
  };

  const applyLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newValue: string;
    let newCursorPos: number;

    if (selectedText) {
      newValue = value.substring(0, start) + `[${selectedText}](url)` + value.substring(end);
      newCursorPos = start + selectedText.length + 3;
    } else {
      newValue = value.substring(0, start) + '[texto del enlace](url)' + value.substring(end);
      newCursorPos = start + 18;
    }

    onChange(newValue);

    setTimeout(() => {
      if (textarea) {
        if (selectedText) {
          // Seleccionar "url" para fácil edición
          const urlStart = start + selectedText.length + 3;
          const urlEnd = urlStart + 3;
          textarea.setSelectionRange(urlStart, urlEnd);
        } else {
          // Seleccionar "texto del enlace"
          const textStart = start + 1;
          const textEnd = textStart + 16;
          textarea.setSelectionRange(textStart, textEnd);
        }
        textarea.focus();
      }
    }, 0);
  };

  const applyHeading = (level: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const hashes = '#'.repeat(level);
    
    let newValue: string;
    let newCursorPos: number;

    // Si estamos al inicio de una línea o hay texto seleccionado
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const isStartOfLine = start === lineStart;

    if (selectedText) {
      newValue = value.substring(0, start) + `${hashes} ${selectedText}` + value.substring(end);
      newCursorPos = start + hashes.length + 1 + selectedText.length;
    } else if (isStartOfLine) {
      newValue = value.substring(0, start) + `${hashes} ` + value.substring(end);
      newCursorPos = start + hashes.length + 1;
    } else {
      // Insertar en nueva línea
      newValue = value.substring(0, start) + `\n${hashes} ` + value.substring(end);
      newCursorPos = start + hashes.length + 3;
    }

    onChange(newValue);

    setTimeout(() => {
      if (textarea) {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }
    }, 0);
  };

  const applyList = (ordered: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newValue: string;
    let newCursorPos: number;

    // Detectar si estamos al inicio de una línea
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const isStartOfLine = start === lineStart;

    if (selectedText) {
      // Si hay texto seleccionado, convertirlo en lista
      const lines = selectedText.split('\n');
      const listItems = lines.map((line, index) => {
        if (ordered) {
          return `${index + 1}. ${line}`;
        } else {
          return `- ${line}`;
        }
      }).join('\n');
      
      newValue = value.substring(0, start) + listItems + value.substring(end);
      newCursorPos = start + listItems.length;
    } else {
      // Insertar item de lista
      const prefix = ordered ? '1. ' : '- ';
      if (isStartOfLine) {
        newValue = value.substring(0, start) + prefix + value.substring(end);
        newCursorPos = start + prefix.length;
      } else {
        newValue = value.substring(0, start) + `\n${prefix}` + value.substring(end);
        newCursorPos = start + prefix.length + 1;
      }
    }

    onChange(newValue);

    setTimeout(() => {
      if (textarea) {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }
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

  // Insertar demostración con ancla
  const insertAnchoredProof = () => {
    const template = ':::proof{#prf:}\nContenido de la demostración.\n:::\n';
    insertText(template);
    // Mover cursor al ID del anchor
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + template.indexOf('{#prf:') + 6;
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 10);
  };

  // Insertar demostración con ancla y descripción
  const insertAnchoredProofWithDescription = () => {
    const template = ':::proof{#prf:|descripción: }\nContenido de la demostración.\n:::\n';
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

  // Insertar límite genérico
  const insertLimit = () => {
    const template = '\\lim\\limits_{x \\to a} \\frac{f(x)}{g(x)}';
    insertText(template);
    // Mover cursor a la posición de 'a' (límite)
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + template.indexOf('a}') - 1;
        textarea.setSelectionRange(newPos, newPos + 1);
      }
    }, 10);
  };

  // Insertar derivada
  const insertDerivative = () => {
    const template = '\\frac{d}{dx}f(x)';
    insertText(template);
    // Mover cursor a f(x)
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + template.indexOf('f(x)');
        textarea.setSelectionRange(newPos, newPos + 3);
      }
    }, 10);
  };

  // Insertar fracción simple
  const insertFraction = () => {
    const template = '\\frac{a}{b}';
    insertText(template);
    // Mover cursor al numerador
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + template.indexOf('a}') - 1;
        textarea.setSelectionRange(newPos, newPos + 1);
      }
    }, 10);
  };

  // Insertar raíz cuadrada
  const insertSquareRoot = () => {
    const template = '\\sqrt{x}';
    insertText(template);
    // Mover cursor a x
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + template.indexOf('x}') - 1;
        textarea.setSelectionRange(newPos, newPos + 1);
      }
    }, 10);
  };

  // Insertar potencia/exponente
  const insertPower = () => {
    const template = 'x^{n}';
    insertText(template);
    // Mover cursor al exponente
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + template.indexOf('n}') - 1;
        textarea.setSelectionRange(newPos, newPos + 1);
      }
    }, 10);
  };

  // Insertar logaritmo
  const insertLogarithm = () => {
    const template = '\\log(x)';
    insertText(template);
    // Mover cursor a x
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + template.indexOf('x)') - 1;
        textarea.setSelectionRange(newPos, newPos + 1);
      }
    }, 10);
  };

  // Insertar exponencial
  const insertExponential = () => {
    const template = 'e^{x}';
    insertText(template);
    // Mover cursor al exponente
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + template.indexOf('x}') - 1;
        textarea.setSelectionRange(newPos, newPos + 1);
      }
    }, 10);
  };

  // Insertar producto
  const insertProduct = () => {
    const template = '\\prod_{i=1}^{n} a_i';
    insertText(template);
    // Mover cursor a a_i
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        const newPos = startPos + template.indexOf('a_i');
        textarea.setSelectionRange(newPos, newPos + 3);
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

  // Insertar sección
  const insertSection = () => {
    const template = `[[section:Nombre de la Sección]]\n\n`;
    insertText(template);
    // Mover cursor al nombre de la sección para fácil edición
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        // Posición después de [[section:
        const newPos = startPos + 11;
        // Seleccionar "Nombre de la Sección" para fácil reemplazo
        const endPos = newPos + 22;
        textarea.setSelectionRange(newPos, endPos);
      }
    }, 10);
  };

  // Insertar subsección
  const insertSubsection = () => {
    const template = `[[subsection:Nombre de la Subsección]]\n\n`;
    insertText(template);
    // Mover cursor al nombre de la subsección para fácil edición
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        // Posición después de [[subsection:
        const newPos = startPos + 14;
        // Seleccionar "Nombre de la Subsección" para fácil reemplazo
        const endPos = newPos + 25;
        textarea.setSelectionRange(newPos, endPos);
      }
    }, 10);
  };

  // Insertar desplegable (expand)
  const insertExpandable = () => {
    const template = `:::expand{Título del desplegable}\nContenido que se mostrará cuando se expanda\n:::\n`;
    insertText(template);
    // Mover cursor al título del desplegable para fácil edición
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        // Posición después de :::expand{
        const newPos = startPos + 13;
        // Seleccionar "Título del desplegable" para fácil reemplazo
        const endPos = newPos + 23;
        textarea.setSelectionRange(newPos, endPos);
      }
    }, 10);
  };

  // Insertar gráfico Plotly 3D básico
  const insertPlotly3D = () => {
    const template = `\`\`\`plotly3d
{
  "data": [{
    "type": "scatter3d",
    "mode": "markers",
    "x": [1, 2, 3],
    "y": [1, 2, 3],
    "z": [1, 2, 3],
    "marker": {
      "size": 5,
      "color": "red"
    }
  }],
  "layout": {
    "scene": {
      "xaxis": {"title": "X"},
      "yaxis": {"title": "Y"},
      "zaxis": {"title": "Z"}
    },
    "title": "Gráfico 3D"
  }
}
\`\`\`
`;
    insertText(template);
    // Mover cursor al inicio del JSON para fácil edición
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        // Posición después de ```plotly3d\n
        const newPos = startPos + 13;
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 10);
  };

  // Insertar vector 3D con Plotly
  const insertPlotly3DVector = () => {
    const template = `\`\`\`plotly3d
{
  "data": [{
    "type": "scatter3d",
    "mode": "lines+markers",
    "x": [0, 1],
    "y": [0, 1],
    "z": [0, 1],
    "line": {
      "color": "red",
      "width": 5
    },
    "marker": {
      "size": 5,
      "color": "red"
    },
    "name": "Vector"
  }],
  "layout": {
    "scene": {
      "xaxis": {"title": "X", "range": [-1, 2]},
      "yaxis": {"title": "Y", "range": [-1, 2]},
      "zaxis": {"title": "Z", "range": [-1, 2]},
      "camera": {
        "eye": {"x": 1.5, "y": 1.5, "z": 1.5}
      }
    },
    "title": "Vector 3D"
  }
}
\`\`\`
`;
    insertText(template);
    // Mover cursor a las coordenadas del vector
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        // Posición en "x": [0, 1]
        const newPos = startPos + template.indexOf('"x": [0, 1]') + 6;
        textarea.setSelectionRange(newPos, newPos + 5); // Seleccionar [0, 1]
      }
    }, 10);
  };

  // Insertar gráfico Plotly 3D con ancla
  const insertPlotly3DWithAnchor = () => {
    const template = `\`\`\`plotly3d-anchor:grafico-ejemplo
{
  "data": [{
    "type": "scatter3d",
    "mode": "markers",
    "x": [1, 2, 3],
    "y": [1, 2, 3],
    "z": [1, 2, 3],
    "marker": {
      "size": 5,
      "color": "red"
    }
  }],
  "layout": {
    "scene": {
      "xaxis": {"title": "X"},
      "yaxis": {"title": "Y"},
      "zaxis": {"title": "Z"}
    },
    "title": "Gráfico 3D"
  }
}
\`\`\`
`;
    insertText(template);
    // Mover cursor al ID del anchor
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - template.length;
        // Posición después de plotly3d-anchor:
        const newPos = startPos + template.indexOf('grafico-ejemplo');
        // Seleccionar "grafico-ejemplo" para fácil reemplazo
        const endPos = newPos + 16;
        textarea.setSelectionRange(newPos, endPos);
      }
    }, 10);
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
  const handleInsertImageReference = (anchorId: string, postSlug: string, embed?: boolean) => {
    console.log('[MarkdownEditor] handleInsertImageReference llamado:', { anchorId, postSlug, currentPostSlug, embed });
    try {
      let referenceText: string;
      const embedFlag = embed ? '|embed' : '';
      if (currentPostSlug === postSlug || !currentPostSlug) {
        // Referencia al mismo post: {{img:anchor-id|texto}} o {{img:anchor-id|texto|embed}}
        referenceText = `{{img:${anchorId}|texto del enlace${embedFlag}}}`;
      } else {
        // Referencia a otro post: {{img:post-slug/anchor-id|texto}} o {{img:post-slug/anchor-id|texto|embed}}
        referenceText = `{{img:${postSlug}/${anchorId}|texto del enlace${embedFlag}}}`;
      }

      console.log('[MarkdownEditor] Insertando referencia de imagen:', referenceText);
      insertText(referenceText);

      // Seleccionar "texto del enlace" para fácil edición
      setTimeout(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          const currentPos = textarea.selectionStart;
          const startPos = currentPos - referenceText.length;
          // Posición después del primer |
          const firstPipePos = referenceText.indexOf('|') + 1;
          // Si tiene embed, encontrar el segundo | (antes de embed)
          // Si no tiene embed, usar el final antes de }}
          const endPos = embed 
            ? startPos + referenceText.lastIndexOf('|') // Segundo | (antes de embed)
            : startPos + referenceText.length - 2; // Antes de }}
          textarea.setSelectionRange(startPos + firstPipePos, endPos);
        }
      }, 10);
    } catch (err) {
      console.error('[MarkdownEditor] Error al insertar referencia de imagen:', err);
    }
  };

  // Insertar referencia a ecuación
  const handleInsertReference = (anchorId: string, postSlug: string, embed?: boolean) => {
    // Determinar si es referencia al mismo post o a otro
    // Por ahora asumimos que si no hay postId, es referencia al mismo post
    const isSamePost = !postId; // Si no hay postId, es nuevo post, así que misma referencia
    
    let referenceText: string;
    const embedFlag = embed ? '|embed' : '';
    if (isSamePost) {
      // Referencia al mismo post: {{eq:anchor-id|texto}} o {{eq:anchor-id|texto|embed}}
      referenceText = `{{eq:${anchorId}|texto del enlace${embedFlag}}}`;
    } else {
      // Referencia a otro post: {{eq:post-slug/anchor-id|texto}} o {{eq:post-slug/anchor-id|texto|embed}}
      referenceText = `{{eq:${postSlug}/${anchorId}|texto del enlace${embedFlag}}}`;
    }
    
    insertText(referenceText);
    
    // Seleccionar "texto del enlace" para fácil edición
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - referenceText.length;
        // Posición después del primer |
        const firstPipePos = referenceText.indexOf('|') + 1;
        // Si tiene embed, encontrar el segundo | (antes de embed)
        // Si no tiene embed, usar el final antes de }}
        const endPos = embed 
          ? startPos + referenceText.lastIndexOf('|') // Segundo | (antes de embed)
          : startPos + referenceText.length - 2; // Antes de }}
        textarea.setSelectionRange(startPos + firstPipePos, endPos);
      }
    }, 10);
  };

  // Insertar referencia a definición
  const handleInsertDefinitionReference = (anchorId: string, postSlug: string, embed?: boolean) => {
    const isSamePost = !postId || currentPostSlug === postSlug;
    
    let referenceText: string;
    const embedFlag = embed ? '|embed' : '';
    if (isSamePost) {
      referenceText = `{{def:${anchorId}|texto del enlace${embedFlag}}}`;
    } else {
      referenceText = `{{def:${postSlug}/${anchorId}|texto del enlace${embedFlag}}}`;
    }
    
    insertText(referenceText);
    
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - referenceText.length;
        // Posición después del primer |
        const firstPipePos = referenceText.indexOf('|') + 1;
        // Si tiene embed, encontrar el segundo | (antes de embed)
        // Si no tiene embed, usar el final antes de }}
        const endPos = embed 
          ? startPos + referenceText.lastIndexOf('|') // Segundo | (antes de embed)
          : startPos + referenceText.length - 2; // Antes de }}
        textarea.setSelectionRange(startPos + firstPipePos, endPos);
      }
    }, 10);
  };

  // Insertar referencia a teorema
  const handleInsertTheoremReference = (anchorId: string, postSlug: string, embed?: boolean) => {
    const isSamePost = !postId || currentPostSlug === postSlug;
    
    let referenceText: string;
    const embedFlag = embed ? '|embed' : '';
    if (isSamePost) {
      referenceText = `{{thm:${anchorId}|texto del enlace${embedFlag}}}`;
    } else {
      referenceText = `{{thm:${postSlug}/${anchorId}|texto del enlace${embedFlag}}}`;
    }
    
    insertText(referenceText);
    
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const startPos = currentPos - referenceText.length;
        // Posición después del primer |
        const firstPipePos = referenceText.indexOf('|') + 1;
        // Si tiene embed, encontrar el segundo | (antes de embed)
        // Si no tiene embed, usar el final antes de }}
        const endPos = embed 
          ? startPos + referenceText.lastIndexOf('|') // Segundo | (antes de embed)
          : startPos + referenceText.length - 2; // Antes de }}
        textarea.setSelectionRange(startPos + firstPipePos, endPos);
      }
    }, 10);
  };

  // Hook para detectar cuando la barra de herramientas sale de vista
  useEffect(() => {
    const handleScroll = () => {
      if (!toolbarRef.current) return;
      
      const rect = toolbarRef.current.getBoundingClientRect();
      // La barra está fuera de vista si está completamente arriba del viewport
      const isOutOfView = rect.bottom < 0;
      
      // Mostrar botón flotante si la barra está fuera de vista
      setShowFloatingButton(isOutOfView);
    };

    // Verificar inicialmente después de un pequeño delay para asegurar que el DOM está listo
    const timeoutId = setTimeout(handleScroll, 100);

    // Escuchar eventos de scroll en toda la ventana y en contenedores
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);

    // También escuchar scroll en el contenedor padre si existe
    const container = toolbarRef.current?.closest('[data-scroll-container]') || document;
    container.addEventListener('scroll', handleScroll, true);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
      container.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  // Activar animación cuando se abre el panel
  useEffect(() => {
    if (showFloatingToolbar) {
      // Pequeño delay para que el DOM se monte antes de animar
      const timeoutId = setTimeout(() => setIsPanelAnimating(true), 10);
      return () => clearTimeout(timeoutId);
    } else {
      setIsPanelAnimating(false);
    }
  }, [showFloatingToolbar]);

  // Cerrar panel con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFloatingToolbar) {
        setIsPanelAnimating(false);
        setTimeout(() => setShowFloatingToolbar(false), 300);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showFloatingToolbar]);

  // Función para renderizar la barra de herramientas (reutilizable)
  const renderToolbar = useCallback(() => (
    <div className="space-y-3">
      {/* Básicas */}
      <div className="flex flex-wrap gap-2 p-3 rounded-lg border" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.3)' }}>
        <span className="text-xs text-text-muted self-center mr-2 font-semibold">Básicas:</span>
        <select
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'inline') insertInlineFormula();
            else if (value === 'block') insertBlockFormula();
            else if (value === 'numbered') insertNumberedFormula();
            else if (value === 'named') insertNamedEquation();
            else if (value === 'definition') insertNumberedDefinition();
            else if (value === 'theorem') insertNumberedTheorem();
            e.target.value = '';
          }}
          className="px-3 py-1.5 text-xs font-medium rounded border transition-colors text-text-secondary focus:outline-none focus:border-star-cyan"
          style={{ 
            borderColor: 'var(--border-glow)',
            backgroundColor: 'rgb(26, 26, 46)',
            color: 'var(--text-secondary)'
          }}
          defaultValue=""
        >
          <option value="" disabled>Seleccionar opción...</option>
          <option value="inline">Fórmula Inline ($...$)</option>
          <option value="block">Fórmula Bloque ($$...$$)</option>
          <option value="numbered">Fórmula Numerada ({equationCounter})</option>
          <option value="named">Ecuación con Nombre ({equationCounter})</option>
          <option value="definition">Definición Numerada ({definitionCounter})</option>
          <option value="theorem">Teorema Numerado ({theoremCounter})</option>
        </select>
        
        <span className="text-xs text-text-muted self-center mr-2 ml-4 font-semibold">Avanzadas:</span>
        <select
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'integral') insertIntegral();
            else if (value === 'summation') insertSummation();
            else if (value === 'matrix') insertMatrix();
            else if (value === 'complex-fraction') insertComplexFraction();
            else if (value === 'aligned') insertAlignedEquations();
            else if (value === 'cases') insertCaseFunction();
            e.target.value = '';
          }}
          className="px-3 py-1.5 text-xs font-medium rounded border transition-colors text-text-secondary focus:outline-none focus:border-star-cyan"
          style={{ 
            borderColor: 'var(--border-glow)',
            backgroundColor: 'rgb(26, 26, 46)',
            color: 'var(--text-secondary)'
          }}
          defaultValue=""
        >
          <option value="" disabled>Seleccionar opción...</option>
          <option value="integral">Integral</option>
          <option value="summation">Sumatoria</option>
          <option value="matrix">Matriz</option>
          <option value="complex-fraction">Fracción Compleja</option>
          <option value="aligned">Ecuaciones Alineadas</option>
          <option value="cases">Función por Casos</option>
        </select>
        
        <span className="text-xs text-text-muted self-center mr-2 ml-4 font-semibold">Anclas:</span>
        <select
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'eq-anchor') insertAnchoredEquation();
            else if (value === 'eq-anchor-desc') insertAnchoredEquationWithDescription();
            else if (value === 'def-anchor') insertAnchoredDefinition();
            else if (value === 'def-anchor-desc') insertAnchoredDefinitionWithDescription();
            else if (value === 'thm-anchor') insertAnchoredTheorem();
            else if (value === 'thm-anchor-desc') insertAnchoredTheoremWithDescription();
            else if (value === 'prf-anchor') insertAnchoredProof();
            else if (value === 'prf-anchor-desc') insertAnchoredProofWithDescription();
            e.target.value = '';
          }}
          className="px-3 py-1.5 text-xs font-medium rounded border transition-colors text-text-secondary focus:outline-none focus:border-star-cyan"
          style={{ 
            borderColor: 'var(--border-glow)',
            backgroundColor: 'rgb(26, 26, 46)',
            color: 'var(--text-secondary)'
          }}
          defaultValue=""
        >
          <option value="" disabled>Seleccionar opción...</option>
          <option value="eq-anchor">Ecuación con Ancla</option>
          <option value="eq-anchor-desc">Ecuación + Descripción</option>
          <option value="def-anchor">Definición con Ancla</option>
          <option value="def-anchor-desc">Definición + Descripción</option>
          <option value="thm-anchor">Teorema con Ancla</option>
          <option value="thm-anchor-desc">Teorema + Descripción</option>
          <option value="prf-anchor">Demostración con Ancla</option>
          <option value="prf-anchor-desc">Demostración + Descripción</option>
        </select>
        
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowReferenceModal(true);
          }}
          className="px-4 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan ml-4"
          style={{ borderColor: 'var(--border-glow)' }}
          title="Insertar referencia a ecuación, imagen, definición o teorema"
        >
          🔗 Referencias
        </button>
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowReferenceModal(true);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
            style={{ borderColor: 'var(--border-glow)' }}
            title="Insertar referencia a imagen existente"
          >
            Insertar Referencia a Imagen
          </button>
        )}
      </div>

      {/* Expresiones Matemáticas Comunes */}
      <div className="flex flex-wrap gap-2 p-3 rounded-lg border" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.3)' }}>
        <span className="text-xs text-text-muted self-center mr-2 font-semibold w-full mb-2">Expresiones Comunes:</span>
        <button
          type="button"
          onClick={insertLimit}
          className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
          style={{ borderColor: 'var(--border-glow)' }}
          title="Insertar límite: lim_{x→a} f(x)/g(x)"
        >
          Lim
        </button>
        <button
          type="button"
          onClick={insertDerivative}
          className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
          style={{ borderColor: 'var(--border-glow)' }}
          title="Insertar derivada: d/dx f(x)"
        >
          d/dx
        </button>
        <button
          type="button"
          onClick={insertFraction}
          className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
          style={{ borderColor: 'var(--border-glow)' }}
          title="Insertar fracción: a/b"
        >
          a/b
        </button>
        <button
          type="button"
          onClick={insertSquareRoot}
          className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
          style={{ borderColor: 'var(--border-glow)' }}
          title="Insertar raíz cuadrada: √x"
        >
          √
        </button>
        <button
          type="button"
          onClick={insertPower}
          className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
          style={{ borderColor: 'var(--border-glow)' }}
          title="Insertar potencia: x^n"
        >
          x^n
        </button>
        <button
          type="button"
          onClick={insertLogarithm}
          className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
          style={{ borderColor: 'var(--border-glow)' }}
          title="Insertar logaritmo: log(x)"
        >
          log
        </button>
        <button
          type="button"
          onClick={insertExponential}
          className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
          style={{ borderColor: 'var(--border-glow)' }}
          title="Insertar exponencial: e^x"
        >
          e^x
        </button>
        <button
          type="button"
          onClick={insertProduct}
          className="px-3 py-1.5 text-xs font-medium rounded border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
          style={{ borderColor: 'var(--border-glow)' }}
          title="Insertar producto: ∏ a_i"
        >
          ∏
        </button>
      </div>
    </div>
  ), [equationCounter, definitionCounter, theoremCounter, postId, insertInlineFormula, insertBlockFormula, insertNumberedFormula, insertNamedEquation, insertNumberedDefinition, insertNumberedTheorem, insertIntegral, insertSummation, insertMatrix, insertComplexFraction, insertAlignedEquations, insertCaseFunction, insertAnchoredEquation, insertAnchoredEquationWithDescription, insertAnchoredDefinition, insertAnchoredDefinitionWithDescription, insertAnchoredTheorem, insertAnchoredTheoremWithDescription, insertAnchoredProof, insertAnchoredProofWithDescription, insertSection, insertSubsection, insertImageAnchor, insertImageAnchorWithDescription, insertLimit, insertDerivative, insertFraction, insertSquareRoot, insertPower, insertLogarithm, insertExponential, insertProduct, setShowReferenceModal, setShowImageUploader]);

  return (
    <div className="w-full relative">
      {/* Botones de acción rápida */}
      <div ref={toolbarRef} className="mb-4 space-y-3">
        {renderToolbar()}
      </div>

      {/* Modal unificado de referencias */}
      {showReferenceModal && (
        <ReferenceSelectorModal
          postId={postId}
          currentPostSlug={currentPostSlug}
          onSelectEquation={handleInsertReference}
          onSelectImage={handleInsertImageReference}
          onSelectDefinition={handleInsertDefinitionReference}
          onSelectTheorem={handleInsertTheoremReference}
          onClose={() => setShowReferenceModal(false)}
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

      {/* Botones flotantes */}
      {showFloatingButton && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
          {/* Botón flotante para herramientas */}
          <button
            type="button"
            onClick={() => setShowFloatingToolbar(true)}
            className="px-4 py-3 rounded-lg border shadow-lg transition-all hover:scale-105 hover:shadow-xl text-text-secondary hover:text-star-cyan animate-in fade-in slide-in-from-right duration-300"
            style={{ 
              borderColor: 'var(--border-glow)',
              backgroundColor: 'rgba(26, 26, 46, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
            title="Abrir herramientas"
          >
            <span className="text-lg font-semibold">⚙️</span>
            <span className="ml-2 text-sm font-medium hidden sm:inline">Herramientas</span>
          </button>
          
          {/* Botón flotante para referencias */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowReferenceModal(true);
            }}
            className="px-4 py-3 rounded-lg border shadow-lg transition-all hover:scale-105 hover:shadow-xl text-text-secondary hover:text-star-cyan animate-in fade-in slide-in-from-right duration-300"
            style={{ 
              borderColor: 'var(--border-glow)',
              backgroundColor: 'rgba(26, 26, 46, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
            title="Insertar referencia a ecuación, imagen, definición o teorema"
          >
            <span className="text-lg font-semibold">🔗</span>
            <span className="ml-2 text-sm font-medium hidden sm:inline">Referencias</span>
          </button>

          {/* Botones de guardar */}
          {onSave && onSaveAndContinue && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSave();
                }}
                disabled={saving}
                className="px-4 py-3 rounded-lg bg-star-cyan text-space-dark font-medium transition-all hover:bg-star-cyan/90 focus:outline-none focus:ring-2 focus:ring-star-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg animate-in fade-in slide-in-from-right duration-300"
                title="Guardar cambios"
              >
                <span className="text-sm font-semibold">{saving ? '⏳' : '💾'}</span>
                <span className="ml-2 text-sm font-medium hidden sm:inline">
                  {saving ? 'Guardando...' : 'Guardar'}
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSaveAndContinue();
                }}
                disabled={saving}
                className="px-4 py-3 rounded-lg border bg-space-primary text-text-primary font-medium transition-colors hover:bg-space-secondary focus:outline-none focus:ring-2 focus:ring-star-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg animate-in fade-in slide-in-from-right duration-300"
                style={{
                  borderColor: 'var(--border-glow)',
                }}
                title="Guardar y continuar editando"
              >
                <span className="text-sm font-semibold">{saving ? '⏳' : '💾'}</span>
                <span className="ml-2 text-sm font-medium hidden sm:inline">
                  {saving ? 'Guardando...' : 'Guardar y continuar'}
                </span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Panel lateral (Drawer) */}
      {showFloatingToolbar && (
        <>
          {/* Overlay de fondo */}
          <div 
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
            onClick={() => {
              setIsPanelAnimating(false);
              setTimeout(() => setShowFloatingToolbar(false), 300);
            }}
          />
          
          {/* Panel lateral */}
          <div 
            className={`fixed right-0 top-0 h-full w-96 max-w-[90vw] bg-space-primary border-l z-[70] transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
              isPanelAnimating ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{ borderColor: 'var(--border-glow)' }}
          >
            {/* Header del panel */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-glow)' }}>
              <h2 className="text-lg font-semibold text-text-primary">Herramientas</h2>
              <button
                type="button"
                onClick={() => {
                  setIsPanelAnimating(false);
                  setTimeout(() => setShowFloatingToolbar(false), 300);
                }}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded hover:bg-space-secondary"
                title="Cerrar (Esc)"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            
            {/* Contenido del panel con scroll */}
            <div className="flex-1 overflow-y-auto p-4">
              {renderToolbar()}
            </div>
          </div>
        </>
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

      {/* Barra de herramientas de formato */}
      {(view === 'edit' || view === 'split') && (
        <div 
          className="sticky z-40 mb-3 p-2 rounded-lg border flex flex-wrap gap-1 items-center backdrop-blur-sm transition-all" 
          style={{ 
            borderColor: 'var(--border-glow)', 
            backgroundColor: 'rgba(26, 26, 46, 0.95)',
            top: `${toolbarTop}px`
          }}
        >
          {/* Formato de texto */}
          <div className="flex gap-1 items-center pr-2 border-r" style={{ borderColor: 'var(--border-glow)' }}>
            <button
              type="button"
              onClick={applyBold}
              className="px-3 py-1.5 text-sm font-bold rounded transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
              title="Negrita (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={applyItalic}
              className="px-3 py-1.5 text-sm italic rounded transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
              title="Cursiva (Ctrl+I)"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={applyUnderline}
              className="px-3 py-1.5 text-sm underline rounded transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
              title="Subrayado"
            >
              <u>U</u>
            </button>
            <button
              type="button"
              onClick={applyStrikethrough}
              className="px-3 py-1.5 text-sm line-through rounded transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
              title="Tachado"
            >
              <span style={{ textDecoration: 'line-through' }}>S</span>
            </button>
            <button
              type="button"
              onClick={applyYellowHighlight}
              className="px-3 py-1.5 text-sm rounded transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
              title="Resaltar en amarillo"
              style={{ backgroundColor: 'rgba(251, 191, 36, 0.3)' }}
            >
              <span style={{ backgroundColor: '#fbbf24', padding: '2px 4px', borderRadius: '2px' }}>🟡</span>
            </button>
            <button
              type="button"
              onClick={applyPinkHighlight}
              className="px-3 py-1.5 text-sm rounded transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
              title="Resaltar en rosa pastel"
              style={{ backgroundColor: 'rgba(244, 114, 182, 0.3)' }}
            >
              <span style={{ backgroundColor: '#f472b6', padding: '2px 4px', borderRadius: '2px' }}>🌸</span>
            </button>
          </div>

          {/* Listas */}
          <div className="flex gap-1 items-center pr-2 border-r" style={{ borderColor: 'var(--border-glow)' }}>
            <button
              type="button"
              onClick={() => applyList(false)}
              className="px-3 py-1.5 text-sm rounded transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
              title="Lista no ordenada"
            >
              • Lista
            </button>
            <button
              type="button"
              onClick={() => applyList(true)}
              className="px-3 py-1.5 text-sm rounded transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
              title="Lista ordenada"
            >
              1. Lista
            </button>
          </div>

          {/* Enlace */}
          <div className="flex gap-1 items-center pr-2 border-r" style={{ borderColor: 'var(--border-glow)' }}>
            <button
              type="button"
              onClick={applyLink}
              className="px-3 py-1.5 text-sm rounded transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
              title="Enlace"
            >
              🔗 Enlace
            </button>
          </div>

          {/* Anclas */}
          <div className="flex gap-1 items-center">
            <select
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'eq-anchor') insertAnchoredEquation();
                else if (value === 'eq-anchor-desc') insertAnchoredEquationWithDescription();
                else if (value === 'def-anchor') insertAnchoredDefinition();
                else if (value === 'def-anchor-desc') insertAnchoredDefinitionWithDescription();
                else if (value === 'thm-anchor') insertAnchoredTheorem();
                else if (value === 'thm-anchor-desc') insertAnchoredTheoremWithDescription();
                else if (value === 'prf-anchor') insertAnchoredProof();
                else if (value === 'prf-anchor-desc') insertAnchoredProofWithDescription();
                e.target.value = '';
              }}
              className="px-3 py-1.5 text-xs font-medium rounded border transition-colors text-text-secondary focus:outline-none focus:border-star-cyan"
              style={{ 
                borderColor: 'var(--border-glow)',
                backgroundColor: 'rgb(26, 26, 46)',
                color: 'var(--text-secondary)'
              }}
              defaultValue=""
              title="Insertar elemento con ancla"
            >
              <option value="" disabled>⚓ Anclas...</option>
              <option value="eq-anchor">Ecuación con Ancla</option>
              <option value="eq-anchor-desc">Ecuación + Descripción</option>
              <option value="def-anchor">Definición con Ancla</option>
              <option value="def-anchor-desc">Definición + Descripción</option>
              <option value="thm-anchor">Teorema con Ancla</option>
              <option value="thm-anchor-desc">Teorema + Descripción</option>
              <option value="prf-anchor">Demostración con Ancla</option>
              <option value="prf-anchor-desc">Demostración + Descripción</option>
            </select>
          </div>

          {/* Estructura */}
          <div className="flex gap-1 items-center pr-2 border-r" style={{ borderColor: 'var(--border-glow)' }}>
            <select
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'expandable') insertExpandable();
                else if (value === 'section') insertSection();
                else if (value === 'subsection') insertSubsection();
                e.target.value = '';
              }}
              className="px-3 py-1.5 text-xs font-medium rounded border transition-colors text-text-secondary focus:outline-none focus:border-star-cyan"
              style={{ 
                borderColor: 'var(--border-glow)',
                backgroundColor: 'rgb(26, 26, 46)',
                color: 'var(--text-secondary)'
              }}
              defaultValue=""
              title="Insertar elemento de estructura"
            >
              <option value="" disabled>📋 Estructura...</option>
              <option value="expandable">📂 Desplegable</option>
              <option value="section">📑 Sección</option>
              <option value="subsection">📄 Subsección</option>
            </select>
          </div>

          {/* Gráficos */}
          <div className="flex gap-1 items-center">
            <select
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'plotly3d') insertPlotly3D();
                else if (value === 'plotly3d-vector') insertPlotly3DVector();
                else if (value === 'plotly3d-anchor') insertPlotly3DWithAnchor();
                e.target.value = '';
              }}
              className="px-3 py-1.5 text-xs font-medium rounded border transition-colors text-text-secondary focus:outline-none focus:border-star-cyan"
              style={{ 
                borderColor: 'var(--border-glow)',
                backgroundColor: 'rgb(26, 26, 46)',
                color: 'var(--text-secondary)'
              }}
              defaultValue=""
              title="Insertar gráfico Plotly 3D"
            >
              <option value="" disabled>📊 Gráficos...</option>
              <option value="plotly3d">Gráfico 3D básico</option>
              <option value="plotly3d-vector">Vector 3D</option>
              <option value="plotly3d-anchor">Gráfico 3D con ancla</option>
            </select>
          </div>
        </div>
      )}

      {/* Contenedor del editor */}
      <div className="flex gap-4" style={{ minHeight: '500px', height: '100%' }}>
        {/* Editor */}
        {(view === 'edit' || view === 'split') && (
          <div className={`${view === 'split' ? 'w-1/2' : 'w-full'} flex flex-col`}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full flex-1 min-h-[500px] p-4 rounded-lg border bg-space-primary text-text-primary placeholder-text-muted font-mono text-sm resize-none focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20 overflow-y-auto"
              style={{
                borderColor: 'var(--border-glow)',
              }}
            />
          </div>
        )}

        {/* Preview */}
        {(view === 'preview' || view === 'split') && (
          <div
            ref={previewContainerRef}
            className={`${
              view === 'split' ? 'w-1/2' : 'w-full'
            } p-4 rounded-lg border overflow-y-auto overflow-x-hidden flex flex-col`}
            style={{
              borderColor: 'var(--border-glow)',
              backgroundColor: 'rgba(26, 26, 46, 0.3)',
              minHeight: '500px',
              maxHeight: '100%',
              maxWidth: '100%',
              position: 'relative',
            }}
          >
            {value ? (
              <MarkdownRenderer 
                content={value} 
                currentSlug={currentPostSlug}
                enableLineMapping={view === 'split'}
              />
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


