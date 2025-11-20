# Mindraxia

Proyecto desarrollado con [Next.js](https://nextjs.org) y TypeScript.

## Stack Tecnológico

- **Framework**: Next.js 16.0.3 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Estilos**: Tailwind CSS v4
- **Gestor de paquetes**: pnpm
- **Linter**: ESLint con configuración Next.js

## Requisitos Previos

- Node.js (versión compatible con Next.js 16)
- pnpm instalado globalmente

## Instalación

Instalar dependencias:

```bash
pnpm install
```

## Desarrollo

Ejecutar el servidor de desarrollo:

```bash
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

La página se actualiza automáticamente al editar los archivos.

## Scripts Disponibles

- `pnpm dev` - Inicia el servidor de desarrollo
- `pnpm build` - Construye la aplicación para producción
- `pnpm start` - Inicia el servidor de producción
- `pnpm lint` - Ejecuta ESLint

## Estructura del Proyecto

```
app/
├── src/app/          # App Router de Next.js
│   ├── page.tsx      # Página principal
│   ├── layout.tsx    # Layout raíz
│   └── globals.css   # Estilos globales
├── docs/             # Documentación
└── public/           # Archivos estáticos
```

## Características

- Modo oscuro integrado
- Fuentes Geist optimizadas con `next/font`
- Configuración TypeScript con path aliases (`@/*`)
- Tailwind CSS v4 con PostCSS
