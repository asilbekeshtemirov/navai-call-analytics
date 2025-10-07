import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSettingsTable() {
  try {
    console.log('Adding createdAt column to settings table...');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE settings
      ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    `);

    console.log('✓ Column added successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixSettingsTable();
