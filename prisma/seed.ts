import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Datos del usuario inicial
  const email = 'mindraxia@mindraxia.com'; // Email para login
  const name = 'Mindraxia';
  const password = '123qweASD';

  // Hashear contraseña
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('⚠️  El usuario ya existe. Actualizando contraseña...');
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        name,
      },
    });
    console.log('✅ Usuario actualizado exitosamente');
  } else {
    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
    console.log('✅ Usuario creado exitosamente:', {
      id: user.id,
      email: user.email,
      name: user.name,
    });
  }

  console.log('🎉 Seed completado!');
  console.log('\n📝 Credenciales de acceso:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

