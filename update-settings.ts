import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateSettings() {
  try {
    // Update all settings to disable autoSyncOnStartup
    const result = await prisma.setting.updateMany({
      data: {
        autoSyncOnStartup: false,
      },
    });

    console.log(`✅ Updated ${result.count} settings - autoSyncOnStartup set to false`);
    console.log('✅ Auto-sync on startup is now disabled');
    console.log('✅ Sync will only run when POST request is sent to /sipuni-integration');
  } catch (error) {
    console.error('❌ Error updating settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSettings();
