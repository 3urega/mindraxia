export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-text-primary sm:text-5xl lg:text-6xl">
          Contacto
        </h1>
        <p className="mt-4 text-lg text-text-secondary">
          ¿Tienes alguna pregunta o sugerencia? Escríbenos
        </p>
      </div>

      {/* Formulario de Contacto */}
      <div className="space-y-8">
        <form
          className="space-y-6 rounded-lg border p-8"
          style={{
            borderColor: 'var(--border-glow)',
            backgroundColor: 'rgba(26, 26, 46, 0.5)',
          }}
        >
          {/* Campo Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-2 w-full rounded-lg border bg-space-secondary px-4 py-2 text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none"
              style={{
                borderColor: 'var(--border-glow)',
              }}
              placeholder="Tu nombre"
            />
          </div>

          {/* Campo Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-2 w-full rounded-lg border bg-space-secondary px-4 py-2 text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none"
              style={{
                borderColor: 'var(--border-glow)',
              }}
              placeholder="tu@email.com"
            />
          </div>

          {/* Campo Mensaje */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-text-primary">
              Mensaje
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              required
              className="mt-2 w-full rounded-lg border bg-space-secondary px-4 py-2 text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none"
              style={{
                borderColor: 'var(--border-glow)',
              }}
              placeholder="Tu mensaje aquí..."
            />
          </div>

          {/* Botón de Envío */}
          <button
            type="submit"
            className="glow-cyan w-full rounded-full border px-6 py-3 font-semibold text-star-cyan transition-all hover:bg-star-cyan/10 sm:w-auto"
            style={{
              borderColor: 'var(--border-glow)',
            }}
          >
            Enviar Mensaje
          </button>
        </form>

        {/* Información de Contacto Adicional */}
        <div className="rounded-lg border p-8 text-center"
             style={{
               borderColor: 'var(--border-glow)',
               backgroundColor: 'rgba(26, 26, 46, 0.5)',
             }}>
          <h2 className="text-2xl font-semibold text-text-primary">
            Otras Formas de Contacto
          </h2>
          <p className="mt-4 text-text-secondary">
            Próximamente agregaremos más información de contacto y redes sociales.
          </p>
        </div>
      </div>
    </div>
  );
}

