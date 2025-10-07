import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSuperadminRole() {
  try {
    console.log('Checking if SUPERADMIN role exists...');

    // Check if SUPERADMIN already exists
    const result = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'SUPERADMIN'
        AND enumtypid = 'public."UserRole"'::regtype
      ) as exists
    `);

    if (result[0].exists) {
      console.log('✓ SUPERADMIN role already exists');
      return;
    }

    console.log('Adding SUPERADMIN role to database...');

    // Add the new enum value
    await prisma.$executeRawUnsafe(`
      ALTER TYPE "UserRole" ADD VALUE 'SUPERADMIN'
    `);

    console.log('✓ SUPERADMIN role added successfully!');
    console.log('\n⚠️  Please restart the application for changes to take effect.');
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log('✓ SUPERADMIN role already exists');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

addSuperadminRole();
