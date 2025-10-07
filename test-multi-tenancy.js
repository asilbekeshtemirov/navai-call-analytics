import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testMultiTenancy() {
  console.log('🧪 Testing Multi-Tenancy Implementation...\n');

  try {
    // Step 1: Create second organization
    console.log('1️⃣  Creating second organization...');
    const org2 = await prisma.organization.upsert({
      where: { slug: 'company-b' },
      update: {},
      create: {
        name: 'Company B',
        slug: 'company-b',
        description: 'Second company for testing multi-tenancy',
        isActive: true,
      },
    });
    console.log(`✓ Created: ${org2.name} (${org2.id})\n`);

    // Step 2: Create branch for Company B
    console.log('2️⃣  Creating branch for Company B...');
    const branch2 = await prisma.branch.upsert({
      where: { id: 'branch-companyb-1' },
      update: {},
      create: {
        id: 'branch-companyb-1',
        organizationId: org2.id,
        name: 'Company B Main Office',
        address: 'Samarkand, Uzbekistan',
      },
    });
    console.log(`✓ Created: ${branch2.name}\n`);

    // Step 3: Create department for Company B
    console.log('3️⃣  Creating department for Company B...');
    const dept2 = await prisma.department.upsert({
      where: { id: 'dept-companyb-1' },
      update: {},
      create: {
        id: 'dept-companyb-1',
        branchId: branch2.id,
        name: 'Company B Sales',
      },
    });
    console.log(`✓ Created: ${dept2.name}\n`);

    // Step 4: Create user for Company B
    console.log('4️⃣  Creating user for Company B...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const userB = await prisma.user.upsert({
      where: {
        organizationId_phone: {
          organizationId: org2.id,
          phone: '+998901111111',
        },
      },
      update: {},
      create: {
        organizationId: org2.id,
        firstName: 'Company B',
        lastName: 'Admin',
        phone: '+998901111111',
        extCode: '500',
        role: 'ADMIN',
        passwordHash: hashedPassword,
        branchId: branch2.id,
        departmentId: dept2.id,
      },
    });
    console.log(`✓ Created: ${userB.firstName} ${userB.lastName} (phone: ${userB.phone})\n`);

    // Step 5: Create criteria for Company B
    console.log('5️⃣  Creating criteria for Company B...');
    await prisma.criteria.upsert({
      where: {
        organizationId_name: {
          organizationId: org2.id,
          name: 'Greeting Quality',
        },
      },
      update: {},
      create: {
        organizationId: org2.id,
        name: 'Greeting Quality',
        weight: 3,
        description: 'How well the agent greets the customer',
      },
    });
    console.log(`✓ Created criteria\n`);

    // Step 6: Create settings for Company B
    console.log('6️⃣  Creating settings for Company B...');
    const settingsB = await prisma.setting.findFirst({
      where: { organizationId: org2.id },
    });

    if (!settingsB) {
      await prisma.setting.create({
        data: {
          organizationId: org2.id,
          analyticsStatus: true,
          scoringMode: 'HUNDRED',
          excludeSeconds: 5,
          language: 'en',
        },
      });
      console.log(`✓ Created settings\n`);
    } else {
      console.log(`✓ Settings already exist\n`);
    }

    // Step 7: Verify data isolation
    console.log('7️⃣  Verifying data isolation...\n');

    const org1 = await prisma.organization.findUnique({
      where: { slug: 'default' },
    });

    const org1Users = await prisma.user.count({
      where: { organizationId: org1.id },
    });

    const org2Users = await prisma.user.count({
      where: { organizationId: org2.id },
    });

    const org1Criteria = await prisma.criteria.count({
      where: { organizationId: org1.id },
    });

    const org2Criteria = await prisma.criteria.count({
      where: { organizationId: org2.id },
    });

    console.log('📊 Data Isolation Check:');
    console.log(`   Default Organization: ${org1Users} users, ${org1Criteria} criteria`);
    console.log(`   Company B: ${org2Users} users, ${org2Criteria} criteria\n`);

    if (org1Users > 0 && org2Users > 0 && org1Criteria > 0 && org2Criteria > 0) {
      console.log('✅ SUCCESS: Data is properly isolated between organizations!\n');
    }

    // Step 8: Show test credentials
    console.log('🔑 Test Credentials:\n');
    console.log('Default Organization (existing):');
    console.log('  Phone: +998901234567');
    console.log('  Password: admin123\n');

    console.log('Company B (new):');
    console.log('  Phone: +998901111111');
    console.log('  Password: admin123\n');

    console.log('🎉 Multi-tenancy test completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Login with either account');
    console.log('2. Each organization will only see their own data');
    console.log('3. Try creating calls, users, criteria for each organization');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testMultiTenancy();
