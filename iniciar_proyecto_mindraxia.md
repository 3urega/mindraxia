# 🚀 Guía Completa: Inicializar Proyecto Mindraxia

Esta guía te llevará paso a paso desde cero hasta tener un proyecto completo de **Mindraxia** funcionando, tal como lo hemos desarrollado.

## 📋 Prerrequisitos

- **Node.js 18+**
- **pnpm** (gestor de paquetes)
- **PostgreSQL 14+** (corriendo localmente)
- **Git**

## 🏗️ Paso 1: Crear el Monorepo Base

### 1.1 Inicializar el proyecto
```bash
mkdir mindraxia
cd mindraxia
pnpm init
```

### 1.2 Configurar pnpm workspaces
Crear `pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 1.3 Crear estructura de carpetas
```bash
mkdir -p apps/frontend
mkdir -p apps/backend
mkdir -p packages/ui
mkdir -p packages/ai
mkdir -p scripts
mkdir -p database
mkdir -p docker
```

### 1.4 Configurar package.json principal
```json
{
  "name": "mindraxia",
  "version": "1.0.0",
  "description": "Plataforma web de divulgación científica técnica",
  "main": "index.js",
  "scripts": {
    "dev": "echo '🚀 Arrancando Mindraxia en modo desarrollo...' && pnpm --parallel --filter frontend --filter backend dev",
    "dev:frontend": "echo '⚛️  Arrancando Frontend (Next.js)...' && pnpm --filter frontend dev",
    "dev:backend": "echo '🔧 Arrancando Backend (Strapi)...' && pnpm --filter backend develop",
    "build": "pnpm --filter frontend build",
    "build:all": "pnpm --parallel --filter frontend --filter backend build",
    "install:all": "pnpm install",
    "clean": "pnpm --parallel --filter frontend --filter backend clean",
    "setup": "echo '📦 Instalando dependencias...' && pnpm install && echo '✅ Setup completado. Ejecuta: pnpm dev'",
    "seed": "echo '🌱 Poblando Strapi con datos de ejemplo...' && cd scripts && npm install && node seed-data.js",
    "start": "echo '🌟 Iniciando Mindraxia en producción...' && pnpm --parallel --filter frontend --filter backend start"
  },
  "keywords": ["ciencia", "divulgación", "física", "matemáticas", "ingeniería"],
  "author": "Mindraxia Team",
  "license": "MIT",
  "packageManager": "pnpm@10.10.0",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

## 🎨 Paso 2: Configurar Frontend (Next.js)

### 2.1 Crear proyecto Next.js
```bash
cd apps/frontend
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

### 2.2 Instalar Shadcn UI
```bash
npx shadcn@latest init --yes
```

### 2.3 Instalar dependencias adicionales
```bash
pnpm install next-themes
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add badge
pnpm install lucide-react
```

### 2.4 Crear componente ThemeProvider
`src/components/theme-provider.tsx`:
```tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### 2.5 Crear toggle de tema
`src/components/theme-toggle.tsx`:
```tsx
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}
```

### 2.6 Crear Sidebar
`src/components/sidebar.tsx`:
```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Book, Home, Tag, User } from "lucide-react"

const navigation = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Artículos", href: "/articulos", icon: Book },
  { name: "Categorías", href: "/categorias", icon: Tag },
  { name: "Autores", href: "/autores", icon: User },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col fixed inset-y-0 z-50 bg-background border-r">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">M</span>
          </div>
          <span className="text-xl font-bold">Mindraxia</span>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
      
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          Divulgación científica técnica
        </p>
      </div>
    </div>
  )
}
```

### 2.7 Crear Header
`src/components/header.tsx`:
```tsx
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          {/* Breadcrumb o título de página aquí */}
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
```

### 2.8 Crear MainLayout
`src/components/main-layout.tsx`:
```tsx
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex flex-1 flex-col ml-64">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
```

### 2.9 Actualizar layout raíz
`src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mindraxia - Divulgación Científica Técnica",
  description: "Plataforma de divulgación científica técnica con artículos de física, matemáticas, ingeniería y ciencias duras",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 2.10 Crear página principal con contenido dummy
`src/app/page.tsx` - [Contenido completo con artículos de ejemplo]

## 🔧 Paso 3: Configurar Backend (Strapi)

### 3.1 Crear proyecto Strapi
```bash
cd apps/backend
npx create-strapi-app@latest . --quickstart --no-run
```

### 3.2 Instalar driver PostgreSQL
```bash
npm install pg
npm install --save-dev @types/pg
```

### 3.3 Configurar variables de entorno
Crear `apps/backend/.env`:
```env
# Server
HOST=0.0.0.0
PORT=1337

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=mindraxia
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_SSL=false

# Secrets (genera valores únicos para producción)
APP_KEYS=toBeModified1,toBeModified2
API_TOKEN_SALT=toBeModified
ADMIN_JWT_SECRET=toBeModified
TRANSFER_TOKEN_SALT=toBeModified
JWT_SECRET=toBeModified
```

### 3.4 Crear modelos de contenido

**Categoría** - `src/api/categoria/content-types/categoria/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "categorias",
  "info": {
    "singularName": "categoria",
    "pluralName": "categorias",
    "displayName": "Categoria",
    "description": "Categorías para organizar los artículos"
  },
  "options": { "draftAndPublish": true },
  "pluginOptions": {},
  "attributes": {
    "nombre": { "type": "string", "required": true, "unique": true },
    "descripcion": { "type": "text" },
    "slug": { "type": "uid", "targetField": "nombre", "required": true },
    "articulos": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::articulo.articulo",
      "mappedBy": "categoria"
    }
  }
}
```

**Autor** - `src/api/autor/content-types/autor/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "autores",
  "info": {
    "singularName": "autor",
    "pluralName": "autores",
    "displayName": "Autor",
    "description": "Autores de los artículos"
  },
  "options": { "draftAndPublish": true },
  "pluginOptions": {},
  "attributes": {
    "nombre": { "type": "string", "required": true },
    "biografia": { "type": "richtext" },
    "email": { "type": "email" },
    "twitter": { "type": "string" },
    "linkedin": { "type": "string" },
    "avatar": {
      "type": "media",
      "multiple": false,
      "required": false,
      "allowedTypes": ["images"]
    },
    "articulos": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::articulo.articulo",
      "mappedBy": "autor"
    }
  }
}
```

**Artículo** - `src/api/articulo/content-types/articulo/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "articulos",
  "info": {
    "singularName": "articulo",
    "pluralName": "articulos",
    "displayName": "Articulo",
    "description": "Artículos de divulgación científica"
  },
  "options": { "draftAndPublish": true },
  "pluginOptions": {},
  "attributes": {
    "titulo": { "type": "string", "required": true },
    "resumen": { "type": "text", "required": true },
    "contenido": { "type": "richtext", "required": true },
    "slug": { "type": "uid", "targetField": "titulo", "required": true },
    "fechaPublicacion": { "type": "datetime" },
    "tiempoLectura": { "type": "integer", "min": 1 },
    "etiquetas": { "type": "json" },
    "autor": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::autor.autor",
      "inversedBy": "articulos"
    },
    "categoria": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::categoria.categoria",
      "inversedBy": "articulos"
    },
    "imagenDestacada": {
      "type": "media",
      "multiple": false,
      "required": false,
      "allowedTypes": ["images"]
    }
  }
}
```

## 🤖 Paso 4: Preparar Estructura para IA

### 4.1 Crear paquete AI
`packages/ai/package.json`:
```json
{
  "name": "@mindraxia/ai",
  "version": "0.1.0",
  "description": "AI integration package for Mindraxia - LangChain & LangGraph utilities",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@langchain/core": "^0.1.0",
    "langchain": "^0.1.0",
    "langgraph": "^0.0.1",
    "pgvector": "^0.1.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### 4.2 Crear archivos de estructura IA
- `packages/ai/src/index.ts`
- `packages/ai/src/types.ts`
- `packages/ai/src/embeddings.ts`
- `packages/ai/src/search.ts`
- `packages/ai/src/agents.ts`

## 🌱 Paso 5: Crear Script de Población de Datos

### 5.1 Crear script de seed
`scripts/seed-data.js` - [Script completo con categorías, autores y artículos]

### 5.2 Configurar package.json para scripts
`scripts/package.json`:
```json
{
  "name": "mindraxia-scripts",
  "version": "1.0.0",
  "description": "Scripts para poblar Mindraxia con datos de ejemplo",
  "main": "seed-data.js",
  "scripts": {
    "seed": "node seed-data.js"
  },
  "dependencies": {
    "axios": "^1.6.0"
  }
}
```

## 🛡️ Paso 6: Configurar Git

### 6.1 Crear .gitignore
```gitignore
# Dependencies
node_modules/
apps/*/node_modules/
apps/frontend/node_modules/
apps/backend/node_modules/
packages/*/node_modules/
**/node_modules/
.pnpm-store/
.pnpm-debug.log*
pnpm-lock.yaml
package-lock.json

# Environment variables
.env
.env.local
*/.env
**/.env

# Build outputs
dist/
build/
.next/
out/

# Strapi specific
apps/backend/.tmp/
apps/backend/build/
apps/backend/dist/
apps/backend/.strapi-updater.json
apps/backend/.strapi/

# Database
*.db
*.sqlite
*.sqlite3

# Logs y otros archivos temporales
*.log
.cache/
tmp/
temp/
```

### 6.2 Inicializar repositorio
```bash
git init
git add .gitignore
git add .
git commit -m "Initial commit: Mindraxia platform setup"
```

## 🚀 Paso 7: Ejecutar el Proyecto

### 7.1 Preparar base de datos
```sql
-- En PostgreSQL
CREATE DATABASE mindraxia;
```

### 7.2 Instalar dependencias
```bash
pnpm setup
```

### 7.3 Arrancar en desarrollo
```bash
# Terminal 1: Backend
pnpm dev:backend

# Terminal 2: Frontend  
pnpm dev:frontend

# O ambos a la vez:
pnpm dev
```

### 7.4 Poblar con datos de ejemplo
```bash
pnpm seed
```

## ✅ Resultado Final

Tendrás un proyecto completamente funcional con:

- **Frontend**: http://localhost:3000
  - Layout moderno con sidebar y header
  - Tema claro/oscuro
  - Componentes con Shadcn UI
  - Páginas responsive

- **Backend**: http://localhost:1337/admin
  - Strapi 4 con PostgreSQL
  - Modelos de contenido definidos
  - Panel de administración

- **Contenido**:
  - 4 categorías científicas
  - 3 autores con biografías
  - 3 artículos completos con contenido real

- **Estructura preparada para IA**:
  - Paquete @mindraxia/ai
  - Tipos TypeScript para embeddings
  - Estructura para LangChain/LangGraph

## 📚 Próximos Pasos

1. Conectar frontend con API de Strapi
2. Implementar páginas de artículo individual
3. Añadir funcionalidad de búsqueda
4. Integrar LangChain para búsqueda semántica
5. Implementar sistema de recomendaciones

¡Tu plataforma Mindraxia está lista para comenzar a crear contenido científico de calidad! 🎉 