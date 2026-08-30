# Scripts del proyecto

## TikZ → SVG (`tikz-to-svg.sh`)

Convierte un diagrama LaTeX (TikZ) a SVG para usar en el blog.

**Requisitos:** `pdflatex`, `pdf2svg`

**Uso (Linux/macOS/Git Bash):**
```bash
chmod +x scripts/tikz-to-svg.sh
./scripts/tikz-to-svg.sh mi-diagrama.tex
# Genera mi-diagrama.svg
```

**Windows (sin WSL):**
1. Instala [TeX Live](https://www.tug.org/texlive/) o MiKTeX.
2. Instala [pdf2svg para Windows](https://github.com/jalios/pdf2svg-windows) o usa una conversión online PDF→SVG.
3. En PowerShell, desde la carpeta del `.tex`:
   ```powershell
   pdflatex triangulo.tex
   pdf2svg triangulo.pdf triangulo.svg
   ```
   (Si `pdf2svg` está en el PATH.)

Flujo completo y ejemplo de TikZ: ver [docs/tikz-svg-workflow.md](../docs/tikz-svg-workflow.md).

## Subir batch de issues a GitHub (`upload-github-issues.mjs`)

Parsea un batch generado por la skill `xp-github-issues` y crea issues en [3urega/mindraxia](https://github.com/3urega/mindraxia/issues).

**Requisitos:** [GitHub CLI](https://cli.github.com/) (`gh auth login`)

```bash
# Simular (no crea issues)
node scripts/upload-github-issues.mjs docs/issues/batch-XXX.md --dry-run

# Subir
node scripts/upload-github-issues.mjs docs/issues/batch-XXX.md
```

Genera un reporte `batch-XXX-upload-report.md` con URLs o errores.

Skill: `.cursor/skills/github-issues-upload/SKILL.md`
