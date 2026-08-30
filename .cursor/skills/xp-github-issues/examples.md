# Ejemplo — De planificación a vertical slices

## Entrada (extracto ficticio de un doc)

```markdown
### 🎯 Próximos Pasos (Prioridad)

1. **API Routes para Posts** - Crear endpoints para listar y obtener posts
2. **Página de Post Individual** - Implementar `/blog/[slug]` con renderizado de markdown
3. **Conectar Frontend con API** - Actualizar páginas para usar datos reales

#### Semana 4: Panel de Administración ⏳ 0%
- ⏳ Sistema de autenticación
- ⏳ Página de login
- ⏳ Dashboard admin
- ⏳ Editor de posts
```

## ❌ Mal — Issues horizontales

1. "Implementar API routes de posts"
2. "Implementar página /blog/[slug]"
3. "Conectar frontend con API"
4. "Sistema de autenticación completo"
5. "Dashboard admin completo"

Problema: capas separadas, nada entregable solo, dependencias implícitas.

## ✅ Bien — Issues verticales (salida esperada)

---

# Batch de issues — Blog MVP público — 2026-08-30

> **Origen:** `docs/planificacion.md`
> **Metodología:** Vertical slicing (Extreme Programming)
> **Total issues:** 4

## Índice

| ID | Título | Prioridad | Estimate | Depende de |
|----|--------|-----------|----------|------------|
| ISSUE-001 | Listar posts publicados en /blog | P0 | S | — |
| ISSUE-002 | Ver un post publicado en /blog/[slug] | P0 | M | ISSUE-001 |
| ISSUE-003 | Admin puede iniciar sesión y acceder a /admin | P0 | M | — |
| ISSUE-004 | Admin puede crear borrador y verlo en lista | P1 | M | ISSUE-003 |

---

## ISSUE-001: Listar posts publicados en /blog

**Labels:** `enhancement`, `vertical-slice`, `blog`
**Priority:** P0
**Estimate:** S
**Depends on:** —

### User story

Como lector, quiero ver la lista de posts publicados en `/blog`, para descubrir contenido.

### Vertical slice

- [x] UI: `src/app/blog/page.tsx` con listado
- [x] API: `GET /api/posts` (solo `published: true`)
- [x] DB: modelo `Post` existente en Prisma
- [ ] Auth: no requerida (público)
- [x] Tests: verificación manual — lista muestra título, excerpt, fecha

### Acceptance criteria

- [ ] `/blog` muestra posts con `published: true`
- [ ] Posts en borrador no aparecen
- [ ] Cada item enlaza a `/blog/[slug]`
- [ ] Página vacía muestra mensaje amigable si no hay posts

### Out of scope

- Paginación, filtros, búsqueda
- Post individual (ISSUE-002)

### Body para GitHub

```body
## User story
Como lector, quiero ver la lista de posts publicados en `/blog`, para descubrir contenido.

## Vertical slice
- UI: página `/blog` con PostCard
- API: GET /api/posts (published only)
- DB: Post en Prisma

## Acceptance criteria
- [ ] `/blog` lista solo posts publicados
- [ ] Enlaces a `/blog/[slug]`
- [ ] Estado vacío manejado

## Out of scope
- Paginación, post individual

## Origen
docs/planificacion.md — ISSUE-001
```

---

## ISSUE-002: Ver un post publicado en /blog/[slug]

**Labels:** `enhancement`, `vertical-slice`, `blog`
**Priority:** P0
**Estimate:** M
**Depends on:** ISSUE-001

### User story

Como lector, quiero abrir un post por su URL `/blog/[slug]`, para leer el contenido renderizado.

### Vertical slice

- [x] UI: `src/app/blog/[slug]/page.tsx` + MarkdownRenderer
- [x] API: `GET /api/posts/slug/[slug]`
- [x] DB: lectura de `Post.content`
- [ ] Auth: no requerida
- [x] Tests: markdown + LaTeX renderizan; 404 si slug inválido

### Acceptance criteria

- [ ] URL `/blog/[slug]` muestra título, contenido, metadatos
- [ ] Markdown y ecuaciones KaTeX se renderizan
- [ ] Slug inexistente → 404
- [ ] Borrador no accesible públicamente

### Out of scope

- Comentarios, sidebar relacionados, SEO avanzado

---

(ISSUE-003 e ISSUE-004 siguen el mismo patrón para auth + crear borrador)

---

Flujo completo con subida: ver skill **github-issues-upload** (`.cursor/skills/github-issues-upload/`).

```bash
node scripts/upload-github-issues.mjs docs/issues/batch-XXX.md --dry-run
node scripts/upload-github-issues.mjs docs/issues/batch-XXX.md
```
