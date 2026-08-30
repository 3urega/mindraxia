# Ejemplos Mindraxia — Matemáticas

Contenido listo para pegar en posts.

---

## Ley de Coulomb + campo eléctrico + fuerza sobre carga

```markdown
$${#eq:ley-coulomb|descripción: Ley de Coulomb}
\vec{F} = k_e \frac{q_1 \, q_2}{r^2} \, \hat{r}
\quad \text{con} \quad k_e = \frac{1}{4\pi\varepsilon_0}
$$

:::definition{#def:campo-electrostatico|descripción: Definición de campo electrostático}
$$
\vec{E}(\vec{r}) = \frac{1}{4\pi\varepsilon_0} \sum_{i=1}^{N} \frac{q_i \left(\vec{r} - \vec{r}_i\right)}{|\vec{r} - \vec{r}_i|^3}
$$
:::

$${#eq:fuerza-sobre-carga|descripción: Fuerza sobre una carga q debida a un sistema de cargas}
\vec{F}_q = q \, \vec{E}(\vec{r}) = \frac{q}{4\pi\varepsilon_0} \sum_{i=1}^{N} \frac{q_i \left(\vec{r} - \vec{r}_i\right)}{|\vec{r} - \vec{r}_i|^3}
$$

La relación entre ambas es {{eq:fuerza-sobre-carga|$\vec{F}_q = q\vec{E}$}}.
```

---

## Serie geométrica con demostración

```markdown
$${#eq:serie-geometrica|descripción: Suma de una progresión geométrica de n términos}
a + ar + ar^2 + \dots + ar^{n-1} = a\frac{1-r^n}{1-r}, \quad r \neq 1
$$

:::expand{Demostración}
Multiplicamos la serie por $r$ y restamos:

$$
S = a + ar + \dots + ar^{n-1}
$$
$$
rS = ar + ar^2 + \dots + ar^n
$$
$$
S - rS = a - ar^n \Rightarrow S(1-r) = a(1-r^n) \Rightarrow S = a\frac{1-r^n}{1-r}
$$
:::
```

---

## Teorema + demostración anclada

```markdown
:::theorem{#thm:pitagoras|descripción: Teorema de Pitágoras}
En un triángulo rectángulo con catetos $a$, $b$ e hipotenusa $c$:

$$
a^2 + b^2 = c^2
$$
:::

:::proof{#prf:pitagoras|descripción: Demostración geométrica del teorema de Pitágoras}
Consideremos un cuadrado de lado $a+b$...

$$
c^2 = a^2 + b^2
$$
:::
```

Referencia desde otro post: `{{thm:geometria/pitagoras|el teorema de Pitágoras}}`

---

## Texto con fórmulas inline

```markdown
Si $a \neq b$, entonces la pendiente de la recta es $m = \frac{y_2 - y_1}{x_2 - x_1}$.

La derivada de $e^x$ es $\frac{d}{dx}(e^x) = e^x$.

El conjunto $\delta \in \{0, 1\}$ indica el estado del sistema.
```

---

## Matriz y casos

```markdown
La matriz de rotación en 2D es:

$$
R(\theta) = \begin{pmatrix}
\cos\theta & -\sin\theta \\
\sin\theta & \cos\theta
\end{pmatrix}
$$

Definición por casos:

$$
f(x) = \begin{cases}
0 & \text{si } x < 0 \\
x^2 & \text{si } x \geq 0
\end{cases}
$$
```

---

## Ecuación referenciada desde otro post (embed)

```markdown
Recordemos {{eq:formulas-basicas/serie-geometrica|la serie geométrica|embed}} para calcular la suma parcial.
```

---

## Bloque completo tipo “post de fórmulas”

Patrón repetido (como el post de sumas):

```markdown
$${#eq:nombre-formula|descripción: Enunciado breve en español}
\text{LaTeX de la fórmula}
$$

:::expand{Demostración}
Contenido con pasos numerados y sub-bloques `$$...$$` donde haga falta.
:::
```

Separar bloques con `---` si el post es largo.
