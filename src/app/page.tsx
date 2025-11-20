import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <h1 className="text-5xl font-bold tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
            Bienvenido a{" "}
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(to right, #64ffda, #7c3aed, #64ffda)',
              }}
            >
              Mindraxia
            </span>
          </h1>
          
          <h2 className="text-2xl font-semibold text-star-cyan sm:text-3xl lg:text-4xl">
            La Galaxia del Conocimiento
          </h2>
          
          <p className="mx-auto max-w-2xl text-lg leading-8 text-text-secondary sm:text-xl">
            Un espacio donde cada post es una estrella en la galaxia del aprendizaje.
            Explora artículos sobre tecnología, desarrollo, y conocimiento que inspira.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/blog"
              className="glow-cyan rounded-full border px-8 py-3 text-base font-semibold text-star-cyan transition-all hover:bg-star-cyan/10"
              style={{
                borderColor: 'var(--border-glow)',
              }}
            >
              Explorar Blog
            </Link>
            <Link
              href="/about"
              className="rounded-full border px-8 py-3 text-base font-semibold text-text-secondary transition-all hover:border-star-cyan hover:text-star-cyan"
              style={{
                borderColor: 'var(--border-glow)',
              }}
            >
              Sobre Mí
            </Link>
          </div>
        </div>
      </section>

      {/* Posts Destacados - Placeholder */}
      <section className="border-t py-16 px-4 sm:px-6 lg:px-8"
               style={{
                 borderColor: 'var(--border-glow)',
               }}>
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
              Posts Destacados
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Próximamente: Descubre los mejores artículos sobre tecnología y desarrollo
            </p>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Placeholder para posts futuros */}
              <div className="rounded-lg border p-6 text-left"
                   style={{
                     borderColor: 'var(--border-glow)',
                     backgroundColor: 'rgba(26, 26, 46, 0.5)',
                   }}>
                <div className="h-48 w-full rounded bg-space-secondary animate-pulse"></div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-space-secondary animate-pulse"></div>
                  <div className="h-4 w-1/2 rounded bg-space-secondary animate-pulse"></div>
                </div>
              </div>
              <div className="rounded-lg border p-6 text-left"
                   style={{
                     borderColor: 'var(--border-glow)',
                     backgroundColor: 'rgba(26, 26, 46, 0.5)',
                   }}>
                <div className="h-48 w-full rounded bg-space-secondary animate-pulse"></div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-space-secondary animate-pulse"></div>
                  <div className="h-4 w-1/2 rounded bg-space-secondary animate-pulse"></div>
                </div>
              </div>
              <div className="rounded-lg border p-6 text-left"
                   style={{
                     borderColor: 'var(--border-glow)',
                     backgroundColor: 'rgba(26, 26, 46, 0.5)',
                   }}>
                <div className="h-48 w-full rounded bg-space-secondary animate-pulse"></div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-space-secondary animate-pulse"></div>
                  <div className="h-4 w-1/2 rounded bg-space-secondary animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
