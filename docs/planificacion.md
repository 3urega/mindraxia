# Planificación: Mindraxia - La Galaxia del Conocimiento

## 📚 Introducción al Proyecto

**Mindraxia** es un blog personal enfocado en compartir conocimiento, donde cada post es una estrella en la galaxia del aprendizaje. El proyecto está construido con Next.js 16 y TypeScript, aprovechando el App Router para crear una experiencia moderna y escalable.

### Concepto Central
- **Nombre**: Mindraxia
- **Significado**: La Galaxia del Conocimiento
- **Temática Visual**: Espacial, cósmica, con elementos que evocan estrellas, constelaciones y el universo

---

## 📊 Estado General del Proyecto

### ✅ Completado (60% aprox.)

#### Semana 1: Fundación ✅ 100%
- Root Layout con tema galáctico
- Sistema de diseño configurado (Tailwind CSS v4)
- Componentes Header y Footer
- Página de inicio

#### Semana 2: Estructura Pública ✅ 80%
- ✅ Rutas públicas creadas (`/blog`, `/about`, `/contact`)
- ✅ Componente PostCard reutilizable
- ✅ Página de blog con lista de posts
- ✅ Página "Sobre mí"
- ✅ Página "Contacto"
- ⏳ Post individual (`/blog/[slug]`) - **PENDIENTE**

#### Semana 3: Backend y Base de Datos ✅ 50%
- ✅ Prisma configurado (v5.19.1)
- ✅ Schema de base de datos definido
- ✅ Base de datos conectada (PostgreSQL en Prisma Data Platform)
- ✅ Tablas creadas y sincronizadas
- ⏳ API routes para posts - **PENDIENTE**
- ⏳ API routes de autenticación - **PENDIENTE**

#### Semana 4: Panel de Administración ⏳ 0%
- ⏳ Sistema de autenticación
- ⏳ Página de login
- ⏳ Dashboard admin
- ⏳ Editor de posts

### 🎯 Próximos Pasos (Prioridad)

1. **API Routes para Posts** - Crear endpoints para listar y obtener posts
2. **Página de Post Individual** - Implementar `/blog/[slug]` con renderizado de markdown
3. **Conectar Frontend con API** - Actualizar páginas para usar datos reales de la base de datos

---

## 🚀 Primeros Pasos

### Fase 1: Configuración del Root Layout (PRIORITARIO)

**Objetivo**: Establecer la base de la aplicación con el layout raíz que contendrá todos los elementos compartidos.

#### 1.1. Actualizar el Root Layout (`src/app/layout.tsx`)

**Componentes necesarios:**
- Metadata actualizada con información de Mindraxia
- Estructura HTML base
- Fuentes optimizadas
- Variables CSS para el tema galáctico
- Proveedor de tema (dark mode como predeterminado)
- Componentes globales (Header, Footer, Navegación)

**Características:**
- Tema oscuro por defecto (evocando el espacio profundo)
- Sistema de colores inspirado en el cosmos
- Tipografía legible y moderna
- SEO optimizado

#### 1.2. Estructura del Layout Raíz

```typescript
RootLayout
├── <html> (lang="es")
├── <head>
│   └── Metadata (SEO, Open Graph, etc.)
├── <body>
│   ├── Header (Logo, Navegación principal)
│   ├── {children} (Contenido de las páginas)
│   └── Footer (Enlaces, información)
```

---

## 🎨 Propuesta de Estilos Visuales

### Tema: Galaxia Cósmica

#### Paleta de Colores

**Fondo Principal (Espacio Profundo)**
- **Dark Background**: `#0a0a0f` (casi negro con tinte azul)
- **Primary Background**: `#1a1a2e` (azul oscuro profundo)
- **Secondary Background**: `#16213e` (azul medio oscuro)

**Colores de Acento (Estrellas y Nebulosas)**
- **Primary**: `#64ffda` (cian brillante - estrellas)
- **Secondary**: `#7c3aed` (púrpura - nebulosas)
- **Accent**: `#fbbf24` (amarillo/dorado - estrellas cálidas)

**Texto**
- **Primary Text**: `#f8fafc` (blanco suave)
- **Secondary Text**: `#cbd5e1` (gris claro)
- **Muted Text**: `#94a3b8` (gris medio)

**Elementos de UI**
- **Borders**: `rgba(100, 255, 218, 0.2)` (cian translúcido)
- **Hover States**: Glow effect con `#64ffda`
- **Links**: `#64ffda` con hover glow

#### Efectos Visuales

1. **Estrellas de fondo**: Animación sutil de puntos brillantes
2. **Glow effects**: Resplandor suave en elementos interactivos
3. **Gradientes**: Transiciones de color como nebulosas
4. **Glassmorphism**: Efectos de vidrio translúcido en cards

#### Tipografía

- **Headings**: Geist Sans (futurista, limpia)
- **Body**: Geist Sans (legible, moderna)
- **Code**: Geist Mono (monoespaciada, técnica)

---

## 📄 Propuesta de Páginas Iniciales

### Estructura General del Proyecto

```
src/app/
├── layout.tsx                    # Root Layout
├── page.tsx                      # Página de inicio (público)
│
├── (public)/                     # Grupo de rutas públicas
│   ├── blog/
│   │   ├── layout.tsx           # Layout del blog (header del blog)
│   │   ├── page.tsx             # Lista de posts (/blog)
│   │   └── [slug]/
│   │       └── page.tsx         # Post individual (/blog/[slug])
│   │
│   ├── about/
│   │   └── page.tsx             # Sobre mí (/about)
│   │
│   └── contact/
│       └── page.tsx             # Contacto (/contact)
│
├── (private)/                    # Grupo de rutas privadas (admin)
│   ├── admin/
│   │   ├── layout.tsx           # Layout del admin
│   │   ├── page.tsx             # Dashboard (/admin)
│   │   ├── posts/
│   │   │   ├── page.tsx         # Lista de posts (/admin/posts)
│   │   │   ├── new/
│   │   │   │   └── page.tsx     # Crear post (/admin/posts/new)
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Editar post (/admin/posts/[id])
│   │   └── login/
│   │       └── page.tsx         # Login (/admin/login)
│
└── api/                          # API Routes
    ├── posts/
    │   ├── route.ts             # GET /api/posts (lista)
    │   │                        # POST /api/posts (crear)
    │   └── [id]/
    │       └── route.ts         # GET/PUT/DELETE /api/posts/[id]
    ├── auth/
    │   └── route.ts             # POST /api/auth (login/logout)
    └── health/
        └── route.ts             # GET /api/health (status)
```

### Páginas Públicas (Lectura)

#### 1. **Página de Inicio** (`/`)
- **Componente**: Hero section con bienvenida
- **Características**:
  - Animación de estrellas de fondo
  - Título principal: "Bienvenido a Mindraxia"
  - Subtítulo: "La Galaxia del Conocimiento"
  - Grid de posts destacados/recientes
  - Call-to-action hacia el blog
  - Footer con enlaces y redes sociales

#### 2. **Lista de Posts** (`/blog`)
- **Componente**: Grid o lista de tarjetas de posts
- **Características**:
  - Filtros por categoría/tags
  - Búsqueda de posts
  - Paginación
  - Preview de cada post (título, excerpt, fecha, tags)
  - Ordenamiento (más reciente, más popular)

#### 3. **Post Individual** (`/blog/[slug]`)
- **Componente**: Artículo completo
- **Características**:
  - Título, autor, fecha de publicación
  - Contenido en markdown
  - Tabla de contenidos (si aplica)
  - Tags/categorías
  - Navegación (post anterior/siguiente)
  - Comentarios (opcional, futuro)
  - Botones de compartir

#### 4. **Sobre Mí** (`/about`)
- **Componente**: Página informativa
- **Características**:
  - Biografía
  - Foto/perfil
  - Habilidades/intereses
  - Enlaces a redes sociales

#### 5. **Contacto** (`/contact`)
- **Componente**: Formulario de contacto
- **Características**:
  - Formulario de contacto
  - Información de contacto alternativo
  - Mapa o ubicación (opcional)

### Páginas Privadas (Admin/Escritura)

#### 1. **Login** (`/admin/login`)
- **Componente**: Formulario de autenticación
- **Características**:
  - Formulario de login
  - Validación
  - Manejo de sesión
  - Redirección post-login

#### 2. **Dashboard** (`/admin`)
- **Componente**: Panel de control
- **Características**:
  - Estadísticas (posts publicados, borradores, etc.)
  - Accesos rápidos
  - Actividad reciente
  - Gráficos (opcional)

#### 3. **Lista de Posts** (`/admin/posts`)
- **Componente**: Tabla/lista de gestión
- **Características**:
  - Lista de todos los posts (publicados, borradores)
  - Filtros (estado, fecha, categoría)
  - Acciones: editar, eliminar, publicar/despublicar
  - Búsqueda

#### 4. **Editor de Posts** (`/admin/posts/new` y `/admin/posts/[id]`)
- **Componente**: Editor de markdown/WYSIWYG
- **Características**:
  - Editor de texto (markdown con preview)
  - Campos: título, slug, excerpt, contenido
  - Tags y categorías
  - Estado (borrador/publicado)
  - Fecha de publicación
  - Preview en tiempo real
  - Guardado automático
  - Botón de publicar

### API Routes (Backend)

#### 1. **API de Posts** (`/api/posts`)
- **GET**: Obtener lista de posts (con filtros, paginación)
- **POST**: Crear nuevo post (requiere autenticación)

#### 2. **API de Post Individual** (`/api/posts/[id]`)
- **GET**: Obtener post por ID
- **PUT**: Actualizar post (requiere autenticación)
- **DELETE**: Eliminar post (requiere autenticación)

#### 3. **API de Autenticación** (`/api/auth`)
- **POST /login**: Autenticar usuario
- **POST /logout**: Cerrar sesión
- **GET /me**: Obtener usuario actual

#### 4. **API de Health** (`/api/health`)
- **GET**: Verificar estado del servidor y base de datos

---

## 🗄️ Base de Datos

### Consideraciones Iniciales

**Opciones de base de datos:**
1. **SQLite** (para desarrollo rápido) + Prisma ORM
2. **PostgreSQL** (producción) + Prisma ORM
3. **MongoDB** (si preferimos NoSQL) + Mongoose

**Recomendación**: Empezar con SQLite para desarrollo, migrar a PostgreSQL en producción.

### Modelos de Datos (Prisma Schema)

```prisma
model Post {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  excerpt     String?
  content     String   // Markdown
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  publishedAt DateTime?
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  tags        Tag[]
  
  @@index([slug])
  @@index([published])
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  posts Post[]
}

model User {
  id       String @id @default(cuid())
  email    String @unique
  name     String
  password String // Hasheado
  posts    Post[]
  createdAt DateTime @default(now())
}
```

---

## 📦 Dependencias Adicionales Necesarias

### Backend/Base de Datos
- `prisma` - ORM para base de datos
- `@prisma/client` - Cliente de Prisma
- `bcryptjs` - Hash de contraseñas
- `jsonwebtoken` - Autenticación JWT (opcional)

### Frontend/Markdown
- `remark` - Procesador de markdown
- `remark-html` - Convertir markdown a HTML
- `react-markdown` - Renderizar markdown en React
- `gray-matter` - Front matter de archivos markdown (si usamos archivos)

### UI/Componentes
- `framer-motion` - Animaciones (efectos de estrellas, transiciones)
- `lucide-react` - Iconos
- `date-fns` - Manejo de fechas
- `zod` - Validación de esquemas

### Utilidades
- `clsx` o `tailwind-merge` - Combinación de clases CSS

---

## 🎯 Roadmap de Implementación

### Semana 1: Fundación ✅ **COMPLETADO**
- [x] ~~Actualizar Root Layout con tema galáctico~~ ✅ **COMPLETADO**
- [x] ~~Configurar variables CSS y tema~~ ✅ **COMPLETADO**
- [x] ~~Crear componente Header con navegación~~ ✅ **COMPLETADO**
- [x] ~~Crear componente Footer~~ ✅ **COMPLETADO**
- [x] ~~Implementar página de inicio básica~~ ✅ **COMPLETADO**

### Semana 2: Estructura Pública ✅ **COMPLETADO**
- [x] ~~Crear estructura de rutas públicas~~ ✅ **COMPLETADO**
- [x] ~~Implementar lista de posts (/blog)~~ ✅ **COMPLETADO**
- [x] ~~Crear componente PostCard reutilizable~~ ✅ **COMPLETADO**
- [x] ~~Crear página "Sobre mí" (/about)~~ ✅ **COMPLETADO**
- [x] ~~Crear página "Contacto" (/contact)~~ ✅ **COMPLETADO**
- [ ] Implementar post individual (/blog/[slug]) ⏳ **PENDIENTE**

### Semana 3: Backend y Base de Datos ✅ **COMPLETADO (Parcial)**
- [x] ~~Configurar Prisma~~ ✅ **COMPLETADO** (Prisma 5.19.1)
- [x] ~~Definir esquema de base de datos~~ ✅ **COMPLETADO** (`prisma/schema.prisma`)
- [x] ~~Crear tablas en base de datos~~ ✅ **COMPLETADO** (`prisma db push`)
- [x] ~~Conectar a Prisma Data Platform~~ ✅ **COMPLETADO** (PostgreSQL)
- [ ] Implementar API routes para posts ⏳ **PENDIENTE**
- [ ] Implementar API routes de autenticación ⏳ **PENDIENTE**

### Semana 4: Panel de Administración
- [ ] Crear sistema de autenticación
- [ ] Implementar página de login
- [ ] Crear dashboard del admin
- [ ] Implementar editor de posts
- [ ] Integrar con API para CRUD de posts

### Semana 5: Refinamiento
- [ ] Agregar animaciones y efectos visuales
- [ ] Optimizar SEO
- [ ] Mejorar UX/UI
- [ ] Testing básico
- [ ] Preparación para deployment

---

## 🎨 Componentes Reutilizables

### ✅ Layouts (Completados)
- ✅ `Header` (`src/components/Header.tsx`) - Navegación principal con tema galáctico
- ✅ `Footer` (`src/components/Footer.tsx`) - Pie de página con información del sitio
- ⏳ `BlogLayout` - Layout específico del blog (opcional, futuro)
- ⏳ `AdminLayout` - Layout del panel de administración (pendiente)

### ✅ UI Components (Completados)
- ✅ `PostCard` (`src/components/PostCard.tsx`) - Tarjeta de preview de post con tema galáctico
- ⏳ `Button` - Botón estilizado con tema (pendiente, usando clases Tailwind por ahora)
- ⏳ `Input` - Campo de entrada (pendiente, usando HTML nativo por ahora)
- ⏳ `Textarea` - Área de texto (pendiente, usando HTML nativo por ahora)
- ⏳ `Modal` - Ventana modal (pendiente)
- ⏳ `Tag` - Etiqueta/tag (pendiente, usando clases Tailwind por ahora)
- ⏳ `StarBackground` - Animación de estrellas de fondo (pendiente)

### ⏳ Blog Components (Pendientes)
- ⏳ `PostHeader` - Header de post individual (pendiente)
- ⏳ `PostContent` - Contenido renderizado del post (pendiente - requiere react-markdown)
- ⏳ `PostNavigation` - Navegación entre posts (pendiente)
- ⏳ `PostMeta` - Metadatos del post (fecha, tags, etc.) (pendiente)

---

## 🔐 Consideraciones de Seguridad

1. **Autenticación**: Implementar sistema robusto de login
2. **Autorización**: Proteger rutas privadas con middleware
3. **Validación**: Validar inputs en API routes
4. **Sanitización**: Limpiar contenido de markdown
5. **CORS**: Configurar correctamente si hay frontend separado
6. **Rate Limiting**: Limitar requests a API

---

## 📝 Notas Adicionales

- El proyecto utilizará **Server Components** de Next.js por defecto
- Se implementará **Client Components** solo cuando sea necesario (interactividad)
- Se priorizará el **rendering estático** para posts públicos (SEO)
- Se implementará **ISR (Incremental Static Regeneration)** para posts
- El modo oscuro será el predeterminado, pero se puede agregar toggle futuro

---

## ✅ Progreso Actual

### ✅ Completado (Semana 1 - Fundación)
- ✅ **Root Layout** (`src/app/layout.tsx`): Metadata de Mindraxia, idioma español, estructura con Header/Footer
- ✅ **Tema Galáctico** (`src/app/globals.css`): Variables CSS configuradas con Tailwind v4.1.17
- ✅ **Header Component** (`src/components/Header.tsx`): Navegación principal con tema galáctico
- ✅ **Footer Component** (`src/components/Footer.tsx`): Pie de página con información del sitio
- ✅ **Página de Inicio** (`src/app/page.tsx`): Hero section con tema galáctico, CTA hacia blog, sección de posts destacados (placeholder)

### ✅ Completado (Semana 2 - Estructura Pública)
- ✅ **Página de Blog** (`src/app/blog/page.tsx`): Lista de posts con grid de PostCard componentes
- ✅ **Componente PostCard** (`src/components/PostCard.tsx`): Tarjeta reutilizable para mostrar preview de posts
- ✅ **Página Sobre Mí** (`src/app/about/page.tsx`): Página informativa con biografía e información básica
- ✅ **Página Contacto** (`src/app/contact/page.tsx`): Formulario de contacto básico

### ✅ Completado (Semana 3 - Backend y Base de Datos - Parcial)
- ✅ **Configuración de Prisma**: Prisma 5.19.1 instalado y funcionando (downgrade de 7.0.0 para resolver bug ESM/CommonJS)
- ✅ **Schema de Base de Datos** (`prisma/schema.prisma`): Modelos `User`, `Post`, `Tag` definidos
- ✅ **Cliente de Prisma** (`src/lib/prisma.ts`): Singleton Prisma client configurado
- ✅ **Conexión a Base de Datos**: Conectado a Prisma Data Platform (PostgreSQL)
- ✅ **Tablas Creadas**: `User`, `Post`, `Tag`, `_PostToTag` sincronizadas con `prisma db push`
- ✅ **Documentación**: Proceso completo documentado en `docs/database-setup.md`

### ⏳ Pendiente Inmediato

#### Prioridad Alta (Semana 2 - Continuación)
- ⏳ **Post Individual** (`src/app/blog/[slug]/page.tsx`): Página para mostrar post completo
  - Renderizado de markdown
  - Metadatos (fecha, autor, tags)
  - Navegación (post anterior/siguiente)

#### Prioridad Alta (Semana 3 - Continuación)
- ⏳ **API Routes para Posts** (`src/app/api/posts/route.ts`):
  - GET `/api/posts` - Listar posts (con filtros, paginación)
  - POST `/api/posts` - Crear post (requiere autenticación)
- ⏳ **API Route para Post Individual** (`src/app/api/posts/[id]/route.ts`):
  - GET `/api/posts/[id]` - Obtener post por ID/slug
  - PUT `/api/posts/[id]` - Actualizar post (requiere autenticación)
  - DELETE `/api/posts/[id]` - Eliminar post (requiere autenticación)
- ⏳ **Integrar API con páginas públicas**:
  - Actualizar `/blog` para usar datos reales de la API
  - Actualizar `/blog/[slug]` para cargar post desde la API

#### Prioridad Media (Semana 4 - Panel de Administración)
- ⏳ **API Routes de Autenticación** (`src/app/api/auth/route.ts`)
- ⏳ **Sistema de Autenticación** (login/logout)
- ⏳ **Página de Login** (`src/app/admin/login/page.tsx`)
- ⏳ **Dashboard Admin** (`src/app/admin/page.tsx`)
- ⏳ **Lista de Posts Admin** (`src/app/admin/posts/page.tsx`)
- ⏳ **Editor de Posts** (`src/app/admin/posts/new/page.tsx` y `/admin/posts/[id]/page.tsx`)

---

## 🚀 Próximo Paso Inmediato

**Acción prioritaria**: Implementar la funcionalidad de posts individuales y conectar con la base de datos:

### Paso 1: Crear API Routes para Posts
1. **GET `/api/posts`** - Listar todos los posts publicados (con paginación opcional)
2. **GET `/api/posts/[slug]`** - Obtener un post específico por slug

### Paso 2: Implementar Página de Post Individual
1. Crear `src/app/blog/[slug]/page.tsx`
2. Cargar post desde la API usando el slug
3. Renderizar contenido markdown
4. Mostrar metadatos (fecha, tags, autor)

### Paso 3: Conectar Página de Blog con API
1. Actualizar `src/app/blog/page.tsx` para cargar posts reales de la API
2. Reemplazar datos placeholder con datos de la base de datos

### Paso 4: Instalar Dependencias para Markdown
1. Instalar `react-markdown` y `remark` para renderizar markdown
2. Instalar `date-fns` para formatear fechas
3. Opcional: Instalar `zod` para validación de esquemas en API

---

**Última actualización**: 2024-11-20
**Estado**: 
- ✅ Semana 1 completada (Fundación)
- ✅ Semana 2 completada (Estructura Pública - faltando post individual)
- ✅ Semana 3 parcialmente completada (Base de datos configurada, faltando API routes)
- ⏳ Siguiente paso: API routes para posts y página de post individual

