import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCallDates() {
  console.log('=== Checking Call table dates ===\n');

  // Get today's date info
  const today = new Date();
  console.log('Today (server time):', today.toISOString());
  console.log('Today (local):', today.toLocaleString());

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  console.log('\nStart of today:', startOfDay.toISOString());
  console.log('End of today:', endOfDay.toISOString());

  // Count all calls
  const totalCalls = await prisma.call.count();
  console.log('\nTotal calls in database:', totalCalls);

  // Count DONE calls
  const doneCalls = await prisma.call.count({
    where: { status: 'DONE' }
  });
  console.log('Total DONE calls:', doneCalls);

  // Get date range of all DONE calls
  const oldestCall = await prisma.call.findFirst({
    where: { status: 'DONE' },
    orderBy: { callDate: 'asc' },
    select: { callDate: true, status: true }
  });

  const newestCall = await prisma.call.findFirst({
    where: { status: 'DONE' },
    orderBy: { callDate: 'desc' },
    select: { callDate: true, status: true }
  });

  if (oldestCall) {
    console.log('\nOldest DONE call date:', oldestCall.callDate.toISOString());
    console.log('Oldest DONE call (local):', oldestCall.callDate.toLocaleString());
  }

  if (newestCall) {
    console.log('\nNewest DONE call date:', newestCall.callDate.toISOString());
    console.log('Newest DONE call (local):', newestCall.callDate.toLocaleString());
  }

  // Check today's DONE calls
  const todayDoneCalls = await prisma.call.count({
    where: {
      status: 'DONE',
      callDate: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  console.log('\n=== Today\'s Statistics ===');
  console.log('DONE calls today:', todayDoneCalls);

  // Get sample of calls with dates
  const sampleCalls = await prisma.call.findMany({
    where: { status: 'DONE' },
    take: 5,
    orderBy: { callDate: 'desc' },
    select: {
      id: true,
      callDate: true,
      status: true,
      employee: {
        select: {
          extCode: true
        }
      }
    }
  });

  console.log('\n=== Sample of recent DONE calls ===');
  sampleCalls.forEach((call, idx) => {
    console.log(`${idx + 1}. Date: ${call.callDate.toISOString()} | ExtCode: ${call.employee?.extCode} | Status: ${call.status}`);
  });

  // Check daily_stats table
  const dailyStatsCount = await prisma.dailyStats.count();
  console.log('\n=== Statistics Tables ===');
  console.log('Records in daily_stats table:', dailyStatsCount);

  const monthlyStatsCount = await prisma.monthlyStats.count();
  console.log('Records in monthly_stats table:', monthlyStatsCount);

  await prisma.$disconnect();
}

checkCallDates().catch(console.error);
