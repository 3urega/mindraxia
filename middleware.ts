import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'mindraxia_session';

/**
 * Middleware para proteger rutas /admin/*
 * Redirige a /admin/login si no hay sesión válida
 */
export function middleware(request: NextRequest) {
  // Permitir acceso a /admin/login sin autenticación
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Verificar si hay cookie de sesión directamente del request
  const session = request.cookies.get(SESSION_COOKIE_NAME);

  // Si no hay sesión, redirigir a login
  if (!session || !session.value) {
    const loginUrl = new URL('/admin/login', request.url);
    // Agregar parámetro para redirigir después del login
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si hay sesión, permitir acceso
  return NextResponse.next();
}

// Configurar matcher para aplicar middleware solo a rutas /admin/*
export const config = {
  matcher: '/admin/:path*',
};

