import { notFound } from 'next/navigation';
import Link from 'next/link';
import PostSummaryView from '@/components/PostSummaryView';
import FontSizeSelector from '@/components/FontSizeSelector';

interface Definition {
  anchorId: string;
  description?: string;
  content: string;
  number: number;
  postSlug: string;
}

interface Equation {
  anchorId: string;
  description?: string;
  equation: string;
  number: number;
  postSlug: string;
}

interface Theorem {
  anchorId: string;
  description?: string;
  content: string;
  number: number;
  postSlug: string;
}

interface Proof {
  anchorId: string;
  description?: string;
  content: string;
  number: number;
  postSlug: string;
}

async function getPostSummaryData(slug: string): Promise<{
  post: { id: string; title: string; slug: string } | null;
  definitions: Definition[];
  equations: Equation[];
  theorems: Theorem[];
  proofs: Proof[];
}> {
  try {
    // Obtener post por slug (solo publicado)
    const { prisma } = await import('@/lib/prisma');
    
    const post = await prisma.post.findFirst({
      where: {
        slug: slug,
        published: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    if (!post) {
      return {
        post: null,
        definitions: [],
        equations: [],
        theorems: [],
        proofs: [],
      };
    }

    // Obtener definiciones, ecuaciones, teoremas y demostraciones en paralelo
    const [definitions, equations, theorems, proofs] = await Promise.all([
      prisma.definition.findMany({
        where: { postId: post.id },
        select: {
          anchorId: true,
          description: true,
          content: true,
          number: true,
        },
        orderBy: { number: 'asc' },
      }),
      prisma.equation.findMany({
        where: { postId: post.id },
        select: {
          anchorId: true,
          description: true,
          equation: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.theorem.findMany({
        where: { postId: post.id },
        select: {
          anchorId: true,
          description: true,
          content: true,
          number: true,
        },
        orderBy: { number: 'asc' },
      }),
      prisma.proof.findMany({
        where: { postId: post.id },
        select: {
          anchorId: true,
          description: true,
          content: true,
          number: true,
        },
        orderBy: { number: 'asc' },
      }),
    ]);

    // Mapear ecuaciones con números basados en el orden
    const equationsWithNumbers = equations.map((eq, index) => ({
      anchorId: eq.anchorId,
      description: eq.description || undefined,
      equation: eq.equation,
      number: index + 1,
      postSlug: post.slug,
    }));

    // Mapear definiciones y teoremas
    const definitionsMapped: Definition[] = definitions.map((def) => ({
      anchorId: def.anchorId,
      description: def.description || undefined,
      content: def.content,
      number: def.number,
      postSlug: post.slug,
    }));

    const theoremsMapped: Theorem[] = theorems.map((thm) => ({
      anchorId: thm.anchorId,
      description: thm.description || undefined,
      content: thm.content,
      number: thm.number,
      postSlug: post.slug,
    }));

    const proofsMapped: Proof[] = proofs.map((prf) => ({
      anchorId: prf.anchorId,
      description: prf.description || undefined,
      content: prf.content,
      number: prf.number,
      postSlug: post.slug,
    }));

    return {
      post,
      definitions: definitionsMapped,
      equations: equationsWithNumbers,
      theorems: theoremsMapped,
      proofs: proofsMapped,
    };
  } catch (error) {
    console.error('Error fetching post summary data:', error);
    return {
      post: null,
      definitions: [],
      equations: [],
      theorems: [],
      proofs: [],
    };
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function PostSummaryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { post, definitions, equations, theorems, proofs } = await getPostSummaryData(slug);

  // Si el post no existe o no está publicado, mostrar 404
  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Contenedor de contenido */}
        <div className="flex-1 min-w-0">
          <article>
            {/* Botón de volver */}
            <div className="mb-8">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-text-secondary transition-colors hover:text-star-cyan"
              >
                <span>←</span>
                <span>Volver al blog</span>
              </Link>
            </div>

            {/* Header del resumen */}
            <header className="mb-8 space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold text-text-primary sm:text-5xl lg:text-6xl">
                  Resumen: {post.title}
                </h1>
              </div>

              <p className="text-lg text-text-secondary">
                Definiciones, fórmulas, teoremas y demostraciones del post
              </p>

              {/* Enlace al post completo */}
              <div className="pt-4">
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors hover:border-star-cyan hover:text-star-cyan"
                  style={{ borderColor: 'var(--border-glow)' }}
                >
                  Ver post completo →
                </Link>
              </div>
            </header>

            {/* Separador */}
            <div
              className="mb-8 h-px"
              style={{ backgroundColor: 'var(--border-glow)' }}
            />

            {/* Selector de tamaño de fuente */}
            <div className="mb-6 flex justify-end">
              <FontSizeSelector />
            </div>

            {/* Contenido del resumen */}
            <div
              data-blog-content
              className="rounded-lg border p-8"
              style={{
                borderColor: 'var(--border-glow)',
                backgroundColor: 'rgba(26, 26, 46, 0.3)',
              }}
            >
              <PostSummaryView
                definitions={definitions}
                equations={equations}
                theorems={theorems}
                proofs={proofs}
                postSlug={post.slug}
              />
            </div>

            {/* Footer */}
            <footer className="mt-12 pt-8">
              <div
                className="h-px mb-8"
                style={{ backgroundColor: 'var(--border-glow)' }}
              />
              
              <div className="flex flex-col items-center gap-4 text-center text-text-muted">
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors hover:border-star-cyan hover:text-star-cyan"
                  style={{ borderColor: 'var(--border-glow)' }}
                >
                  ← Ver post completo
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors hover:border-star-cyan hover:text-star-cyan"
                  style={{ borderColor: 'var(--border-glow)' }}
                >
                  ← Volver al blog
                </Link>
              </div>
            </footer>
          </article>
        </div>

        {/* Barra lateral */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="sticky top-4">
            <div className="bg-surface-secondary rounded-lg border border-border-primary p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Resumen del post
              </h3>
              <div className="space-y-2 text-sm text-text-secondary">
                {definitions.length > 0 && (
                  <div>
                    <span className="text-star-cyan">{definitions.length}</span> definiciones
                  </div>
                )}
                {equations.length > 0 && (
                  <div>
                    <span className="text-nebula-purple">{equations.length}</span> fórmulas
                  </div>
                )}
                {theorems.length > 0 && (
                  <div>
                    <span className="text-green-500">{theorems.length}</span> teoremas
                  </div>
                )}
                {proofs.length > 0 && (
                  <div>
                    <span className="text-yellow-500">{proofs.length}</span> demostraciones
                  </div>
                )}
                {definitions.length === 0 && equations.length === 0 && theorems.length === 0 && proofs.length === 0 && (
                  <div className="text-text-muted italic">
                    No hay contenido para mostrar
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

