# 🛠️ Guía de Desarrollo - Mindraxia

## 🚀 Arranque Rápido

### 1. **Setup inicial** (solo la primera vez)
```bash
# Clonar repositorio
git clone <url-del-repo>
cd mindraxia

# Instalar todas las dependencias
pnpm setup
```

### 2. **Configurar base de datos**
- Asegúrate de tener PostgreSQL corriendo
- Crear base de datos: `CREATE DATABASE mindraxia;`
- Copiar variables de entorno:
```bash
cd apps/backend
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

### 3. **Arrancar todo en desarrollo**
```bash
# Desde la raíz del proyecto
pnpm dev
```

Esto arrancará automáticamente:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:1337 (Admin: http://localhost:1337/admin)

## 📋 Scripts Disponibles

### Desarrollo
```bash
pnpm dev              # Arranca frontend + backend en paralelo
pnpm dev:frontend     # Solo frontend (Next.js)
pnpm dev:backend      # Solo backend (Strapi)
```

### Producción
```bash
pnpm build:all        # Construye frontend + backend
pnpm start            # Arranca en modo producción
```

### Utilidades
```bash
pnpm setup            # Setup inicial completo
pnpm clean            # Limpia builds y caches
pnpm install:all      # Reinstala dependencias
```

## 🔧 Desarrollo Individual

### Frontend (Next.js)
```bash
cd apps/frontend
pnpm dev              # Puerto 3000
pnpm build            # Build para producción
pnpm start            # Servidor producción
```

### Backend (Strapi)
```bash
cd apps/backend
npm run develop       # Puerto 1337 (modo desarrollo)
npm run build         # Build para producción  
npm run start         # Servidor producción
```

## 📁 Estructura de Desarrollo

```
mindraxia/
├── apps/
│   ├── frontend/          # Next.js App
│   │   ├── src/
│   │   │   ├── app/       # App Router pages
│   │   │   ├── components/ # React components
│   │   │   └── lib/       # Utilities
│   │   └── package.json
│   └── backend/           # Strapi CMS
│       ├── src/
│       │   └── api/       # Content types & APIs
│       ├── config/        # Strapi configuration
│       └── package.json
├── packages/
│   ├── ui/               # Shared components
│   └── ai/               # AI utilities (future)
└── package.json          # Root workspace
```

## 🐛 Troubleshooting

### Error: "Cannot find module 'pg'"
```bash
cd apps/backend
npm install pg
```

### Error: Database connection
- Verifica que PostgreSQL esté corriendo
- Revisa las credenciales en `apps/backend/.env`
- Asegúrate de que la base de datos `mindraxia` exista

### Puerto ocupado
- Frontend: Cambia puerto con `PORT=3001 pnpm dev:frontend`
- Backend: Cambia en `apps/backend/.env` → `PORT=1338`

### Limpiar y reinstalar
```bash
pnpm clean
rm -rf node_modules apps/*/node_modules
pnpm install:all
```

## 🔄 Git Workflow

### Primera subida
```bash
git add .
git commit -m "Initial commit: Mindraxia setup"
git remote add origin <repo-url>
git push -u origin main
```

### Desarrollo diario
```bash
git add .
git commit -m "feat: descripción del cambio"
git push
```

## 📦 Dependencias Principales

### Frontend
- Next.js 14+ (React framework)
- TailwindCSS (Styling)
- Shadcn UI (Components)
- TypeScript (Type safety)

### Backend  
- Strapi 4+ (Headless CMS)
- PostgreSQL (Database)
- Knex.js (Query builder)

## 🎯 Próximos Pasos

1. **Contenido**: Crear artículos de prueba en Strapi
2. **API**: Conectar frontend con backend
3. **Páginas**: Implementar artículo individual
4. **Búsqueda**: Añadir funcionalidad de búsqueda
5. **IA**: Integrar LangChain para búsqueda semántica 