import { notFound } from 'next/navigation';
import Link from 'next/link';
import RouteViewer from '@/components/RouteViewer';
import RouteSidebar from '@/components/RouteSidebar';
import { getCurrentUser } from '@/lib/get-session';

interface RouteItem {
  id: string;
  postId: string;
  order: number;
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
  };
}

interface Route {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  author: {
    id: string;
    name: string;
  };
  items: RouteItem[];
  progress?: Array<{ postId: string; readAt: string }>;
}

async function getRoute(slug: string): Promise<Route | null> {
  try {
    const { prisma } = await import('@/lib/prisma');
    const { getCurrentUser } = await import('@/lib/get-session');
    
    const route = await prisma.postRoute.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          orderBy: {
            order: 'asc',
          },
          include: {
            post: {
              select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                published: true,
              },
            },
          },
        },
      },
    });

    if (!route) {
      return null;
    }

    // Obtener progreso del usuario si está autenticado
    const user = await getCurrentUser();
    let progress: Array<{ postId: string; readAt: string }> = [];
    if (user) {
      const userProgress = await prisma.postRouteProgress.findMany({
        where: {
          userId: user.id,
          routeId: route.id,
        },
        select: {
          postId: true,
          readAt: true,
        },
      });
      progress = userProgress.map((p) => ({
        postId: p.postId,
        readAt: p.readAt.toISOString(),
      }));
    }

    // Filtrar solo posts publicados
    const publishedItems = route.items.filter((item) => item.post.published);

    return {
      id: route.id,
      name: route.name,
      slug: route.slug,
      description: route.description,
      category: route.category,
      author: route.author,
      items: publishedItems.map((item) => ({
        id: item.id,
        postId: item.post.id,
        order: item.order,
        post: {
          id: item.post.id,
          title: item.post.title,
          slug: item.post.slug,
          excerpt: item.post.excerpt,
        },
      })),
      progress: progress,
    };
  } catch (error) {
    console.error('Error fetching route:', error);
    return null;
  }
}

export default async function RoutePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const route = await getRoute(slug);

  if (!route) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Columna principal */}
        <div className="flex-1 min-w-0">
          {/* Botón de volver */}
          <div className="mb-8">
            <Link
              href="/routes"
              className="inline-flex items-center gap-2 text-text-secondary transition-colors hover:text-star-cyan"
            >
              <span>←</span>
              <span>Volver a rutas</span>
            </Link>
          </div>

          {/* Header de la ruta */}
          <header className="mb-8 space-y-4">
            <h1 className="text-4xl font-bold text-text-primary sm:text-5xl">
              {route.name}
            </h1>

            {route.description && (
              <p className="text-lg text-text-secondary">{route.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
              <Link
                href={`/blog?category=${route.category.slug}`}
                className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-star-cyan/10"
                style={{
                  borderColor: 'var(--border-glow)',
                  color: 'var(--star-cyan)',
                }}
              >
                {route.category.name}
              </Link>
              <span>
                Por <span className="text-text-secondary">{route.author.name}</span>
              </span>
              <span>
                {route.items.length} {route.items.length === 1 ? 'post' : 'posts'}
              </span>
            </div>
          </header>

          {/* Separador */}
          <div
            className="mb-8 h-px"
            style={{ backgroundColor: 'var(--border-glow)' }}
          />

          {/* Lista de posts */}
          <RouteViewer
            routeId={route.id}
            items={route.items}
            progress={route.progress || []}
          />
        </div>

        {/* Sidebar */}
        <RouteSidebar
          routeId={route.id}
          routeName={route.name}
          items={route.items}
          progress={route.progress || []}
        />
      </div>
    </div>
  );
}
