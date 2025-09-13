Por supuesto, aquí tienes el prompt completo, claro y unificado para que puedas usarlo directamente. Incluye TODO lo que has pedido, sin perder nada por el camino:

---

```markdown
Actúa como un desarrollador fullstack autónomo con experiencia en proyectos monorepo y tecnologías modernas. Tu objetivo es iniciar el desarrollo del proyecto **Mindraxia**, una plataforma web de **divulgación científica técnica**, donde se publicarán artículos de opinión y análisis profundos sobre física, matemáticas, ingeniería y otras ciencias duras.

La plataforma debe ser rigurosa, moderna, y escalable para integrar en el futuro herramientas avanzadas de inteligencia artificial que faciliten la exploración y consulta de conocimientos científicos.

---

## Requisitos técnicos y arquitectura general:

- **Monorepo** organizado con **pnpm workspaces** o **Turborepo**.
- **Frontend**: Next.js 14+ con App Router y React Server Components.
- **Backend CMS**: Strapi 4+ para gestión de contenido (artículos, autores, categorías).
- **Base de datos**: PostgreSQL, preparada para usar también extensiones vectoriales (PGVector) para embeddings.
- **Estilos y UI**:
  - Usa TailwindCSS configurado correctamente para todo el frontend.
  - Integra Shadcn UI para componentes reutilizables y accesibles.
  - Diseño moderno, limpio y sobrio, inspirado en webs tipo **Vercel Docs**, **Notion** o **Linear**.
  - Soporte nativo para modo claro y modo oscuro usando `next-themes`.
  - Interfaz con tipografía legible, espacios generosos, colores neutros y componentes con sombras suaves para facilitar la lectura prolongada.
  - Layout base con barra lateral para navegación y header fijo.

- **Infraestructura para futuro**:
  - Preparar el backend y frontend para integrar LangChain y LangGraph.
  - Arquitectura pensada para indexar contenido con embeddings y consultas vectoriales.
  - Separar código y estructura para poder añadir agentes IA que interactúen con los artículos.

---

## Estructura propuesta del monorepo:

```

mindraxia/
├── apps/
│   ├── frontend/      # Next.js 14+ App Router + UI + Tailwind + Shadcn
│   └── backend/       # Strapi 4 CMS
├── packages/
│   └── ui/            # Componentes compartidos, si aplica
├── database/          # Scripts, migraciones y configuraciones DB
├── docker/
│   ├── postgres/      # Imagen y configuración docker para PostgreSQL
│   └── ...
├── .env
├── pnpm-workspace.yaml
├── README.md

````

---

## Pasos a ejecutar, uno por uno, sin avanzar hasta completar el anterior correctamente:

### Paso 1: Crear el monorepo base

- Inicializa un repositorio nuevo `mindraxia` con `pnpm init`.
- Configura `pnpm-workspace.yaml` para los workspaces `apps/*` y `packages/*`.
- Crea las carpetas `apps/frontend` y `apps/backend`.

### Paso 2: Configurar frontend (Next.js)

- Dentro de `apps/frontend`:
  - Inicializa Next.js 14+ con TypeScript y App Router:
    ```bash
    pnpm create next-app@latest . --typescript --experimental-app
    ```
  - Instala y configura TailwindCSS:
    ```bash
    pnpm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    ```
  - Configura `tailwind.config.js` para incluir los paths:
    ```js
    module.exports = {
      content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}'
      ],
      theme: { extend: {} },
      plugins: [],
    }
    ```
  - Instala y configura Shadcn UI:
    ```bash
    npx shadcn-ui@latest init
    ```
    - Elige opciones para TailwindCSS y App Router.
  - Implementa un layout base inspirado en Vercel Docs:
    - Barra lateral para navegación de secciones.
    - Tema claro/oscuro con `next-themes`.
    - Tipografía y colores neutros para facilitar la lectura técnica.
    - Uso de sombras y espacios para mejorar la experiencia visual.
  - Crea páginas básicas:
    - Página principal con listado dummy de artículos.
    - Página de artículo individual.
    - Página por categoría.
  - Verifica que `pnpm dev` arranca sin errores y la web es responsive.

### Paso 3: Configurar backend (Strapi)

- En `apps/backend`:
  - Usa el comando oficial para crear Strapi 4 sin arrancar:
    ```bash
    npx create-strapi-app@latest backend --quickstart --no-run
    ```
  - Mueve el contenido generado dentro de `apps/backend`.
  - Configura la conexión a PostgreSQL (local o docker).
  - Asegúrate que Strapi arranca con:
    ```bash
    pnpm develop
    ```
  - Define los modelos iniciales de contenido:
    - Artículo: título, resumen, contenido rich text, etiquetas, autor, fecha.
    - Autor: nombre, biografía, enlaces sociales.
    - Categoría: nombre, descripción.
  - Prueba crear contenido desde el panel de Strapi.

### Paso 4: Configuración base de la base de datos

- conectaremos a una instancia local. Tu solo prepara las variables de entorno para tenerlo a punto y conectado todo
- Asegúrate que tanto frontend como backend pueden acceder a la misma base de datos.

### Paso 5: Preparar para futura integración con IA

- Organiza el código para que el backend pueda exponer APIs para embeddings y consultas vectoriales.
- Añade carpetas o paquetes en el monorepo para futura integración con LangChain y LangGraph.
- Documenta en README.md la visión de la integración futura y pasos a seguir.

---

## Recomendaciones para ejecución:

- No avances si alguna instalación o configuración falla.
- Cada paso debe terminar con un entorno funcional y sin errores.
- Documenta cualquier comando usado y resultados relevantes.
- Mantén consistencia en la gestión de paquetes con `pnpm`.
- Usa Docker para base de datos para facilitar despliegues y consistencia.

---

Si entiendes este plan, empieza por el Paso 1 y genera los comandos, estructura y archivos para ese paso. Luego espera confirmación para seguir con el Paso 2.

---

¿Quieres que te genere el código y comandos exactos para el Paso 1 ahora?
````

---

Si necesitas, también puedo ayudarte a crear scripts de automatización para cada paso. Solo dime.
