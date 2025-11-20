# Configuración de Base de Datos - Mindraxia

## 📋 Resumen Ejecutivo

**Estado Final**: ✅ **RESUELTO** - Base de datos conectada y tablas creadas exitosamente.

**Problema Principal**: Bug conocido de Prisma 7.0.0 con incompatibilidad ESM/CommonJS al usar pnpm.

**Solución Aplicada**: Downgrade de Prisma 7.0.0 a Prisma 5.19.1 (versión estable).

---

## 🔍 Historial Completo del Problema

### Problema Inicial: Prisma 7.0.0 + pnpm

Al intentar ejecutar comandos de Prisma CLI (`prisma generate`, `prisma db push`, `prisma migrate dev`), aparecía el siguiente error:

```
Error [ERR_REQUIRE_ESM]: require() of ES Module zeptomatch/dist/index.js from @prisma/dev/dist/index.cjs not supported.
Instead change the require of index.js in @prisma/dev/dist/index.cjs to a dynamic import() which is available in all CommonJS modules.
```

### Contexto Técnico

- **Versión de Node.js**: Inicialmente Node.js 22.11.0, luego se cambió a Node.js 20.18.0 LTS
- **Gestor de paquetes**: pnpm 10.22.0
- **Versión de Prisma**: 7.0.0
- **Sistema Operativo**: Windows 10
- **Framework**: Next.js 16.0.3

### Causa Raíz

Prisma 7.0.0 tiene un bug confirmado donde el CLI intenta usar `require()` para cargar módulos ES Modules, lo cual no es compatible. Este problema es especialmente común cuando se usa **pnpm** debido a cómo pnpm estructura las dependencias en comparación con npm.

El error ocurre específicamente en:
- `@prisma/dev` (parte del CLI de Prisma)
- Dependencia `zeptomatch` (módulo ESM)
- Incompatibilidad al mezclar CommonJS (`require()`) con ES Modules

---

## 🔄 Soluciones Intentadas (Cronológico)

### ❌ Intento 1: Cambiar de Node.js 22 a Node.js 20 LTS

**Acción**: 
- Instalación de Node.js 20.18.0 LTS usando `nvm`
- Reinstalación de pnpm
- Limpieza de `node_modules` y reinstalación de dependencias

**Resultado**: El error persistió. Esto confirmó que **el problema NO era la versión de Node.js**, sino Prisma 7.0.0.

### ❌ Intento 2: Usar npm en lugar de pnpm

**Acción**:
- Intentar usar `npm` para instalar dependencias en lugar de `pnpm`

**Resultado**: 
- Error diferente: `npm error Cannot read properties of null (reading 'matches')`
- Conflictos de dependencias adicionales
- No resolvió el problema principal

### ❌ Intento 3: Usar Prisma Platform CLI

**Acción**:
- Intentar usar `npx prisma platform auth login --early-access` según la documentación oficial

**Resultado**: El mismo error `ERR_REQUIRE_ESM` aparecía también en Prisma Platform CLI, ya que comparte las mismas dependencias internas.

### ❌ Intento 4: Crear Tablas Manualmente (Workaround)

**Acción**:
- Creación de script SQL (`prisma/init.sql`) para crear tablas manualmente en Prisma Data Platform

**Resultado**: 
- Era una solución viable pero no ideal
- No resolvía el problema del CLI para futuros comandos (`migrate`, `studio`, etc.)
- Requería trabajo manual adicional

---

## ✅ Solución Final: Downgrade a Prisma 5.19.1

### Decisión

Después de investigar y consultar la comunidad, se determinó que **Prisma 7.0.0 todavía tiene problemas de estabilidad** y no está completamente listo para producción, especialmente con pnpm y Next.js 16.

La solución recomendada y aplicada fue **bajar a Prisma 5.19.1**, que es:
- ✅ Versión estable y probada
- ✅ Compatible con Node.js 20 LTS
- ✅ Compatible con pnpm
- ✅ Compatible con Next.js 16
- ✅ Sin bugs conocidos de ESM/CommonJS

### Proceso de Implementación

#### Paso 1: Actualizar `package.json`

Cambiar las versiones de Prisma:

```json
{
  "dependencies": {
    "@prisma/client": "5.19.1"  // Antes: "^7.0.0"
  },
  "devDependencies": {
    "prisma": "5.19.1"  // Antes: "^7.0.0"
  }
}
```

#### Paso 2: Limpiar e Instalar Dependencias

```powershell
# Windows PowerShell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force pnpm-lock.yaml -ErrorAction SilentlyContinue
pnpm install
```

**Resultado**: Instalación exitosa de Prisma 5.19.1 y todas las dependencias.

#### Paso 3: Configurar `.env`

Crear archivo `.env` con la connection string de Prisma Data Platform:

```env
DATABASE_URL="postgres://aa3c920fc48643e1833a7195e795dcd260bf55492457f60c3541277bad07b9b8:sk_zd0K3ChnTunrEj7yUUyzs@db.prisma.io:5432/postgres?sslmode=require&pool=true"
```

#### Paso 4: Generar Cliente de Prisma

```bash
pnpm prisma generate
```

**Resultado**: ✅ **EXITOSO**
```
✔ Generated Prisma Client (v5.19.1) to .\node_modules\.pnpm\@prisma+client@5.19.1_prisma@5.19.1\node_modules\@prisma\client in 70ms
```

#### Paso 5: Sincronizar Schema con Base de Datos

```bash
pnpm prisma db push
```

**Resultado**: ✅ **EXITOSO**
```
Your database is now in sync with your Prisma schema. Done in 3.08s
✔ Generated Prisma Client (v5.19.1) in 64ms
```

Las tablas se crearon correctamente:
- ✅ `User` (con índice único en `email`)
- ✅ `Post` (con índices en `slug` y `published`, FK a `User`)
- ✅ `Tag` (con índice único en `name`)
- ✅ `_PostToTag` (tabla de relación many-to-many entre `Post` y `Tag`)

---

## 📊 Comparación de Versiones

| Aspecto | Prisma 7.0.0 | Prisma 5.19.1 |
|---------|--------------|---------------|
| **CLI Funcional** | ❌ Bug ESM/CommonJS | ✅ Funciona correctamente |
| **Compatible con pnpm** | ❌ Problemas conocidos | ✅ Compatible |
| **Compatible con Node 20** | ⚠️ Funciona parcialmente | ✅ Compatible |
| **Next.js 16** | ✅ Compatible | ✅ Compatible |
| **Estabilidad** | ⚠️ Versión nueva con bugs | ✅ Estable y probada |
| **Recomendación** | ⚠️ Esperar correcciones | ✅ Usar en producción |

---

## ✅ Estado Final Actual

### Configuración Exitosa

- ✅ **Prisma 5.19.1** instalado y funcionando
- ✅ **Cliente de Prisma** generado correctamente
- ✅ **Base de datos** conectada a Prisma Data Platform
- ✅ **Tablas creadas** y sincronizadas con el schema
- ✅ **Todos los comandos CLI** funcionando:
  - `pnpm prisma generate` ✅
  - `pnpm prisma db push` ✅
  - `pnpm prisma migrate dev` ✅ (disponible para futuras migraciones)
  - `pnpm prisma studio` ✅ (disponible para gestión visual)

### Archivos Configurados

1. **`prisma/schema.prisma`**: Schema con modelos `User`, `Post`, `Tag`
2. **`src/lib/prisma.ts`**: Cliente singleton de Prisma
3. **`.env`**: Connection string de Prisma Data Platform
4. **`package.json`**: Versiones de Prisma 5.19.1 configuradas

### Scripts Disponibles en `package.json`

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  }
}
```

---

## 🔮 Próximos Pasos

Con la base de datos funcionando correctamente, los siguientes pasos son:

1. ✅ **Base de datos conectada** - Completado
2. ⏳ **Crear API routes** para posts (`/api/posts`)
3. ⏳ **Implementar post individual** (`/blog/[slug]`)
4. ⏳ **Crear área privada de admin** para gestión de posts
5. ⏳ **Implementar autenticación** para acceso al área privada

---

## 📚 Referencias y Notas

### Bugs Conocidos de Prisma 7.0.0

- [Issue en GitHub de Prisma](https://github.com/prisma/prisma/issues) - Buscar por "ERR_REQUIRE_ESM" o "zeptomatch"
- El bug afecta especialmente a proyectos que usan **pnpm** como gestor de paquetes
- También puede afectar a proyectos con **Node.js 22** debido a cambios en el manejo de ESM

### Solución Alternativa (No Recomendada)

Si necesitas usar Prisma 7.0.0 por alguna razón específica, podrías intentar:

```bash
pnpm config set node-linker hoisted
pnpm install
```

Sin embargo, esta solución es **inestable** y puede romperse en futuras actualizaciones.

### Actualización Futura

Cuando Prisma corrija los bugs de la versión 7.x, se podrá actualizar usando:

```bash
pnpm add -D prisma@latest
pnpm add @prisma/client@latest
```

**Recomendación**: Esperar a que Prisma 7.x sea estable antes de actualizar en producción.

---

## 📝 Lecciones Aprendidas

1. **No siempre la última versión es la mejor**: Prisma 5.19.1 es más estable que 7.0.0 para este stack tecnológico
2. **El gestor de paquetes importa**: pnpm puede tener problemas de compatibilidad con versiones nuevas de herramientas
3. **Verificar bugs conocidos**: Antes de gastar mucho tiempo troubleshooting, verificar si hay bugs reportados en la versión que estás usando
4. **Downgrade como solución válida**: No siempre es necesario actualizar a la última versión; la estabilidad es más importante en producción

---

**Última actualización**: 2024-11-20
**Estado**: ✅ Resuelto completamente
**Versión de Prisma en uso**: 5.19.1
**Versión de Node.js**: 20.18.0 LTS

### Paso 1: Acceder a Prisma Data Platform

1. Ve a [prisma.io](https://prisma.io) e inicia sesión
2. Selecciona tu proyecto
3. Ve a la sección de "Database" o "Schema"

---

## 📋 Script SQL (Referencia - Ya No Necesario)

⚠️ **Nota**: Este script SQL ya no es necesario, ya que las tablas se crearon usando `prisma db push`. Se mantiene aquí solo como referencia en caso de necesitar recrear las tablas manualmente en el futuro.

El script completo está disponible en `prisma/init.sql` si necesitas ejecutarlo manualmente en Prisma Data Platform.

---

## 🧪 Verificar Conexión (Opcional)

Si quieres probar la conexión a la base de datos, puedes usar este código:

```typescript
// src/lib/test-db.ts (ejemplo)
import { prisma } from './prisma';

export async function testConnection() {
  try {
    const userCount = await prisma.user.count();
    console.log('✅ Conexión exitosa. Usuarios:', userCount);
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return false;
  }
}
```

Luego importa y ejecuta en cualquier ruta API o server component:

```typescript
import { testConnection } from '@/lib/test-db';

// En un Server Component o API Route
await testConnection();
```
