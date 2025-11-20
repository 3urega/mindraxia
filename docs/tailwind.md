# Guía de Tailwind CSS v4 - Sistema de Diseño Unificado

## Introducción

Este documento explica cómo funciona Tailwind CSS v4 y cómo implementar un sistema de diseño unificado usando la sintaxis correcta de `@theme` para crear design tokens reutilizables.

---

## 🚨 ADVERTENCIA: Next.js 16 + Turbopack + Tailwind v4

Si estás usando **Next.js 16 con Turbopack** y Tailwind v4, hay consideraciones especiales:

1. **Tailwind v4 NO usa `tailwind.config.js`** - Es configless
2. **Solo necesitas `postcss.config.mjs`** con `@tailwindcss/postcss`
3. **La sintaxis `@theme inline` NO funciona** - Usa `@layer theme { @theme { } }`
4. **Si tienes errores, limpia TODO** (`node_modules`, `.next`, `pnpm-lock.yaml`)

**Si tienes el error "Missing field 'negated'", ve directamente a la sección de [Errores Comunes](#-error-crítico-missing-field-negated-on-scanneroptionssources)**

---

## Versión y Compatibilidad

- **Tailwind CSS**: v4.1.17 (actualizado desde v4.0.0)
- **@tailwindcss/postcss**: v4.1.17
- **Next.js**: 16.0.3 (con Turbopack)
- **PostCSS**: Configurado con `@tailwindcss/postcss`

⚠️ **IMPORTANTE**: Tailwind v4 es completamente diferente a v3. No mezcles configuraciones.

---

## Sintaxis Correcta de `@theme` en Tailwind CSS v4

### ❌ Sintaxis INCORRECTA (causa errores)

```css
@theme inline {
  --color-space-dark: #0a0a0f;
}
```

**Error generado**: `Missing field 'negated' on ScannerOptions.sources`

Esta sintaxis NO es compatible con Tailwind CSS v4.0.0.

### ✅ Sintaxis CORRECTA

```css
@import "tailwindcss";

@layer theme {
  @theme {
    --color-space-dark: #0a0a0f;
    --color-star-cyan: #64ffda;
    --color-nebula-purple: #7c3aed;
  }
}
```

**Estructura requerida**:
1. `@import "tailwindcss"` al inicio
2. `@layer theme { }` para envolver las definiciones de tema
3. `@theme { }` dentro del layer para definir los colores personalizados

---

## Sistema de Design Tokens

### Definición de Colores Personalizados

Los colores personalizados se definen con el prefijo `--color-*` dentro de `@theme`:

```css
@layer theme {
  @theme {
    /* Fondos */
    --color-space-dark: #0a0a0f;
    --color-space-primary: #1a1a2e;
    --color-space-secondary: #16213e;
    
    /* Acentos */
    --color-star-cyan: #64ffda;
    --color-nebula-purple: #7c3aed;
    --color-star-gold: #fbbf24;
    
    /* Texto */
    --color-text-primary: #f8fafc;
    --color-text-secondary: #cbd5e1;
    --color-text-muted: #94a3b8;
  }
}
```

### Uso en Clases de Tailwind

Una vez definidos en `@theme`, los colores están disponibles como clases de Tailwind:

```tsx
// Fondo
<div className="bg-space-dark">...</div>
<div className="bg-space-primary">...</div>

// Texto
<p className="text-star-cyan">...</p>
<p className="text-text-primary">...</p>

// Bordes
<div className="border-star-cyan">...</div>

// Con opacidad
<div className="bg-space-primary/80">...</div>
```

### Convención de Nombres

- **Prefijo obligatorio**: `--color-*` para que Tailwind los reconozca
- **Nombres semánticos**: Usar nombres descriptivos (`space-dark`, `star-cyan`)
- **Separación con guiones**: Usar guiones para separar palabras (`text-primary`)

---

## Variables CSS Adicionales

Para valores que NO son colores (efectos, bordes personalizados, etc.), usar `:root`:

```css
:root {
  /* Bordes y efectos */
  --border-glow: rgba(100, 255, 218, 0.2);
  --glow-cyan: 0 0 20px rgba(100, 255, 218, 0.3);
  --glow-purple: 0 0 20px rgba(124, 58, 237, 0.3);
}
```

Estas variables se usan con `style` inline o clases CSS personalizadas:

```tsx
<div style={{ borderColor: 'var(--border-glow)' }}>...</div>
```

---

## Estructura Completa de `globals.css` (VERIFICADA)

**⚠️ IMPORTANTE**: Esta es la estructura EXACTA que funciona sin errores:

```css
/* 1. SIEMPRE empezar con @import "tailwindcss" */
@import "tailwindcss";

/* 2. Definir colores personalizados con @layer theme { @theme { } } */
@layer theme {
  @theme {
    /* Fondos (Espacio Profundo) */
    --color-space-dark: #0a0a0f;
    --color-space-primary: #1a1a2e;
    --color-space-secondary: #16213e;
    
    /* Acentos (Estrellas y Nebulosas) */
    --color-star-cyan: #64ffda;
    --color-nebula-purple: #7c3aed;
    --color-star-gold: #fbbf24;
    
    /* Texto */
    --color-text-primary: #f8fafc;
    --color-text-secondary: #cbd5e1;
    --color-text-muted: #94a3b8;
  }
}

/* 3. Variables CSS adicionales (NO colores) en :root */
:root {
  --border-glow: rgba(100, 255, 218, 0.2);
  --glow-cyan: 0 0 20px rgba(100, 255, 218, 0.3);
  --glow-purple: 0 0 20px rgba(124, 58, 237, 0.3);
}

/* 4. Estilos base del body */
body {
  background: #0a0a0f;  /* Valor directo o usar bg-space-dark en className */
  color: #f8fafc;        /* Valor directo o usar text-text-primary en className */
  font-family: var(--font-geist-sans), sans-serif;
  min-height: 100vh;
}

/* 5. Clases CSS personalizadas para efectos */
.glow-cyan {
  box-shadow: var(--glow-cyan);
  transition: box-shadow 0.3s ease;
}

.glow-cyan:hover {
  box-shadow: 0 0 30px rgba(100, 255, 218, 0.5);
}

.border-glow {
  border-color: var(--border-glow);
}
```

**Notas importantes**:
- ✅ `@import "tailwindcss"` DEBE ser la primera línea
- ✅ Colores DEBEN estar dentro de `@layer theme { @theme { } }`
- ✅ Colores DEBEN tener prefijo `--color-*`
- ✅ Variables no-color van en `:root` separadas
- ✅ Usar valores directos en `body` o clases de Tailwind en componentes

---

## Ventajas del Sistema de Diseño Unificado

### 1. Consistencia Visual

Todos los componentes usan las mismas clases de Tailwind, garantizando consistencia:

```tsx
// Header
<header className="bg-space-primary/80 text-text-primary border-b border-glow">
  <Link className="text-star-cyan hover:text-star-cyan/80">...</Link>
</header>

// Footer
<footer className="bg-space-primary/50 text-text-secondary border-t border-glow">
  <p className="text-star-cyan">...</p>
</footer>
```

### 2. Reutilización

Los colores definidos una vez están disponibles en toda la aplicación:

```tsx
// Cualquier componente puede usar
<div className="bg-space-dark text-star-cyan">...</div>
<button className="bg-star-cyan text-space-dark">...</button>
```

### 3. Mantenibilidad

Cambiar un color en `@theme` actualiza toda la aplicación automáticamente.

### 4. Type Safety (con TypeScript)

Las clases de Tailwind son reconocidas por el autocompletado del IDE.

---

## Ejemplos de Uso en Componentes

### Header Component

```tsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-sm bg-space-primary/80"
            style={{ borderColor: 'var(--border-glow)' }}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-star-cyan transition-opacity hover:opacity-80">
          Mindraxia
        </Link>
        <ul className="flex items-center gap-6">
          <li>
            <Link href="/blog" className="text-text-secondary transition-colors hover:text-star-cyan">
              Blog
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
```

### Footer Component

```tsx
export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t py-8 bg-space-primary/50"
            style={{ borderColor: 'var(--border-glow)' }}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-lg font-semibold text-star-cyan">Mindraxia</p>
          <p className="text-sm text-text-secondary">La Galaxia del Conocimiento</p>
          <p className="text-xs text-text-muted">© {currentYear} Mindraxia</p>
        </div>
      </div>
    </footer>
  );
}
```

---

## ⚠️ ERROR CRÍTICO: "Missing field 'negated' on ScannerOptions.sources"

Este es el error más común al usar Tailwind v4 con Next.js 16 y Turbopack. **Sigue estos pasos EXACTAMENTE**.

### 🔍 Diagnóstico del Error

**Mensaje completo**:
```
Error: Missing field `negated` on ScannerOptions.sources
[at Object.Once (@tailwindcss/postcss/dist/index.js)]
```

**Causas posibles**:
1. ✅ **MÁS COMÚN**: Mezcla de configuraciones Tailwind v3 y v4
2. Sintaxis incorrecta de `@theme`
3. Archivos de configuración antiguos presentes
4. Cache corrupto de node_modules o .next

---

### ✅ Solución Completa Paso a Paso

#### **Paso 1: Verificar Versiones Instaladas**

```bash
pnpm list tailwindcss @tailwindcss/postcss
```

Debe mostrar:
```
tailwindcss@4.1.17
@tailwindcss/postcss@4.1.17
```

Si muestra versiones 3.x, estás mezclando versiones.

#### **Paso 2: Eliminar Archivos Incompatibles**

**❌ NO DEBEN EXISTIR estos archivos** (elimínalos si existen):

```
tailwind.config.js
tailwind.config.ts
tailwind.config.mjs
postcss.config.js  (solo si tiene configuración antigua)
```

**✅ DEBE EXISTIR solo**:
```
postcss.config.mjs  (con solo @tailwindcss/postcss)
```

#### **Paso 3: Verificar postcss.config.mjs**

Debe contener SOLO esto:

```js
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

**❌ NO incluyas**:
- `tailwindcss` como plugin
- `autoprefixer`
- Plugins de Tailwind v3 (`@tailwindcss/forms`, `@tailwindcss/typography`)

#### **Paso 4: Verificar globals.css**

Debe empezar con:

```css
@import "tailwindcss";

@layer theme {
  @theme {
    --color-mi-color: #000;
  }
}
```

**❌ NO uses**:
- `@theme inline` (sintaxis incorrecta)
- `@theme` sin `@layer theme` (puede causar problemas)
- Variables sin prefijo `--color-*`

#### **Paso 5: Limpiar TODO y Reinstalar**

**Windows PowerShell**:
```powershell
# Eliminar node_modules, .next y lock file
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "pnpm-lock.yaml" -Force -ErrorAction SilentlyContinue

# Reinstalar
pnpm install
```

**Linux/Mac**:
```bash
rm -rf node_modules .next pnpm-lock.yaml
pnpm install
```

#### **Paso 6: Verificar package.json**

Debe tener:

```json
{
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4"
  }
}
```

**❌ NO debe tener**:
- `tailwindcss@^3`
- `autoprefixer`
- `postcss` (ya viene con Next.js)

---

### 🔧 Solución Rápida (Checklist)

Si el error persiste, verifica cada punto:

- [ ] ✅ `tailwindcss` versión 4.x en package.json
- [ ] ✅ `@tailwindcss/postcss` versión 4.x en package.json
- [ ] ✅ NO existe `tailwind.config.js` (o cualquier variante)
- [ ] ✅ `postcss.config.mjs` solo tiene `@tailwindcss/postcss`
- [ ] ✅ `globals.css` empieza con `@import "tailwindcss"`
- [ ] ✅ Colores definidos con `@layer theme { @theme { } }`
- [ ] ✅ Colores tienen prefijo `--color-*`
- [ ] ✅ Limpiado `node_modules` y `.next`
- [ ] ✅ Reinstalado con `pnpm install`

---

### 🚨 Errores Comunes y Soluciones

#### Error 1: "Missing field 'negated' on ScannerOptions.sources"

**Causa**: Mezcla de Tailwind v3 y v4, o sintaxis incorrecta

**Solución completa**:
1. Eliminar `tailwind.config.js` si existe
2. Verificar `postcss.config.mjs` solo tiene `@tailwindcss/postcss`
3. Usar sintaxis correcta: `@layer theme { @theme { } }`
4. Limpiar y reinstalar

#### Error 2: Los colores no se reconocen en las clases

**Causa**: Falta el prefijo `--color-*` o no están dentro de `@theme`

**Solución**: Asegurar que todos los colores tengan el prefijo `--color-*`:

```css
/* ❌ Incorrecto */
@theme {
  --mi-color: #000;
}

/* ✅ Correcto */
@layer theme {
  @theme {
    --color-mi-color: #000;
  }
}
```

#### Error 3: Variables CSS no funcionan en clases de Tailwind

**Causa**: Variables definidas fuera de `@theme` no se convierten en clases

**Solución**: 
- Colores → Definir en `@theme` con prefijo `--color-*`
- Otros valores → Usar con `style` inline o clases CSS personalizadas

#### Error 4: Turbopack sigue mostrando el error después de limpiar

**Causa**: Cache de Turbopack o Next.js corrupto

**Solución**:
```bash
# Limpiar cache de Next.js
rm -rf .next

# En Windows PowerShell
Remove-Item -Path ".next" -Recurse -Force

# Reiniciar servidor de desarrollo
pnpm dev
```

#### Error 5: "Cannot find module '@tailwindcss/postcss'"

**Causa**: No está instalado o versión incorrecta

**Solución**:
```bash
pnpm add -D @tailwindcss/postcss@^4 tailwindcss@^4
```

---

## Comparación: Tailwind v3 vs v4

### Tailwind v3 (tailwind.config.js)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'space-dark': '#0a0a0f',
        'star-cyan': '#64ffda',
      }
    }
  }
}
```

### Tailwind v4 (CSS con @theme)

```css
/* globals.css */
@layer theme {
  @theme {
    --color-space-dark: #0a0a0f;
    --color-star-cyan: #64ffda;
  }
}
```

**Ventajas de v4**:
- No requiere archivo de configuración JavaScript
- Configuración directamente en CSS
- Mejor integración con CSS nativo
- Más fácil de mantener

---

## Mejores Prácticas

### 1. Organización de Colores

Agrupar colores por categoría con comentarios:

```css
@layer theme {
  @theme {
    /* Fondos */
    --color-space-dark: #0a0a0f;
    --color-space-primary: #1a1a2e;
    
    /* Acentos */
    --color-star-cyan: #64ffda;
    --color-nebula-purple: #7c3aed;
    
    /* Texto */
    --color-text-primary: #f8fafc;
    --color-text-secondary: #cbd5e1;
  }
}
```

### 2. Nombres Semánticos

Usar nombres que describan el propósito, no el color:

```css
/* ✅ Bueno - Semántico */
--color-text-primary
--color-bg-primary
--color-accent-primary

/* ❌ Malo - Descriptivo del color */
--color-blue-500
--color-dark-gray
```

### 3. Consistencia en Nombres

Mantener un patrón consistente:

```css
--color-[categoría]-[variante]
--color-space-dark
--color-space-primary
--color-star-cyan
--color-text-primary
```

### 4. Documentación

Documentar la paleta de colores:

```css
@layer theme {
  @theme {
    /* 
     * Paleta Galáctica - Mindraxia
     * Fondos: Espacio profundo (#0a0a0f - #16213e)
     * Acentos: Estrellas y nebulosas (#64ffda, #7c3aed, #fbbf24)
     * Texto: Blanco suave a gris medio (#f8fafc - #94a3b8)
     */
  }
}
```

---

## Integración con Next.js

### Configuración de PostCSS

```js
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### Importación en Layout

```tsx
// src/app/layout.tsx
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-space-dark text-text-primary">
        {children}
      </body>
    </html>
  );
}
```

---

## Recursos y Referencias

- **Documentación oficial**: [tailwindcss.com](https://tailwindcss.com)
- **Tailwind CSS v4**: [v4.tailwindcss.com](https://v4.tailwindcss.com)
- **GitHub**: [github.com/tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss)

---

## Resumen de Sintaxis Clave

```css
/* 1. Importar Tailwind */
@import "tailwindcss";

/* 2. Definir colores personalizados */
@layer theme {
  @theme {
    --color-[nombre]: [valor];
  }
}

/* 3. Variables CSS adicionales */
:root {
  --variable-personalizada: [valor];
}

/* 4. Usar en componentes */
/* Clases de Tailwind: bg-[nombre], text-[nombre], etc. */
/* Variables CSS: var(--variable-personalizada) */
```

---

---

## 📋 Checklist de Instalación Correcta

Antes de empezar un proyecto nuevo o migrar uno existente:

### Pre-instalación

- [ ] Verificar que NO existe `tailwind.config.js` (o eliminarlo)
- [ ] Verificar que NO hay plugins de Tailwind v3 instalados
- [ ] Limpiar `node_modules` y `.next` si es proyecto existente

### Instalación

```bash
pnpm add -D tailwindcss@^4 @tailwindcss/postcss@^4
```

### Configuración

- [ ] Crear/verificar `postcss.config.mjs` con solo `@tailwindcss/postcss`
- [ ] Crear `globals.css` con `@import "tailwindcss"` al inicio
- [ ] Definir colores con `@layer theme { @theme { } }`

### Verificación

- [ ] Ejecutar `pnpm dev` sin errores
- [ ] Las clases de Tailwind funcionan (`bg-space-dark`, etc.)
- [ ] No hay errores en consola

---

## 🎯 Configuración Final Correcta

### Estructura de Archivos

```
proyecto/
├── postcss.config.mjs     ✅ Solo @tailwindcss/postcss
├── package.json           ✅ tailwindcss@^4, @tailwindcss/postcss@^4
├── src/
│   └── app/
│       ├── globals.css    ✅ @import "tailwindcss" + @layer theme
│       └── layout.tsx     ✅ import "./globals.css"
└── ❌ NO tailwind.config.js
```

### postcss.config.mjs (CORRECTO)

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### globals.css (CORRECTO)

```css
@import "tailwindcss";

@layer theme {
  @theme {
    --color-space-dark: #0a0a0f;
    --color-star-cyan: #64ffda;
  }
}

:root {
  --border-glow: rgba(100, 255, 218, 0.2);
}

body {
  background: #0a0a0f;
  color: #f8fafc;
}
```

---

**Última actualización**: Basado en Tailwind CSS v4.1.17 y Next.js 16.0.3
**Estado**: Verificado y funcionando ✅
**Errores documentados**: "Missing field 'negated'" resuelto completamente

