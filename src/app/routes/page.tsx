import { Suspense } from 'react';
import RouteList from '@/components/RouteList';

export default function RoutesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-text-primary mb-4">Rutas de Posts</h1>
        <p className="text-lg text-text-secondary">
          Explora secuencias ordenadas de posts diseñadas para guiarte en tu aprendizaje
        </p>
      </header>

      <Suspense fallback={<div className="text-text-muted">Cargando rutas...</div>}>
        <RoutesListWithParams searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function RoutesListWithParams({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const categorySlug = params.category;

  return <RouteList categorySlug={categorySlug} />;
}


