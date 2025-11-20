import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-text-primary sm:text-5xl lg:text-6xl">
          Sobre Mindraxia
        </h1>
        <p className="mt-4 text-xl text-star-cyan">
          La Galaxia del Conocimiento
        </p>
      </div>

      {/* Contenido Principal */}
      <div className="space-y-12">
        {/* Biografía */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            ¿Qué es Mindraxia?
          </h2>
          <div className="space-y-4 text-text-secondary">
            <p className="text-lg leading-relaxed">
              Mindraxia es un blog personal dedicado a compartir conocimiento sobre tecnología, 
              desarrollo web, y el aprendizaje continuo. Cada artículo que publicamos es como 
              una estrella en la galaxia del conocimiento: ilumina un tema, comparte experiencia, 
              y ayuda a otros en su propio viaje de aprendizaje.
            </p>
            <p className="leading-relaxed">
              Creemos que el conocimiento debe ser compartido libremente y que cada desarrollador, 
              diseñador o entusiasta de la tecnología puede contribuir a hacer de internet un 
              lugar mejor y más accesible.
            </p>
          </div>
        </section>

        {/* Misión y Valores */}
        <section className="rounded-lg border p-8"
                 style={{
                   borderColor: 'var(--border-glow)',
                   backgroundColor: 'rgba(26, 26, 46, 0.5)',
                 }}>
          <h2 className="mb-6 text-2xl font-semibold text-text-primary">
            Misión
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Crear un espacio donde el conocimiento sea accesible, comprensible y útil. 
            Queremos inspirar a otros a seguir aprendiendo y explorando nuevas tecnologías, 
            métodos y perspectivas en el mundo del desarrollo y la tecnología.
          </p>
        </section>

        {/* Temas e Intereses */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-text-primary">
            Temas que Exploramos
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              "Desarrollo Web",
              "Next.js y React",
              "TypeScript",
              "Bases de Datos",
              "Arquitectura de Software",
              "Mejores Prácticas",
            ].map((topic, index) => (
              <div
                key={index}
                className="rounded-lg border p-4"
                style={{
                  borderColor: 'var(--border-glow)',
                }}
              >
                <p className="text-text-secondary">{topic}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Redes Sociales (Placeholder) */}
        <section className="space-y-4 text-center">
          <h2 className="text-2xl font-semibold text-text-primary">
            Conéctate
          </h2>
          <p className="text-text-secondary">
            Próximamente: Enlaces a redes sociales y formas de contacto.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-full border px-6 py-2 text-text-secondary transition-colors hover:border-star-cyan hover:text-star-cyan"
              style={{
                borderColor: 'var(--border-glow)',
              }}
            >
              Contactar
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

