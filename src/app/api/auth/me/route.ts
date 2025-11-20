import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/get-session';

/**
 * GET /api/auth/me
 * Obtiene el usuario actual desde la sesión
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          user: null,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to get current user',
      },
      { status: 500 }
    );
  }
}

