import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSyncScheduleFields() {
  try {
    console.log('🔧 Adding sync schedule fields to settings table...\n');

    // Add syncSchedule column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE settings
      ADD COLUMN IF NOT EXISTS "syncSchedule" VARCHAR(50) DEFAULT '50 23 * * *'
    `);
    console.log('✓ Added syncSchedule column (default: 23:50 daily)');

    // Add autoSyncOnStartup column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE settings
      ADD COLUMN IF NOT EXISTS "autoSyncOnStartup" BOOLEAN DEFAULT true
    `);
    console.log('✓ Added autoSyncOnStartup column (default: true)');

    // Update existing records to have default values
    await prisma.$executeRawUnsafe(`
      UPDATE settings
      SET "syncSchedule" = '50 23 * * *'
      WHERE "syncSchedule" IS NULL
    `);

    await prisma.$executeRawUnsafe(`
      UPDATE settings
      SET "autoSyncOnStartup" = true
      WHERE "autoSyncOnStartup" IS NULL
    `);

    console.log('\n✅ Migration completed successfully!');
    console.log('\nDefault settings:');
    console.log('  - Sync Schedule: 23:50 (every day at 23:50)');
    console.log('  - Auto Sync on Startup: true');
    console.log('\n💡 Companies can now customize:');
    console.log('  - syncSchedule: "0 22 * * *" for 22:00 daily');
    console.log('  - autoSyncOnStartup: false to disable startup sync\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addSyncScheduleFields();
