---
name: github-issues-upload
description: >-
  Lee un batch .md de issues (generado por xp-github-issues) y los sube a
  GitHub con gh CLI en 3urega/mindraxia. Usar cuando pidan subir issues,
  publicar batch en GitHub, crear issues desde docs/issues/batch-*.md,
  o ejecutar upload de backlog.
---

# Subir batch de issues a GitHub

Lee un archivo `docs/issues/batch-*.md` y crea las issues en **[3urega/mindraxia](https://github.com/3urega/mindraxia/issues)** con `gh`.

Complementa la skill **xp-github-issues** (genera el batch; esta skill lo sube).

---

## Cuándo aplicar

- Usuario pide **subir**, **publicar** o **crear en GitHub** las issues de un batch
- Hay un archivo `docs/issues/batch-*.md` listo
- Menciona `3urega/mindraxia`, subir backlog, o `gh issue create`

---

## Flujo (obligatorio)

1. **Confirmar** que existe el batch (ruta indicada o el más reciente en `docs/issues/`).
2. **Verificar** `gh` autenticado:
   ```bash
   gh auth status
   ```
   Si falla: `gh auth login` o `gh auth refresh -h github.com`
3. **Dry-run primero** (salvo que el usuario diga explícitamente saltarlo):
   ```bash
   node scripts/upload-github-issues.mjs docs/issues/batch-XXX.md --dry-run
   ```
4. **Subir**:
   ```bash
   node scripts/upload-github-issues.mjs docs/issues/batch-XXX.md --repo 3urega/mindraxia
   ```
5. **Reportar** al usuario: URLs creadas + ruta del reporte `batch-XXX-upload-report.md`.

---

## Formato de entrada esperado

El batch debe seguir el formato de **xp-github-issues**:

- Secciones `## ISSUE-001: Título`
- `**Labels:** \`enhancement\`, \`vertical-slice\``
- Bloque ` ```body ... ``` ` (preferido) o secciones `### User story`, etc.

Si no hay batch, **generar uno primero** con xp-github-issues; no inventar issues al subir.

---

## Script

| Comando | Acción |
|---------|--------|
| `node scripts/upload-github-issues.mjs <batch.md> --dry-run` | Simula sin crear |
| `node scripts/upload-github-issues.mjs <batch.md>` | Crea issues en `3urega/mindraxia` |
| `node scripts/upload-github-issues.mjs <batch.md> --repo owner/repo` | Otro repo |

El script:
- Parsea cada `ISSUE-NNN`
- Crea labels que no existan
- Escribe reporte `*-upload-report.md` con URLs o errores

---

## Requisitos

- [GitHub CLI](https://cli.github.com/) (`gh`) instalado
- Sesión autenticada con permiso **issues:write** en el repo
- Token válido (si `gh auth status` muestra token inválido → `gh auth refresh`)

### Restricción del repositorio

Si GitHub muestra **"Issue creation is restricted"** en [3urega/mindraxia/issues](https://github.com/3urega/mindraxia/issues):

1. Repo → **Settings** → **General** → **Features** → Issues
2. Revisar quién puede crear issues (colaboradores / permisos)
3. O usar un token de usuario con rol **write** o **maintain** en el repo

Informar al usuario si `gh issue create` devuelve 403/404 por permisos.

---

## Errores comunes

| Error | Acción |
|-------|--------|
| Token inválido | `gh auth refresh -h github.com` |
| 403 Forbidden | Permisos repo o issues restringidas |
| 0 issues parseadas | Revisar formato del batch (xp-github-issues) |
| Label no existe | El script intenta crearla; si falla, crear manualmente en GitHub |

---

## Qué NO hacer

- No subir sin dry-run salvo petición explícita
- No crear issues duplicadas sin avisar (revisar issues abiertas en GitHub antes)
- No modificar el batch fuente al subir (solo generar reporte)
- No usar la API REST manual si `gh` está disponible

---

## Integración con xp-github-issues

```
docs/planificacion.md
        ↓  xp-github-issues
docs/issues/batch-planificacion-2026-08-30.md
        ↓  github-issues-upload (este)
GitHub: https://github.com/3urega/mindraxia/issues
        ↓
docs/issues/batch-planificacion-2026-08-30-upload-report.md
```

---

## Referencias

- Generar batch: [.cursor/skills/xp-github-issues/SKILL.md](../xp-github-issues/SKILL.md)
- Script: [scripts/upload-github-issues.mjs](../../scripts/upload-github-issues.mjs)
- Carpeta batches: [docs/issues/README.md](../../docs/issues/README.md)
