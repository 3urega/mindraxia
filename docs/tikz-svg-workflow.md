# Flujo TikZ → SVG para el blog

Este documento explica cómo crear diagramas con **TikZ en LaTeX**, convertirlos a **SVG** y usarlos en los posts del blog (vectorial, escalable y sin depender de servicios externos).

---

## 1. Requisitos locales

- **LaTeX** con TikZ (p. ej. TeX Live o MiKTeX).
- **pdf2svg**: convierte PDF → SVG.
  - Linux: `sudo apt install pdf2svg`
  - macOS: `brew install pdf2svg`
  - Windows: [pdf2svg-win](https://github.com/jalios/pdf2svg-windows) o usar WSL.

---

## 2. Ejemplo: triángulo y ley de cosenos

Crea un archivo `triangulo.tex`:

```latex
\documentclass[tikz,border=2mm]{standalone}
\usepackage{amsmath}
\usetikzlibrary{calc}
\begin{document}
\begin{tikzpicture}[scale=1.5]

% Coordenadas
\coordinate (A) at (0,0);
\coordinate (B) at (4,0);
\coordinate (C) at (2,2);

% Lados
\draw[thick] (A) -- (B) node[midway, below] {$c$};
\draw[thick] (B) -- (C) node[midway, right] {$a$};
\draw[thick] (C) -- (A) node[midway, left] {$b$};

% Vértices
\fill (A) circle (1.5pt) node[below left] {$A$};
\fill (B) circle (1.5pt) node[below right] {$B$};
\fill (C) circle (1.5pt) node[above] {$C$};

% Ángulo en C
\draw[thick] (C) ++(-0.3,0) arc[start angle=180,end angle=270,radius=0.3];
\node at ($(C)+(-0.4,-0.3)$) {$C$};

% Ley de cosenos (opcional)
\node at (2,-0.6) {$c^2 = a^2 + b^2 - 2ab\cos C$};

\end{tikzpicture}
\end{document}
```

**Nota:** `\usetikzlibrary{calc}` es necesario para la sintaxis `$(C)+(-0.4,-0.3)$` del nodo del ángulo.

---

## 3. Compilar y convertir a SVG

En la carpeta del proyecto (o donde tengas el `.tex`):

```bash
pdflatex triangulo.tex
pdf2svg triangulo.pdf triangulo.svg
```

O usando el script incluido (Linux/macOS/Git Bash):

```bash
./scripts/tikz-to-svg.sh triangulo.tex
```

Obtendrás `triangulo.svg` listo para el blog.

---

## 4. Integración en el blog

El blog **ya acepta SVG** (subida y visualización).

### Opción A: Subir el SVG desde el editor

1. En el post, usa **Insertar imagen** (o el botón de imagen del editor).
2. Sube el archivo `triangulo.svg`.
3. Completa **Texto alternativo** (p. ej. "Triángulo para la ley de cosenos").
4. Opcional: **Ancla** (p. ej. `ley-cosenos-triangulo`) y **Descripción**.
5. Al insertar, se generará algo como:

```markdown
![Triángulo ley de cosenos](/uploads/posts/<postId>/<timestamp>-triangulo.svg){#img:ley-cosenos-triangulo|descripción: Triángulo ABC con lados a, b, c y ángulo C.}
```

Así podrás referenciar la figura en el texto.

### Opción B: SVG ya en el proyecto

Si guardas SVGs en `public/` (p. ej. `public/diagramas/triangulo.svg`), en el markdown del post:

```markdown
![Triángulo ley de cosenos](/diagramas/triangulo.svg){#img:ley-cosenos-triangulo}
```

---

## 5. Resumen del flujo

| Paso | Acción |
|------|--------|
| 1 | Escribir el diagrama en TikZ (`.tex`). |
| 2 | `pdflatex archivo.tex` → `archivo.pdf`. |
| 3 | `pdf2svg archivo.pdf archivo.svg` → `archivo.svg`. |
| 4 | Subir el SVG en el post (Insertar imagen) o referenciar desde `public/`. |
| 5 | Usar ancla y descripción para referencias y accesibilidad. |

Ventajas: resultado vectorial, buena calidad, sin depender de servicios externos y fórmulas LaTeX renderizadas en el propio TikZ (por ejemplo la ley de cosenos debajo del triángulo).
