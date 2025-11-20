import { visit } from 'unist-util-visit';
import type { Root, Text, Paragraph } from 'mdast';

/**
 * Plugin de remark para convertir referencias {{eq:...|...}} en nodos HTML personalizados
 * que luego pueden ser procesados por los componentes de React
 */
export function remarkEquationReferences() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index: number, parent: Paragraph | any) => {
      if (!parent || typeof node.value !== 'string') return;

      const referenceRegex = /\{\{eq:([^}|]+)\|([^}]+)\}\}/g;
      const matches = Array.from(node.value.matchAll(referenceRegex));

      if (matches.length === 0) return;

      // Crear array de nodos para reemplazar el nodo de texto
      const nodes: any[] = [];
      let lastIndex = 0;

      matches.forEach((match) => {
        // Añadir texto antes de la referencia
        if (match.index !== undefined && match.index > lastIndex) {
          nodes.push({
            type: 'text',
            value: node.value.substring(lastIndex, match.index),
          });
        }

        // Crear nodo HTML personalizado para la referencia
        const path = match[1];
        const linkText = match[2];
        const pathParts = path.split('/');

        let postSlug: string | undefined;
        let anchorId: string;

        if (pathParts.length === 2) {
          postSlug = pathParts[0].trim();
          anchorId = pathParts[1].trim();
        } else {
          anchorId = path.trim();
        }

        // Crear nodo HTML con atributos data-* para pasar la información
        nodes.push({
          type: 'html',
          value: `<span data-equation-ref data-anchor-id="${anchorId}" data-post-slug="${postSlug || ''}" data-link-text="${linkText.trim()}"></span>`,
        });

        lastIndex = (match.index || 0) + match[0].length;
      });

      // Añadir texto restante
      if (lastIndex < node.value.length) {
        nodes.push({
          type: 'text',
          value: node.value.substring(lastIndex),
        });
      }

      // Reemplazar el nodo original con los nuevos nodos
      if (parent.children) {
        parent.children.splice(index, 1, ...nodes);
      }
    });
  };
}

