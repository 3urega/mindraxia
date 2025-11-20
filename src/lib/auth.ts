import bcrypt from 'bcryptjs';

/**
 * Hashea una contraseña usando bcrypt
 * @param password - Contraseña en texto plano
 * @returns Hash de la contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verifica una contraseña contra un hash
 * @param password - Contraseña en texto plano
 * @param hash - Hash almacenado
 * @returns true si la contraseña coincide, false en caso contrario
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

