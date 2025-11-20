import PostCard from "@/components/PostCard";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  createdAt: string;
  publishedAt: string | null;
  tags: Array<{ id: string; name: string }>;
  author: { id: string; name: string };
}

interface PostsResponse {
  posts: Post[];
  count: number;
}

async function getPosts(): Promise<Post[]> {
  try {
    // Usar URL relativa - Next.js maneja esto correctamente en Server Components
    // Construir URL absoluta si estamos en producción para evitar problemas
    const baseUrl = 
      process.env.NODE_ENV === 'production' 
        ? (process.env.NEXT_PUBLIC_URL || 'https://mindraxia.com')
        : 'http://localhost:3000';
    
    const url = `${baseUrl}/api/posts`;

    const response = await fetch(url, {
      next: { revalidate: 60 }, // ISR: revalidar cada 60 segundos
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    const data: PostsResponse = await response.json();
    return data.posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    // Retornar array vacío en caso de error para no romper la página
    return [];
  }
}

export default async function BlogPage() {
  // Obtener posts de la API
  const posts = await getPosts();

  // Mapear posts de la API al formato de PostCard
  const mappedPosts = posts.map((post) => ({
    title: post.title,
    excerpt: post.excerpt || undefined,
    date: post.publishedAt || post.createdAt,
    tags: post.tags.map((tag) => tag.name),
    slug: post.slug,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header de la página */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-text-primary sm:text-5xl lg:text-6xl">
          Blog
        </h1>
        <p className="mt-4 text-lg text-text-secondary">
          Explora los artículos y descubre conocimiento nuevo
        </p>
      </div>

      {/* Grid de Posts */}
      {mappedPosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {mappedPosts.map((post) => (
            <PostCard
              key={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              date={post.date}
              tags={post.tags}
              slug={post.slug}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-xl text-text-secondary">
            No hay posts disponibles aún.
          </p>
          <p className="mt-2 text-text-muted">
            Vuelve pronto para ver nuevos artículos.
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
  );
}

