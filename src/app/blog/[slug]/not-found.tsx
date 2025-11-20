import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <div className="space-y-6">
        <h1 className="text-6xl font-bold text-text-primary sm:text-7xl lg:text-8xl">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-text-secondary sm:text-3xl">
          Post no encontrado
        </h2>
        <p className="text-lg text-text-muted">
          El post que buscas no existe o no está disponible.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/blog"
            className="rounded-lg border px-6 py-3 transition-colors hover:border-star-cyan hover:text-star-cyan"
            style={{ borderColor: 'var(--border-glow)' }}
          >
            Volver al blog
          </Link>
          <Link
            href="/"
            className="rounded-lg border px-6 py-3 transition-colors hover:border-star-cyan hover:text-star-cyan"
            style={{ borderColor: 'var(--border-glow)' }}
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

