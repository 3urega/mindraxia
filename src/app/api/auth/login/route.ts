import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { createSession } from '@/lib/session';

/**
 * POST /api/auth/login
 * Autentica un usuario y crea una sesión
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validar que email y password estén presentes
    if (!email || !password) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Verificar credenciales (no exponer si el email existe o no)
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    // Crear sesión
    await createSession(user.id);

    // Retornar usuario (sin password)
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in login:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to login',
      },
      { status: 500 }
    );
  }
}

