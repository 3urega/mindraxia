# Mindraxia

**Plataforma web de divulgación científica técnica** - Una plataforma moderna para publicar artículos de opinión y análisis profundos sobre física, matemáticas, ingeniería y otras ciencias duras.

## 🚀 Tecnologías

### Frontend
- **Next.js 14+** con App Router y React Server Components
- **TailwindCSS** para estilos
- **Shadcn UI** para componentes reutilizables
- **next-themes** para soporte de modo claro/oscuro
- **TypeScript** para tipado estático

### Backend
- **Strapi 4+** como CMS headless
- **PostgreSQL** como base de datos principal
- **Preparado para PGVector** para búsquedas vectoriales futuras

### Arquitectura
- **Monorepo** con pnpm workspaces
- **Preparado para IA** con estructura para LangChain y LangGraph

## 📁 Estructura del Proyecto

```
mindraxia/
├── apps/
│   ├── frontend/          # Next.js App (Puerto 3000)
│   └── backend/           # Strapi CMS (Puerto 1337)
├── packages/
│   ├── ui/               # Componentes compartidos
│   └── ai/               # Futura integración IA (LangChain/LangGraph)
├── database/             # Scripts y configuraciones DB
└── docker/               # Configuraciones Docker
```

## 🛠️ Desarrollo

### Prerrequisitos
- Node.js 18+
- pnpm
- PostgreSQL 14+

### Instalación

1. **Clonar el repositorio:**
```bash
git clone <repo-url>
cd mindraxia
```

2. **Instalar dependencias:**
```bash
pnpm install
```

3. **Configurar base de datos:**
   - Crear base de datos PostgreSQL llamada `mindraxia`
   - Configurar variables de entorno en `apps/backend/.env`:

```env
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=mindraxia
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
```

4. **Ejecutar en desarrollo:**

**Frontend (Puerto 3000):**
```bash
cd apps/frontend
pnpm dev
```

**Backend (Puerto 1337):**
```bash
cd apps/backend
npm run develop
```

## 📝 Modelos de Contenido

### Artículo
- Título, resumen, contenido (rich text)
- Slug, fecha de publicación, tiempo de lectura
- Etiquetas (JSON), imagen destacada
- Relaciones: Autor (many-to-one), Categoría (many-to-one)

### Autor
- Nombre, biografía (rich text), email
- Enlaces sociales (Twitter, LinkedIn)
- Avatar, relación con artículos

### Categoría
- Nombre, descripción, slug
- Relación con artículos

## 🤖 Integración IA (Futura)

El proyecto está preparado para integrar herramientas avanzadas de IA:

### Capacidades Planificadas
- **Búsqueda Semántica:** Usar embeddings para encontrar contenido relevante
- **Agentes IA:** Asistentes especializados para investigación y análisis
- **Recomendaciones:** Sistema inteligente de recomendación de artículos
- **Resúmenes Automáticos:** Generación de resúmenes usando LLMs

### Tecnologías IA
- **LangChain** para orquestación de LLMs
- **LangGraph** para agentes complejos
- **PGVector** para búsquedas vectoriales en PostgreSQL
- **OpenAI Embeddings** o modelos locales para embeddings

### Estructura Preparada
```
packages/ai/
├── src/
│   ├── embeddings.ts     # Generación y almacenamiento de embeddings
│   ├── search.ts         # Búsqueda vectorial semántica
│   ├── agents.ts         # Agentes IA especializados
│   └── types.ts          # Tipos TypeScript para IA
```

## 🎨 Diseño

La interfaz está inspirada en **Vercel Docs**, **Notion** y **Linear** con:
- Layout con sidebar fijo y header
- Modo claro/oscuro nativo
- Tipografía optimizada para lectura técnica
- Espacios generosos y sombras suaves
- Componentes accesibles con Shadcn UI

## 🚦 Estado del Proyecto

### ✅ Completado
- [x] Configuración del monorepo con pnpm
- [x] Frontend Next.js con layout moderno
- [x] Backend Strapi con PostgreSQL
- [x] Modelos de contenido (Artículo, Autor, Categoría)
- [x] Estructura preparada para integración IA

### 🔄 En Progreso
- [ ] Páginas adicionales (artículo individual, categorías)
- [ ] Integración frontend-backend (API calls)
- [ ] Sistema de autenticación

### 📋 Pendiente
- [ ] Implementación de búsqueda semántica
- [ ] Agentes IA con LangChain/LangGraph
- [ ] Configuración Docker para despliegue
- [ ] Tests automatizados
- [ ] CI/CD pipeline

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Strapi Documentation](https://docs.strapi.io)
- [TailwindCSS](https://tailwindcss.com)
- [Shadcn UI](https://ui.shadcn.com)
- [LangChain](https://js.langchain.com)

## 🤝 Contribución

Este proyecto está en desarrollo activo. Las contribuciones son bienvenidas siguiendo las mejores prácticas de desarrollo y manteniendo la calidad del código.

## 📄 Licencia

[Especificar licencia] 