import { MarkdownRenderer } from '@/components/markdown-renderer';

const sampleContent = `# Mecánica Cuántica: Fundamentos

La **mecánica cuántica** es una de las teorías más fascinantes de la física moderna.

## La Ecuación de Schrödinger

La ecuación fundamental que describe la evolución temporal de un sistema cuántico es:

$$i\\hbar\\frac{\\partial}{\\partial t}|\\psi\\rangle = \\hat{H}|\\psi\\rangle$$

Donde:
- $\\hbar$ es la constante de Planck reducida
- $|\\psi\\rangle$ es el vector de estado del sistema
- $\\hat{H}$ es el operador hamiltoniano

## Principio de Incertidumbre

El famoso **principio de incertidumbre de Heisenberg** establece que:

$$\\Delta x \\cdot \\Delta p \\geq \\frac{\\hbar}{2}$$

Esto significa que no podemos conocer simultáneamente con precisión absoluta la posición ($x$) y el momento ($p$) de una partícula.

### Ejemplo Práctico

Para un electrón en un átomo de hidrógeno, la función de onda del estado fundamental es:

$$\\psi_{100}(r,\\theta,\\phi) = \\frac{1}{\\sqrt{\\pi a_0^3}} e^{-r/a_0}$$

Donde $a_0$ es el radio de Bohr: $a_0 = \\frac{\\hbar^2}{m_e e^2} \\approx 0.529 \\text{ Å}$

## Código de Ejemplo

Aquí tienes un ejemplo de cómo calcular la probabilidad:

\`\`\`python
import numpy as np
import matplotlib.pyplot as plt

def wave_function(r, a0=0.529):
    """Función de onda del estado fundamental del hidrógeno"""
    return (1/np.sqrt(np.pi * a0**3)) * np.exp(-r/a0)

# Calcular probabilidad
r = np.linspace(0, 10, 1000)
psi = wave_function(r)
probability = np.abs(psi)**2

plt.plot(r, probability)
plt.xlabel('Radio (Å)')
plt.ylabel('Densidad de probabilidad')
plt.title('Distribución radial del electrón en el hidrógeno')
plt.show()
\`\`\`

## Lista de Conceptos Clave

1. **Superposición**: Los sistemas cuánticos pueden existir en múltiples estados simultáneamente
2. **Entrelazamiento**: Correlaciones cuánticas entre partículas separadas
3. **Colapso de la función de onda**: El proceso de medición
4. **Dualidad onda-partícula**: La naturaleza dual de la materia y la energía

> "Cualquiera que no se sienta incómodo con la teoría cuántica no la ha entendido" - Niels Bohr

¡La mecánica cuántica sigue siendo uno de los campos más activos de investigación en física!`;

export default function TestLatexPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Prueba de Markdown + LaTeX
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Esta página demuestra cómo se renderiza el contenido científico con fórmulas matemáticas.
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
        <MarkdownRenderer content={sampleContent} />
      </div>
    </div>
  );
}
