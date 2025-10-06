import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function initialSync() {
  console.log('\n=== Sipuni Initial Sync - Oy boshidan bugungi kungacha ===\n');

  try {
    // Get current date
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed (oktyabr = 9)

    // Start from 1st of current month
    const startDate = new Date(year, month, 1);
    const endDate = new Date();

    console.log('📅 Sync davri:');
    console.log(`   Boshlanishi: ${startDate.toLocaleDateString('uz-UZ')}`);
    console.log(`   Tugashi: ${endDate.toLocaleDateString('uz-UZ')}`);
    console.log('');

    // Calculate total days
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    console.log(`📊 Jami kunlar: ${totalDays}\n`);

    // Call sync endpoint with high limit (enough for whole month)
    const limit = totalDays * 200; // ~200 calls per day estimate
    console.log(`🔄 Sync boshlanmoqda (limit: ${limit})...\n`);

    const response = await axios.post(
      `http://localhost:3000/sipuni/sync-and-process?limit=${limit}`,
      {},
      { timeout: 3600000 } // 1 hour timeout
    );

    console.log('\n✅ Sync tugadi!\n');
    console.log('📈 Natijalar:');
    console.log(JSON.stringify(response.data, null, 2));

    // Check database statistics
    const totalCalls = await prisma.call.count({
      where: {
        externalId: {
          startsWith: '175' // Sipuni calls
        }
      }
    });

    const byStatus = await prisma.call.groupBy({
      by: ['status'],
      where: {
        externalId: {
          startsWith: '175'
        }
      },
      _count: true
    });

    console.log('\n📊 Database Statistikasi:');
    console.log(`   Jami Sipuni qo'ng'iroqlari: ${totalCalls}`);
    console.log('\n   Status bo\'yicha:');
    byStatus.forEach(s => {
      console.log(`      ${s.status}: ${s._count} ta`);
    });

  } catch (error) {
    console.error('\n❌ Xato:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

initialSync();
