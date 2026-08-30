# Plantilla — Batch de issues (vertical slicing)

Copiar y rellenar. Eliminar comentarios HTML al entregar.

---

```markdown
# Batch de issues — [NOMBRE DEL PROYECTO/FEATURE] — [YYYY-MM-DD]

> **Origen:** `[ruta/documento-fuente.md]`
> **Metodología:** Vertical slicing (Extreme Programming)
> **Total issues:** [N]
> **Generado por:** xp-github-issues skill

## Índice

| ID | Título | Prioridad | Estimate | Depende de |
|----|--------|-----------|----------|------------|
| ISSUE-001 | [Título corto] | P0 | S | — |
| ISSUE-002 | [Título corto] | P1 | M | ISSUE-001 |

---

## ISSUE-001: [Título imperativo orientado al valor]

**Labels:** `enhancement`, `vertical-slice`
**Priority:** P0
**Estimate:** S
**Depends on:** —

### User story

Como [rol], quiero [acción concreta], para [beneficio medible].

### Vertical slice

- [ ] UI / página / componente: [qué pantalla o interacción]
- [ ] API / route handler: [qué endpoint]
- [ ] Base de datos / Prisma: [qué modelo o campo]
- [ ] Auth / permisos: [si aplica]
- [ ] Tests / verificación: [cómo validar]

### Acceptance criteria

- [ ] [Comportamiento observable 1]
- [ ] [Comportamiento observable 2]
- [ ] [Edge case mínimo o "happy path" documentado]

### Out of scope

- [Feature relacionada para otra issue]
- [Refactor / optimización no necesaria para entregar valor]

### Notas técnicas

- Archivos sugeridos: `[paths]`
- Reutilizar: `[libs/componentes existentes]`

### Body para GitHub

```body
## User story
Como [rol], quiero [acción], para [beneficio].

## Vertical slice
- UI: ...
- API: ...
- DB: ...

## Acceptance criteria
- [ ] ...
- [ ] ...

## Out of scope
- ...

## Origen
Extraído de `[documento.md]` — vertical slice ISSUE-001
```

---

## ISSUE-002: [Siguiente rebanada]

(repetir bloque)

---

Flujo completo con subida: ver skill **github-issues-upload** (`.cursor/skills/github-issues-upload/`).

```bash
node scripts/upload-github-issues.mjs docs/issues/batch-XXX.md --dry-run
node scripts/upload-github-issues.mjs docs/issues/batch-XXX.md
```

## Checklist antes de subir

- [ ] Cada issue entrega valor de extremo a extremo
- [ ] Ninguna issue es solo "capa técnica"
- [ ] Criterios de aceptación son verificables
- [ ] Dependencias declaradas en el índice
- [ ] Títulos únicos y descriptivos
```
