import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session';

/**
 * POST /api/auth/logout
 * Elimina la sesión del usuario
 */
export async function POST() {
  try {
    await deleteSession();

    return NextResponse.json(
      {
        message: 'Logged out successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in logout:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to logout',
      },
      { status: 500 }
    );
  }
}

