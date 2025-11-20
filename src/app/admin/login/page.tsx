'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error al iniciar sesión');
        setLoading(false);
        return;
      }

      // Login exitoso, redirigir
      router.push(redirect);
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      setError('Error de conexión. Por favor intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-star-cyan via-nebula-purple to-star-gold">
            Mindraxia
          </h1>
          <h2 className="mt-6 text-3xl font-bold text-text-primary">
            Panel de Administración
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Inicia sesión para acceder al panel
          </p>
        </div>

        {/* Formulario */}
        <form
          className="mt-8 space-y-6 rounded-lg border p-8"
          style={{
            borderColor: 'var(--border-glow)',
            backgroundColor: 'rgba(26, 26, 46, 0.5)',
          }}
          onSubmit={handleSubmit}
        >
          {error && (
            <div
              className="rounded-lg border p-4 text-sm"
              style={{
                borderColor: 'rgba(239, 68, 68, 0.5)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#fca5a5',
              }}
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border bg-space-primary px-4 py-3 text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20"
                style={{
                  borderColor: 'var(--border-glow)',
                }}
                placeholder="tu@email.com"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border bg-space-primary px-4 py-3 text-text-primary placeholder-text-muted focus:border-star-cyan focus:outline-none focus:ring-2 focus:ring-star-cyan/20"
                style={{
                  borderColor: 'var(--border-glow)',
                }}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>

          {/* Botón Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-star-cyan px-4 py-3 font-medium text-space-dark transition-all hover:bg-star-cyan/90 focus:outline-none focus:ring-2 focus:ring-star-cyan/50 disabled:opacity-50 disabled:cursor-not-allowed glow-cyan"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>

          {/* Link a página principal */}
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-text-muted transition-colors hover:text-star-cyan"
            >
              ← Volver al inicio
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

