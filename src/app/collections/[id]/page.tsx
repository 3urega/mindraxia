import { notFound } from 'next/navigation';
import CollectionViewer from '@/components/CollectionViewer';
import { getCurrentUser } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';

async function getCollection(id: string, userId?: string) {
  try {
    const collection = await prisma.postCollection.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
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
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!collection) {
      return null;
    }

    // Verificar permisos de visibilidad
    if (!collection.isPublic && (!userId || userId !== collection.authorId)) {
      return null;
    }

    return collection;
  } catch (error) {
    console.error('Error fetching collection:', error);
    return null;
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const collection = await getCollection(id, user?.id);

  if (!collection) {
    notFound();
  }

  const isAuthor = user?.id === collection.authorId;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <CollectionViewer
        collection={{
          id: collection.id,
          title: collection.title,
          description: collection.description,
          isPublic: collection.isPublic,
          author: collection.author,
          items: collection.items,
          createdAt: collection.createdAt.toISOString(),
          updatedAt: collection.updatedAt.toISOString(),
        }}
        isAuthor={isAuthor}
      />
    </div>
  );
}


