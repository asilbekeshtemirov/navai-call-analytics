import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Database Check ===\n');

  // Check users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      extCode: true,
      role: true,
      phone: true
    }
  });

  console.log(`📋 Users in DB: ${users.length}`);
  users.forEach(u => {
    console.log(`  - ${u.firstName} ${u.lastName} (extCode: ${u.extCode}, phone: ${u.phone}, role: ${u.role})`);
  });

  // Check calls
  const calls = await prisma.call.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      externalId: true,
      status: true,
      callDate: true,
      employee: {
        select: {
          firstName: true,
          extCode: true
        }
      }
    }
  });

  console.log(`\n📞 Recent Calls: ${calls.length}`);
  calls.forEach(c => {
    console.log(`  - ${c.externalId} | ${c.status} | ${c.employee.firstName} (${c.employee.extCode})`);
  });

  // Check criteria
  const criteria = await prisma.criteria.findMany();
  console.log(`\n📊 Criteria: ${criteria.length}`);
  criteria.forEach(c => {
    console.log(`  - ${c.name} (weight: ${c.weight})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
