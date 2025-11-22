import PostCard from "@/components/PostCard";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  createdAt: string;
  publishedAt: string | null;
  tags: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  subcategories: Array<{ id: string; name: string; slug: string; category: { id: string; name: string; slug: string } }>;
  author: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface PostsResponse {
  posts: Post[];
  count: number;
}

async function getPosts(categorySlug?: string, subcategorySlug?: string): Promise<Post[]> {
  try {
    // Llamar directamente a Prisma en lugar de usar fetch para evitar problemas de caché
    const { prisma } = await import('@/lib/prisma');
    
    // Construir filtros
    const where: any = {
      published: true,
    };

    if (categorySlug) {
      where.categories = {
        some: {
          slug: categorySlug,
        },
      };
    }

    if (subcategorySlug) {
      where.subcategories = {
        some: {
          slug: subcategorySlug,
        },
      };
    }
    
    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          publishedAt: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });

    // Mapear a formato esperado
    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString() ?? null,
      tags: post.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
      })),
      categories: post.categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      })),
      subcategories: post.subcategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        category: {
          id: sub.category.id,
          name: sub.category.name,
          slug: sub.category.slug,
        },
      })),
      author: {
        id: post.author.id,
        name: post.author.name,
      },
    }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    // Retornar array vacío en caso de error para no romper la página
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const { prisma } = await import('@/lib/prisma');
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; subcategory?: string }>;
}) {
  const params = await searchParams;
  const categorySlug = params?.category;
  const subcategorySlug = params?.subcategory;

  // Obtener posts y categorías
  const [posts, categories] = await Promise.all([
    getPosts(categorySlug, subcategorySlug),
    getCategories(),
  ]);

  // Mapear posts de la API al formato de PostCard
  const mappedPosts = posts.map((post) => ({
    title: post.title,
    excerpt: post.excerpt || undefined,
    date: post.publishedAt || post.createdAt,
    tags: post.tags.map((tag) => tag.name),
    categories: post.categories,
    subcategories: post.subcategories,
    slug: post.slug,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de filtros */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-8">
            <div className="rounded-lg border p-6" style={{ borderColor: 'var(--border-glow)', backgroundColor: 'rgba(26, 26, 46, 0.3)' }}>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Filtros</h2>
              
              {/* Botón para limpiar filtros */}
              {(categorySlug || subcategorySlug) && (
                <Link
                  href="/blog"
                  className="block mb-4 px-4 py-2 rounded-lg border text-sm text-text-secondary hover:bg-space-secondary transition-colors text-center"
                  style={{ borderColor: 'var(--border-glow)' }}
                >
                  Limpiar filtros
                </Link>
              )}

              {/* Lista de categorías */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-text-secondary">Categorías</h3>
                {categories.length === 0 ? (
                  <p className="text-xs text-text-muted">No hay categorías disponibles</p>
                ) : (
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <div key={category.id}>
                        <Link
                          href={`/blog?category=${category.slug}`}
                          className={`block px-3 py-2 rounded text-sm transition-colors ${
                            categorySlug === category.slug
                              ? 'bg-star-cyan/20 text-star-cyan'
                              : 'text-text-secondary hover:text-text-primary hover:bg-space-secondary'
                          }`}
                        >
                          {category.name}
                          {category.subcategories.length > 0 && (
                            <span className="ml-2 text-xs text-text-muted">
                              ({category.subcategories.length})
                            </span>
                          )}
                        </Link>
                        {/* Subcategorías */}
                        {category.subcategories.length > 0 && (
                          <div className="pl-4 mt-1 space-y-1">
                            {category.subcategories.map((subcategory) => (
                              <Link
                                key={subcategory.id}
                                href={`/blog?subcategory=${subcategory.slug}`}
                                className={`block px-2 py-1 rounded text-xs transition-colors ${
                                  subcategorySlug === subcategory.slug
                                    ? 'bg-nebula-purple/20 text-nebula-purple'
                                    : 'text-text-muted hover:text-text-secondary hover:bg-space-secondary'
                                }`}
                              >
                                {subcategory.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <div className="flex-1">
          {/* Header de la página */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-text-primary sm:text-5xl lg:text-6xl">
              Blog
            </h1>
            <p className="mt-4 text-lg text-text-secondary">
              {categorySlug || subcategorySlug
                ? `Filtrado por: ${categorySlug || subcategorySlug}`
                : 'Explora los artículos y descubre conocimiento nuevo'}
            </p>
          </div>

          {/* Grid de Posts */}
          {mappedPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
              {mappedPosts.map((post) => (
                <PostCard
                  key={post.slug}
                  title={post.title}
                  excerpt={post.excerpt}
                  date={post.date}
                  tags={post.tags}
                  categories={post.categories}
                  subcategories={post.subcategories}
                  slug={post.slug}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-xl text-text-secondary">
                No hay posts disponibles {categorySlug || subcategorySlug ? 'con estos filtros' : 'aún'}.
              </p>
              <p className="mt-2 text-text-muted">
                {categorySlug || subcategorySlug ? (
                  <Link href="/blog" className="text-star-cyan hover:underline">
                    Ver todos los posts
                  </Link>
                ) : (
                  'Vuelve pronto para ver nuevos artículos.'
                )}
              </p>
            </div>
          )}

          {/* Sección de información adicional */}
          <div className="mt-16 rounded-lg border p-8 text-center"
               style={{
                 borderColor: 'var(--border-glow)',
                 backgroundColor: 'rgba(26, 26, 46, 0.5)',
               }}>
            <h2 className="text-2xl font-semibold text-star-cyan">
              ¿Quieres contribuir?
            </h2>
            <p className="mt-4 text-text-secondary">
              Si tienes ideas para artículos o quieres colaborar, contáctanos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
