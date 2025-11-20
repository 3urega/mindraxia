import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'mindraxia_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días en segundos

/**
 * Crea una cookie de sesión con el ID del usuario
 * @param userId - ID del usuario
 */
export async function createSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * Obtiene el ID del usuario desde la cookie de sesión
 * @returns ID del usuario o null si no hay sesión
 */
export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session?.value || null;
}

/**
 * Elimina la cookie de sesión (logout)
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

