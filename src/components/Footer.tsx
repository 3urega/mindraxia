export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t py-8 bg-space-primary/50"
      style={{
        borderColor: 'var(--border-glow)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-lg font-semibold text-star-cyan">
            Mindraxia
          </p>
          <p className="text-sm text-text-secondary">
            La Galaxia del Conocimiento
          </p>
          <p className="text-xs text-text-muted">
            © {currentYear} Mindraxia. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

