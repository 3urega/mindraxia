---
name: xp-github-issues
description: >-
  Extrae tareas de un documento .md de planificación, las convierte en issues
  de GitHub con vertical slicing (Extreme Programming) y genera un batch .md
  listo para subir con gh. Usar cuando pidan generar issues, backlog desde
  planificación, vertical slicing, batch de GitHub, o convertir roadmap/tareas
  en issues.
---

# XP — Batch de issues desde documentación

Convierte tareas de un `.md` de planificación en **issues verticalmente rebanadas**, listas para crear en GitHub.

---

## Cuándo aplicar

- El usuario indica un documento fuente (`docs/planificacion.md`, roadmap, etc.)
- Pide "generar issues", "batch de GitHub", "vertical slicing", "backlog desde el doc"
- Hay listas con ⏳, PENDIENTE, `- [ ]`, roadmap numerado o secciones "Próximos pasos"

---

## Flujo (obligatorio)

1. **Leer** el documento fuente completo (o la sección indicada).
2. **Extraer** candidatos a tarea:
   - `- [ ]` / `- [x]`
   - `⏳`, `PENDIENTE`, `TODO`
   - Items numerados de "Próximos pasos", roadmap, fases
   - Features descritas como bloques horizontales ("API routes", "todo el admin")
3. **Rebanar verticalmente** (ver reglas abajo). **No** crear issues por capa técnica.
4. **Escribir** el batch en:
   ```
   docs/issues/batch-<nombre-doc>-<YYYY-MM-DD>.md
   ```
   Si el usuario da otra ruta, usar esa.
5. **Resumir** al usuario: cuántas issues, ruta del archivo, cómo subirlas.

**No crear issues en GitHub** salvo que el usuario lo pida explícitamente. Solo generar el `.md`.

---

## Vertical slicing (XP)

Cada issue debe ser una **rebanada fina de extremo a extremo**: entrega valor usable, no solo una capa.

| ❌ Horizontal (evitar) | ✅ Vertical (preferir) |
|----------------------|------------------------|
| "Implementar todas las API routes de posts" | "Usuario puede ver un post en `/blog/[slug]`" |
| "Crear schema Prisma completo" | "Guardar y listar posts publicados (CRUD mínimo)" |
| "Todo el panel admin" | "Admin puede crear un borrador de post y verlo en lista" |
| "Sistema de autenticación completo" | "Admin puede iniciar sesión y acceder a `/admin`" |

### Criterios INVEST por issue

- **I**ndependiente — entregable sin depender de otras issues (o dependencia explícita)
- **N**egociable — alcance acotado, no diseño rígido innecesario
- **V**aluable — beneficio claro para usuario/admin/lector
- **E**stimable — tamaño S/M (ideal ≤ 1–3 días)
- **S**mall — si es grande, dividir en más rebanadas
- **T**estable — criterios de aceptación verificables

### Cómo partir tareas grandes

1. Identificar el **resultado observable** (qué puede hacer alguien).
2. Recortar al **mínimo** que cruce UI + API + datos si aplica.
3. Dejar fuera mejoras, edge cases y refactors → issues futuras.
4. Ordenar por dependencias (P0 bloqueantes primero).

---

## Formato del documento de salida

Usar la plantilla en [template.md](template.md). Estructura obligatoria:

```markdown
# Batch de issues — <título> — <fecha>

> **Origen:** `ruta/al/documento.md`
> **Metodología:** Vertical slicing (XP)
> **Total issues:** N

## Índice
| ID | Título | Prioridad | Depende de |
|----|--------|-----------|------------|
| ISSUE-001 | ... | P0 | — |

---

## ISSUE-001: <título imperativo>

**Labels:** `enhancement`, `vertical-slice`
**Priority:** P0 | P1 | P2
**Estimate:** S | M | L
**Depends on:** — | ISSUE-000

### User story
Como \<rol\>, quiero \<acción\>, para \<beneficio\>.

### Vertical slice
Qué capas toca esta rebanada (marcar las que apliquen):
- [ ] UI / página / componente
- [ ] API / route handler
- [ ] Base de datos / Prisma / sync
- [ ] Auth / permisos
- [ ] Tests / verificación manual

### Acceptance criteria
- [ ] Criterio verificable 1
- [ ] Criterio verificable 2

### Out of scope
- Lo que NO incluye esta issue

### Notas técnicas
- Archivos/rutas sugeridas (si se conocen del repo)

### Body para GitHub
<!-- Copiar desde aquí hasta END-BODY en gh issue create -->
```body
## User story
...

## Vertical slice
...

## Acceptance criteria
- [ ] ...

## Out of scope
...
```
<!-- END-BODY -->

---

(repetir por cada issue)

---

Flujo completo con subida: ver skill **github-issues-upload** (`.cursor/skills/github-issues-upload/`).

```bash
node scripts/upload-github-issues.mjs docs/issues/batch-XXX.md --dry-run
node scripts/upload-github-issues.mjs docs/issues/batch-XXX.md
```
```

---

## Reglas de redacción

- **Títulos:** imperativos, orientados al valor ("Ver post publicado en /blog/[slug]")
- **Español** si el doc fuente está en español
- **Labels sugeridos:** `enhancement`, `vertical-slice`, `bug`, `docs`, `admin`, `blog` (según contexto)
- **Prioridad:** P0 = bloqueante MVP, P1 = importante, P2 = mejora
- **Dependencias:** solo entre issues del mismo batch cuando sea real
- Referenciar rutas del repo Mindraxia cuando aplique (`src/app/`, `prisma/`, etc.)

---

## Anti-patrones

- No generar una issue por cada bullet de infraestructura sin valor de usuario
- No mezclar 3 features en una issue
- No omitir criterios de aceptación
- No inventar tareas que no estén en el documento (salvo split vertical obvio)
- No subir a GitHub sin que lo pidan

---

## Ejemplo

Ver transformación completa en [examples.md](examples.md).

## Referencias

- Plantilla: [template.md](template.md)
- Contexto del repo: [AGENTS.md](../../AGENTS.md)
