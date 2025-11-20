-- Script SQL para crear las tablas en Prisma Data Platform
-- Ejecuta este script en el editor SQL de tu dashboard de Prisma

-- Tabla Users
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Tabla Posts
CREATE TABLE IF NOT EXISTS "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Post_slug_key" ON "Post"("slug");
CREATE INDEX IF NOT EXISTS "Post_slug_idx" ON "Post"("slug");
CREATE INDEX IF NOT EXISTS "Post_published_idx" ON "Post"("published");

ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" 
    FOREIGN KEY ("authorId") REFERENCES "User"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Tabla Tags
CREATE TABLE IF NOT EXISTS "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Tag_name_key" ON "Tag"("name");

-- Tabla de relación Post-Tag (many-to-many implícita de Prisma)
CREATE TABLE IF NOT EXISTS "_PostToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "_PostToTag_AB_unique" ON "_PostToTag"("A", "B");
CREATE INDEX IF NOT EXISTS "_PostToTag_B_index" ON "_PostToTag"("B");

ALTER TABLE "_PostToTag" ADD CONSTRAINT "_PostToTag_A_fkey" 
    FOREIGN KEY ("A") REFERENCES "Post"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;
    
ALTER TABLE "_PostToTag" ADD CONSTRAINT "_PostToTag_B_fkey" 
    FOREIGN KEY ("B") REFERENCES "Tag"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;

