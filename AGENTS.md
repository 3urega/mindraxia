# AGENTS.md — Mindraxia

Guía para agentes de IA que trabajan en este repositorio. **Léela antes de implementar cualquier cosa.**

---

## 1. Qué es este proyecto

**Mindraxia** es un blog científico (matemáticas, física, etc.) con:

- Posts en **Markdown** enriquecido (LaTeX/KaTeX, anclas, referencias cruzadas, gráficos Plotly, GeoGebra, imágenes SVG).
- Panel **admin** para crear/editar posts.
- **Referencias cruzadas** entre posts (ecuaciones, definiciones, teoremas, demostraciones, imágenes).
- Rutas de aprendizaje, colecciones, categorías y tema visual “galaxia cósmica”.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Prisma 5.19.1 · PostgreSQL · pnpm

**Idioma de la UI y docs:** español.

---

## 2. Índice de documentación de arquitectura

Consulta estos documentos **antes** de diseñar o duplicar lógica:

| Documento | Cuándo leerlo | Qué contiene |
|-----------|---------------|--------------|
| [`README.md`](README.md) | Instalación, scripts, estructura básica | Stack, `pnpm dev/build/lint`, layout inicial |
| [`docs/planificacion.md`](docs/planificacion.md) | Visión del producto, componentes, roadmap | Concepto, paleta de colores, rutas, componentes reutilizables, estado del proyecto |
| [`docs/database-setup.md`](docs/database-setup.md) | Prisma, migraciones, problemas de BD | Prisma **5.19.1** (no subir a 7), `db push`, troubleshooting |
| [`docs/tailwind.md`](docs/tailwind.md) | Estilos, tema, clases CSS | Variables CSS, tema galáctico, convenciones Tailwind v4 |
| [`docs/tikz-svg-workflow.md`](docs/tikz-svg-workflow.md) | Diagramas TikZ → SVG en posts | Flujo LaTeX → PDF → SVG, subida de imágenes |
| [`.cursor/skills/mindraxia-math/SKILL.md`](.cursor/skills/mindraxia-math/SKILL.md) | **Escribir fórmulas, demostraciones, definiciones** | Formato Markdown+LaTeX de la plataforma, plantillas listas para pegar |
| [`.cursor/skills/xp-github-issues/SKILL.md`](.cursor/skills/xp-github-issues/SKILL.md) | **Generar batch de issues GitHub desde un .md** | Vertical slicing XP, salida en `docs/issues/batch-*.md` |
| [`.cursor/skills/github-issues-upload/SKILL.md`](.cursor/skills/github-issues-upload/SKILL.md) | **Subir batch a GitHub (3urega/mindraxia)** | Script `scripts/upload-github-issues.mjs` |
| [`scripts/README.md`](scripts/README.md) | Scripts auxiliares | `tikz-to-svg.sh`, requisitos |
| [`next_steps.md`](next_steps.md) | Ideas de gráficos e integraciones | Plotly, Mermaid, Matplotlib (referencia, no implementado) |
| [`prisma/schema.prisma`](prisma/schema.prisma) | Modelos de datos | User, Post, Equation, Image, Definition, Theorem, Proof, Route, Collection… |

---

## 3. Mapa del código (dónde está cada cosa)

```
src/
├── app/                    # App Router (páginas + API)
│   ├── blog/[slug]/        # Post público
│   ├── admin/              # Panel admin (posts, login)
│   └── api/                # REST endpoints
│       ├── posts/          # CRUD posts + sync de anclas
│       ├── equations/      # Listado global de ecuaciones
│       ├── public/         # Endpoints públicos por slug+anchorId
│       └── auth/           # Login/logout/me
├── components/
│   ├── MarkdownRenderer.tsx    # Renderizado de posts (NÚCLEO)
│   ├── MarkdownEditor.tsx      # Editor admin con atajos
│   ├── *Anchor.tsx             # Anclas numeradas (eq, def, thm, prf, img, plotly)
│   ├── *Reference.tsx          # Enlaces/referencias cruzadas
│   └── ReferenceSelectorModal.tsx  # Selector de referencias en el editor
└── lib/
    ├── *-anchors.ts        # extract/preprocess por tipo de ancla
    ├── sync-*.ts           # Sincronización markdown → BD al guardar post
    ├── prisma.ts           # Cliente Prisma singleton
    ├── auth.ts / get-session.ts / session.ts
    └── image-utils.ts      # Validación y guardado de imágenes
```

**Regla:** si algo ya existe en `src/lib/` o en un `*Anchor.tsx` / `*Reference.tsx`, **extiéndelo**, no lo reescribas.

---

## 4. Sistemas centrales (no reinventar)

### 4.1 Pipeline Markdown

1. El contenido del post es **markdown en bruto** (campo `content` en `Post`).
2. Al **guardar** un post (`POST/PATCH /api/posts`), se ejecutan los syncs:
   - `syncPostEquations`, `syncPostImageAnchors`, `syncPostDefinitions`, `syncPostTheorems`, `syncPostProofs`
3. Al **renderizar**, `MarkdownRenderer` preprocesa anclas y delega en `react-markdown` + KaTeX + componentes custom.

**Archivos clave:** `MarkdownRenderer.tsx`, `MarkdownEditor.tsx`, `src/lib/*-anchors.ts`, `src/lib/sync-*.ts`

### 4.2 Patrón de anclas y referencias

Cada tipo sigue el **mismo patrón** en `src/lib/`:

| Tipo | Ancla en markdown | Referencia | Lib | Sync |
|------|-------------------|------------|-----|------|
| Ecuación | `$${#eq:id\|descripción: …}$$` | `{{eq:slug/id\|texto}}` | `markdown-anchors.ts` | `sync-equations.ts` |
| Definición | `:::definition{#def:id\|…}…:::` | `{{def:…}}` | `definition-anchors.ts` | `sync-definitions.ts` |
| Teorema | `:::theorem{#thm:id\|…}…:::` | `{{thm:…}}` | `theorem-anchors.ts` | `sync-theorems.ts` |
| Demostración | `:::proof{#prf:id\|…}…:::` | `{{prf:…}}` | `proof-anchors.ts` | `sync-proofs.ts` |
| Imagen | `![alt](url){#img:id\|…}` | `{{img:…}}` | `image-anchors.ts` | `sync-images.ts` |
| Sección | `[[section:Nombre]]` | — | `section-anchors.ts` | — |
| Expandible | `:::expand{Título}…:::` | — | `expandable-anchors.ts` | — |
| Plotly 2D/3D | ` ```plotly2d` / ` ```plotly3d` | — | `PlotlyDiagram.tsx` | — |
| GeoGebra | ` ```geogebra:id` | — | bloque en `MarkdownRenderer` | — |

**Normalización de IDs:** `normalizeAnchorId()` en `markdown-anchors.ts` (minúsculas, espacios → guiones). Usarla siempre al buscar o enlazar ecuaciones.

**Para añadir un nuevo tipo de ancla:** copiar el patrón de `definition-anchors.ts` + `DefinitionAnchor.tsx` + `DefinitionReference.tsx` + `sync-definitions.ts` + registro en `MarkdownRenderer` y en el sync del post.

### 4.3 API

- **Admin:** requiere sesión (`getCurrentUser()`).
- **Público por slug+anchor:** `/api/public/{equations|definitions|theorems|proofs|images}/[postSlug]/[anchorId]`.
- **Listados para referencias:** `/api/equations`, `/api/definitions`, etc.

Al crear endpoints nuevos, seguir el estilo de `src/app/api/public/equations/[postSlug]/[anchorId]/route.ts`.

### 4.4 Imágenes

- Subida: `POST /api/posts/[id]/images` → `saveImage()` en `image-utils.ts`.
- Destino: `public/uploads/posts/{postId}/`.
- SVG permitido (`image/svg+xml`).

### 4.5 Autenticación

- `src/lib/auth.ts`, `get-session.ts`, `session.ts`
- Login: `/admin/login`, API: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`

---

## 5. Reglas obligatorias: no repetir código

Antes de escribir código nuevo:

1. **Buscar** en `src/lib/`, `src/components/` y `src/app/api/` si ya existe la funcionalidad.
2. **Reutilizar** funciones de `*-anchors.ts`, syncs, componentes `*Reference` / `*Anchor`.
3. **Extender** el componente o lib existente con el diff mínimo.
4. **No duplicar** regex de anclas, lógica de normalización de IDs, ni parsers markdown.
5. **No crear** un segundo renderer markdown; todo pasa por `MarkdownRenderer`.
6. **No crear** otro cliente Prisma; usar `@/lib/prisma`.
7. **Seguir convenciones** del archivo que estés editando (nombres, imports `@/`, estilo Tailwind con variables CSS del tema).

### Checklist rápido por tarea

| Quiero… | Dónde mirar primero |
|---------|---------------------|
| Escribir fórmulas/demos para un post | Skill `.cursor/skills/mindraxia-math/` |
| Generar issues GitHub desde planificación | Skill `xp-github-issues` → `docs/issues/batch-*.md` |
| Subir batch de issues a GitHub | Skill `github-issues-upload` → `node scripts/upload-github-issues.mjs` |
| Añadir tipo de ancla/referencia | `definition-anchors.ts` + sync + Anchor/Reference + `MarkdownRenderer` |
| Atajo en el editor de posts | `MarkdownEditor.tsx` (selects “Expresiones”, “Gráficos”, etc.) |
| Ecuación referenciable entre posts | Guardar post (sync) + `{{eq:slug/id\|texto}}` + `/api/equations` |
| Gráfico interactivo | Bloque `plotly2d` / `plotly3d` → `PlotlyDiagram.tsx` |
| Embed GeoGebra | Bloque `geogebra:id` en `MarkdownRenderer.tsx` |
| Diagrama estático | TikZ → SVG → subir imagen (`docs/tikz-svg-workflow.md`) |
| Nuevo endpoint REST | Copiar patrón de `src/app/api/posts/` o `src/app/api/public/` |
| Cambiar estilos/tema | `globals.css`, `docs/tailwind.md`, variables `--border-glow`, `--star-cyan`, etc. |
| Modelo de datos | `prisma/schema.prisma` + sync correspondiente |

---

## 6. Convenciones de código

- **TypeScript** estricto; path alias `@/*` → `src/*`.
- **Componentes React:** funcionales; `'use client'` solo si hace falta (hooks, eventos).
- **API routes:** Next.js App Router (`route.ts`), params async (`await params`), respuestas JSON con `{ error, message }`.
- **Validación:** Zod donde ya se usa (p. ej. uploads).
- **Commits:** solo si el usuario lo pide explícitamente.
- **Docs:** no crear archivos `.md` nuevos salvo que el usuario lo pida.
- **Alcance:** cambios mínimos; no refactorizar ni añadir features no solicitadas.

---

## 7. Comandos útiles

```bash
pnpm dev          # desarrollo (localhost:3000)
pnpm build        # build producción
pnpm lint         # ESLint
pnpm db:generate  # prisma generate
pnpm db:push      # sincronizar schema → BD
pnpm db:studio    # Prisma Studio
```

---

## 8. Flujo típico al recibir una petición

1. Identificar si toca **markdown**, **API**, **UI admin**, **UI pública** o **BD**.
2. Consultar la tabla de docs (sección 2) y el mapa de código (sección 3).
3. Buscar implementación existente (sección 5).
4. Implementar el **diff más pequeño** que resuelva la petición.
5. Verificar lints en los archivos tocados.

---

*Última actualización: refleja el estado del repo con anclas, Plotly, GeoGebra, sync de contenido y referencias cruzadas.*
