#!/usr/bin/env bash
# Convierte un archivo .tex (TikZ) a PDF y luego a SVG.
# Uso: ./scripts/tikz-to-svg.sh archivo.tex [archivo.svg]
# Requiere: pdflatex, pdf2svg

set -e

if [ $# -lt 1 ]; then
  echo "Uso: $0 <archivo.tex> [archivo.svg]"
  echo "  Si no se indica archivo.svg, se usa el mismo nombre con extensión .svg"
  exit 1
fi

TEX="$1"
BASE="${TEX%.tex}"
SVG="${2:-${BASE}.svg}"

if [ ! -f "$TEX" ]; then
  echo "No se encuentra: $TEX"
  exit 1
fi

if ! command -v pdflatex &>/dev/null; then
  echo "Se necesita pdflatex (p. ej. TeX Live)."
  exit 1
fi

if ! command -v pdf2svg &>/dev/null; then
  echo "Se necesita pdf2svg (p. ej. apt install pdf2svg o brew install pdf2svg)."
  exit 1
fi

echo "Compilando $TEX..."
pdflatex -interaction=nonstopmode "$TEX" >/dev/null 2>&1 || true

PDF="${BASE}.pdf"
if [ ! -f "$PDF" ]; then
  echo "Error: no se generó $PDF. Revisa el .tex."
  exit 1
fi

echo "Convirtiendo a SVG..."
pdf2svg "$PDF" "$SVG"

echo "Listo: $SVG"
