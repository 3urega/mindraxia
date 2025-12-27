import { notFound } from 'next/navigation';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ScrollToAnchor from '@/components/ScrollToAnchor';
import FontSizeSelector from '@/components/FontSizeSelector';
import SocialShareButtons from '@/components/SocialShareButtons';
import AssociatedPostsList from '@/components/AssociatedPostsList';
import RelatedPostsSidebar from '@/components/RelatedPostsSidebar';
import PostRouteInfo from '@/components/PostRouteInfo';
import PostRouteSidebar from '@/components/PostRouteSidebar';

interface AssociatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  createdAt: string;
  publishedAt: string | null;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  author: {
    id: string;
    name: string;
    email: string;
  };
  tags: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  subcategories: Array<{ id: string; name: string; slug: string; category: { id: string; name: string; slug: string } }>;
  associatedPosts?: AssociatedPost[];
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    // Llamar directamente a Prisma en lugar de usar fetch para evitar problemas de caché
    const { prisma } = await import('@/lib/prisma');
    
    const post = await prisma.post.findFirst({
      where: {
        slug: slug,
        published: true,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
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
        associatedPosts: {
          where: {
            published: true,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            createdAt: true,
            publishedAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        relatedPostsA: {
          include: {
            postA: {
              select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                published: true,
              },
            },
            postB: {
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
        relatedPostsB: {
          include: {
            postA: {
              select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                published: true,
              },
            },
            postB: {
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

    if (!post) {
      return null;
    }

    // Mapear a formato esperado
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString() ?? null,
      author: {
        id: post.author.id,
        name: post.author.name,
        email: post.author.email,
      },
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
      associatedPosts: post.associatedPosts.map((ap) => ({
        id: ap.id,
        title: ap.title,
        slug: ap.slug,
        excerpt: ap.excerpt,
        published: true,
        createdAt: ap.createdAt.toISOString(),
        publishedAt: ap.publishedAt?.toISOString() ?? null,
      })),
      relatedPosts: [
        ...post.relatedPostsA.map((rel) => {
          const relatedPost = rel.postAId === post.id ? rel.postB : rel.postA;
          return relatedPost.published ? {
            id: relatedPost.id,
            title: relatedPost.title,
            slug: relatedPost.slug,
            excerpt: relatedPost.excerpt,
          } : null;
        }).filter(Boolean),
        ...post.relatedPostsB.map((rel) => {
          const relatedPost = rel.postAId === post.id ? rel.postB : rel.postA;
          return relatedPost.published ? {
            id: relatedPost.id,
            title: relatedPost.title,
            slug: relatedPost.slug,
            excerpt: relatedPost.excerpt,
          } : null;
        }).filter(Boolean),
      ].filter((post, index, self) => 
        index === self.findIndex((p) => p.id === post.id)
      ) as Array<{ id: string; title: string; slug: string; excerpt: string | null }>,
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
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

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  // Si el post no existe o no está publicado, mostrar 404
  if (!post) {
    notFound();
  }

  const displayDate = post.publishedAt || post.createdAt;

  return (
    <div className="mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Contenedor de contenido */}
        <div className="flex-1 min-w-0">
          <article>
            {/* Scroll automático a anchor si hay hash en URL */}
            <ScrollToAnchor />
            
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

            {/* Header del post */}
            <header className="mb-8 space-y-4">
              <h1 className="text-4xl font-bold text-text-primary sm:text-5xl lg:text-6xl">
                {post.title}
              </h1>

              {/* Metadatos */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                {displayDate && (
                  <time dateTime={displayDate} className="flex items-center gap-2">
                    <span>{formatDate(displayDate)}</span>
                  </time>
                )}
                {post.author && (
                  <span className="flex items-center gap-2">
                    <span>Por</span>
                    <span className="text-text-secondary">{post.author.name}</span>
                  </span>
                )}
              </div>

              {/* Categorías y Subcategorías */}
              {(post.categories.length > 0 || post.subcategories.length > 0) && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {post.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/blog?category=${category.slug}`}
                      className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-star-cyan/10"
                      style={{
                        borderColor: 'var(--border-glow)',
                        color: 'var(--star-cyan)',
                      }}
                    >
                      {category.name}
                    </Link>
                  ))}
                  {post.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory.id}
                      href={`/blog?subcategory=${subcategory.slug}`}
                      className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-star-cyan/10"
                      style={{
                        borderColor: 'var(--border-glow)',
                        color: 'var(--nebula-purple)',
                      }}
                    >
                      {subcategory.category.name} &gt; {subcategory.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full border px-3 py-1 text-xs"
                      style={{
                        borderColor: 'var(--border-glow)',
                        color: 'var(--star-cyan)',
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Excerpt (si existe) */}
              {post.excerpt && (
                <p className="text-lg text-text-secondary italic">{post.excerpt}</p>
              )}
            </header>

            {/* Separador */}
            <div
              className="mb-8 h-px"
              style={{ backgroundColor: 'var(--border-glow)' }}
            />

            {/* Información de rutas (si el post está en alguna) */}
            <PostRouteInfo postId={post.id} currentPostSlug={post.slug} />

            {/* Selector de tamaño de fuente y compartir */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <SocialShareButtons 
                title={post.title} 
                url={`/blog/${post.slug}`}
                description={post.excerpt || undefined}
                author={post.author?.name}
                date={displayDate ? formatDate(displayDate) : undefined}
              />
              <FontSizeSelector />
            </div>

            {/* Contenido del post */}
            <div
              data-blog-content
              className="rounded-lg border p-8"
              style={{
                borderColor: 'var(--border-glow)',
                backgroundColor: 'rgba(26, 26, 46, 0.3)',
              }}
            >
              <MarkdownRenderer content={post.content} currentSlug={post.slug} />
            </div>

            {/* Posts Asociados */}
            {post.associatedPosts && post.associatedPosts.length > 0 && (
              <AssociatedPostsList
                posts={post.associatedPosts}
                showAdminActions={false}
              />
            )}

            {/* Footer del post con rutas y relacionados */}
            <footer className="mt-12 pt-8">
              <div
                className="h-px mb-8"
                style={{ backgroundColor: 'var(--border-glow)' }}
              />
              
              {/* Sección de rutas y posts relacionados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <PostRouteSidebar postId={post.id} currentPostSlug={post.slug} />
                {post.relatedPosts && post.relatedPosts.length > 0 && (
                  <RelatedPostsSidebar relatedPosts={post.relatedPosts} />
                )}
              </div>

              {/* Información de publicación */}
              <div className="flex flex-col items-center gap-4 text-center text-text-muted">
                <p className="text-sm">
                  Publicado el {formatDate(post.publishedAt || post.createdAt)}
                </p>
                {post.updatedAt !== post.createdAt && (
                  <p className="text-xs">
                    Última actualización: {formatDate(post.updatedAt)}
                  </p>
                )}
                <Link
                  href="/blog"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors hover:border-star-cyan hover:text-star-cyan"
                  style={{ borderColor: 'var(--border-glow)' }}
                >
                  ← Volver al blog
                </Link>
              </div>
            </footer>
          </article>
        </div>

        {/* Barra lateral para anuncios */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="sticky top-4">
            {/* Espacio reservado para anuncios */}
            <div className="bg-surface-secondary rounded-lg border border-border-primary p-6 min-h-[200px] flex items-center justify-center">
              <p className="text-text-muted text-sm italic">Espacio para anuncios</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

