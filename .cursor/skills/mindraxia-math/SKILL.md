---
name: mindraxia-math
description: >-
  Escribe expresiones, fórmulas, demostraciones y contenido científico en el
  formato Markdown+LaTeX de Mindraxia (anclas, referencias, KaTeX). Usar cuando
  el usuario pida fórmulas, ecuaciones, demostraciones, definiciones, teoremas,
  expresiones en LaTeX, contenido para posts del blog Mindraxia, o "nuestro formato".
---

# Mindraxia — Escritura matemática

Genera contenido **listo para pegar** en un post de Mindraxia. No expliques LaTeX genérico: usa **este formato**.

Motor de renderizado: **remark-math + KaTeX** (LaTeX estándar, sin paquetes extra).

---

## Reglas rápidas

1. **Salida:** bloque markdown copiable, sin rodeos.
2. **Matemáticas inline:** `$...$` · **display sin ancla:** `$$...$$`
3. **Ecuación referenciable:** `$${#eq:id|descripción: …}$$` + LaTeX dentro
4. **IDs de ancla:** descriptivos en español o inglés; se normalizan a minúsculas con guiones (`n primeros naturales` → `n-primeros-naturales`)
5. **Siempre incluir `descripción:`** en anclas importantes (mejora búsqueda y referencias)
6. **Demostraciones largas:** `:::expand{Título}…:::` (colapsable) o `:::proof{#prf:id|…}…:::` (anclable)
7. **Referencias:** `{{eq:id|texto}}` (mismo post) · `{{eq:slug/id|texto}}` (otro post) · añadir `|embed` al final para incrustar
8. **Escapar backslashes** en JSON/plantillas; en markdown del post, un `\` por comando LaTeX
9. **No uses** `\(...\)` ni `\[...\]` en posts (usa `$` y `$$`)
10. **Español** en texto prose; LaTeX universal en fórmulas

---

## Plantillas

### Ecuación con ancla (la más usada)

```markdown
$${#eq:ley-coulomb|descripción: Ley de Coulomb, fuerza entre dos cargas puntuales}
\vec{F} = k_e \frac{q_1 \, q_2}{r^2} \, \hat{r}
$$
```

### Ecuación + demostración colapsable

```markdown
$${#eq:suma-n-naturales|descripción: Suma de los n primeros números naturales}
1 + 2 + \dots + n = \frac{n(n+1)}{2}
$$

:::expand{Demostración}
**Inducción matemática**:

1. Caso base ($n=1$): $1 = \frac{1 \cdot 2}{2} = 1$

2. Paso inductivo: supongamos cierto para $n=k$:
$$
\sum_{i=1}^{k} i = \frac{k(k+1)}{2}
$$

Para $n=k+1$:
$$
\sum_{i=1}^{k+1} i = \frac{k(k+1)}{2} + (k+1) = \frac{(k+1)(k+2)}{2}
$$
:::
```

### Definición

```markdown
:::definition{#def:campo-electrostatico|descripción: Campo eléctrico creado por cargas en reposo}
El **campo electrostático** en un punto $\vec{r}$ es la fuerza por unidad de carga que actuaría sobre una carga de prueba $q_0$:

$$
\vec{E}(\vec{r}) = \frac{\vec{F}}{q_0}
$$
:::
```

### Teorema

```markdown
:::theorem{#thm:gauss|descripción: Teorema de Gauss para el campo eléctrico}
Para una superficie cerrada $S$ que encierra carga total $Q_{\text{enc}}$:

$$
\oint_S \vec{E} \cdot d\vec{A} = \frac{Q_{\text{enc}}}{\varepsilon_0}
$$
:::
```

### Demostración con ancla

```markdown
:::proof{#prf:gauss-esfera|descripción: Demostración del teorema de Gauss para simetría esférica}
Por simetría esférica, $\vec{E}$ es radial y de magnitud constante sobre la superficie...

$$
\oint_S \vec{E} \cdot d\vec{A} = E \cdot 4\pi r^2 = \frac{Q}{\varepsilon_0}
$$
:::
```

### Referencias cruzadas

```markdown
Como vimos en {{eq:ley-coulomb|la ley de Coulomb}}, la fuerza es inversamente proporcional al cuadrado de la distancia.

Según {{eq:electrostatica/ley-coulomb|la ley de Coulomb}} del post de electrostática...

{{eq:suma-n-naturales|esta fórmula|embed}}
```

---

## LaTeX frecuente (KaTeX)

| Necesidad | LaTeX |
|-----------|-------|
| Fracción | `\frac{a}{b}` |
| Raíz | `\sqrt{x}`, `\sqrt[n]{x}` |
| Vector | `\vec{F}`, `\hat{r}` |
| Integral | `\int_a^b`, `\oint`, `\iint` |
| Sumatoria/producto | `\sum_{i=1}^{n}`, `\prod_{i=1}^{n}` |
| Límite | `\lim_{x \to 0}` |
| Derivada | `\frac{d}{dx}`, `\partial` |
| Matriz 3×3 | `\begin{pmatrix} a & b & c \\ d & e & f \\ g & h & i \end{pmatrix}` |
| Casos | `\begin{cases} 0 & \text{si } x<0 \\ 1 & \text{si } x \geq 0 \end{cases}` |
| Texto en fórmula | `\text{si}`, `\mathrm{d}x` |
| Aproximado | `\approx`, `\sim` |
| Constantes | `\varepsilon_0`, `\pi`, `\infty` |
| Desigualdad | `\neq`, `\leq`, `\geq` |
| Pertenece | `\in`, `\notin` |
| Sistema alineado | `\begin{align} a &= b \\ c &= d \end{align}` |

---

## Flujo al recibir una petición

1. Identificar tipo: ecuación suelta / definición / teorema / demostración / referencia / bloque completo
2. Elegir plantilla de arriba
3. Generar ID de ancla descriptivo + `descripción:` en español
4. Escribir LaTeX correcto (KaTeX)
5. Entregar **solo el markdown** listo para pegar, salvo que pidan explicación

---

## Qué evitar

- No envolver ecuaciones ancladas en otro `$$` extra (el formato ya lleva `$${#eq:…}`)
- No usar `\usepackage` ni entornos no soportados por KaTeX
- No poner `\\` al final de líneas sueltas fuera de `align`/`cases`/matrices
- No inventar sintaxis de referencia distinta a `{{eq:…}}`, `{{def:…}}`, `{{thm:…}}`, `{{prf:…}}`

---

## Más ejemplos

Ver [examples.md](examples.md) para bloques completos (física, álgebra, inducción).

## Referencia del proyecto

- Anclas ecuaciones: `src/lib/markdown-anchors.ts`
- Editor con ejemplos: `src/components/MarkdownEditor.tsx` (sección "Ejemplos de Anclas")
- Guía general del repo: `AGENTS.md`
