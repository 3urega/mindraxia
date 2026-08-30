# Batches de issues (GitHub)

Aquí se guardan los archivos generados por la skill **xp-github-issues**:

```
docs/issues/batch-<nombre-doc>-<YYYY-MM-DD>.md
```

Cada batch contiene issues con **vertical slicing** (XP).

## Flujo completo

1. **Generar** batch desde planificación → skill `xp-github-issues`
2. **Subir** a GitHub → skill `github-issues-upload`

```bash
# 1. Generar (desde el chat): "Genera issues desde docs/planificacion.md"

# 2. Simular subida
node scripts/upload-github-issues.mjs docs/issues/batch-planificacion-2026-08-30.md --dry-run

# 3. Subir a https://github.com/3urega/mindraxia/issues
node scripts/upload-github-issues.mjs docs/issues/batch-planificacion-2026-08-30.md
```

Requisitos: `gh auth login` con permisos en [3urega/mindraxia](https://github.com/3urega/mindraxia).

Si GitHub muestra *"Issue creation is restricted"*, revisar Settings → Features → Issues del repo.
