import Link from "next/link";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-sm bg-space-primary/80"
      style={{
        borderColor: 'var(--border-glow)',
      }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-star-cyan transition-opacity hover:opacity-80"
        >
          Mindraxia
        </Link>

        {/* Navigation Links */}
        <ul className="flex items-center gap-6">
          <li>
            <Link href="/" className="text-text-secondary transition-colors hover:text-star-cyan">
              Inicio
            </Link>
          </li>
          <li>
            <Link href="/blog" className="text-text-secondary transition-colors hover:text-star-cyan">
              Blog
            </Link>
          </li>
          <li>
            <Link href="/about" className="text-text-secondary transition-colors hover:text-star-cyan">
              Sobre
            </Link>
          </li>
          <li>
            <Link href="/contact" className="text-text-secondary transition-colors hover:text-star-cyan">
              Contacto
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

