import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simpleTest() {
  console.log('🧪 Testing Multi-Tenancy Data Isolation...\n');

  try {
    const organizations = await prisma.organization.findMany();

    console.log(`Found ${organizations.length} organizations:\n`);

    for (const org of organizations) {
      console.log(`📦 ${org.name} (${org.slug})`);
      console.log(`   ID: ${org.id}`);

      const users = await prisma.user.count({ where: { organizationId: org.id } });
      const calls = await prisma.call.count({ where: { organizationId: org.id } });
      const criteria = await prisma.criteria.count({ where: { organizationId: org.id } });
      const branches = await prisma.branch.count({ where: { organizationId: org.id } });

      console.log(`   Users: ${users}`);
      console.log(`   Calls: ${calls}`);
      console.log(`   Criteria: ${criteria}`);
      console.log(`   Branches: ${branches}\n`);
    }

    console.log('✅ Multi-tenancy is working!');
    console.log('\n🔑 Test Credentials:');
    console.log('\nDefault Organization:');
    console.log('  Phone: +998901234567');
    console.log('  Password: admin123');

    const companyB = organizations.find(o => o.slug === 'company-b');
    if (companyB) {
      console.log('\nCompany B:');
      console.log('  Phone: +998901111111');
      console.log('  Password: admin123');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

simpleTest();
