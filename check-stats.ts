import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Database Statistics\n');

  // Total calls by status
  const callsByStatus = await prisma.call.groupBy({
    by: ['status'],
    _count: {
      id: true,
    },
  });

  console.log('📞 Calls by Status:');
  for (const stat of callsByStatus) {
    console.log(`  ${stat.status}: ${stat._count.id}`);
  }

  // Total calls
  const totalCalls = await prisma.call.count();
  console.log(`\n📈 Total Calls: ${totalCalls}`);

  // Recent calls
  const recentCalls = await prisma.call.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      externalId: true,
      status: true,
      callerNumber: true,
      calleeNumber: true,
      durationSec: true,
      createdAt: true,
    },
  });

  console.log('\n🕐 Recent 5 Calls:');
  for (const call of recentCalls) {
    console.log(
      `  ${call.externalId} | ${call.status} | ${call.callerNumber} → ${call.calleeNumber} | ${call.durationSec}s | ${call.createdAt.toLocaleString()}`,
    );
  }

  // Employees
  const totalEmployees = await prisma.user.count();
  const employees = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      extCode: true,
      _count: {
        select: {
          callsAsEmployee: true,
        },
      },
    },
  });

  console.log(`\n👥 Total Employees: ${totalEmployees}`);
  console.log('\n📞 Calls per Employee:');
  for (const emp of employees) {
    console.log(
      `  ${emp.firstName} ${emp.lastName} (ext: ${emp.extCode}): ${emp._count.callsAsEmployee} calls`,
    );
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
