import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createSuperadmin() {
  console.log('👑 SUPERADMIN Yaratish\n');

  try {
    // Get default organization
    const defaultOrg = await prisma.organization.findUnique({
      where: { slug: 'default' },
    });

    if (!defaultOrg) {
      console.error('❌ Default organization topilmadi!');
      return;
    }

    // Check if superadmin already exists
    const existingSuperadmin = await prisma.user.findFirst({
      where: { role: 'SUPERADMIN' },
    });

    if (existingSuperadmin) {
      console.log('✓ SUPERADMIN allaqachon mavjud:');
      console.log(`  Ism: ${existingSuperadmin.firstName} ${existingSuperadmin.lastName}`);
      console.log(`  Telefon: ${existingSuperadmin.phone}`);
      console.log(`  Role: ${existingSuperadmin.role}\n`);
      return;
    }

    // Get first branch and department from default org
    const branch = await prisma.branch.findFirst({
      where: { organizationId: defaultOrg.id },
    });

    const department = await prisma.department.findFirst({
      where: { branchId: branch?.id },
    });

    if (!branch || !department) {
      console.error('❌ Branch yoki department topilmadi!');
      return;
    }

    // Create SUPERADMIN user
    const hashedPassword = await bcrypt.hash('superadmin123', 10);

    const superadmin = await prisma.user.create({
      data: {
        organizationId: defaultOrg.id,
        firstName: 'Super',
        lastName: 'Admin',
        phone: '+998900000000',
        extCode: '000',
        role: 'SUPERADMIN',
        passwordHash: hashedPassword,
        branchId: branch.id,
        departmentId: department.id,
      },
    });

    console.log('✅ SUPERADMIN muvaffaqiyatli yaratildi!\n');
    console.log('🔑 Kirish uchun:');
    console.log(`   Telefon: ${superadmin.phone}`);
    console.log(`   Parol: superadmin123\n`);
    console.log('💡 Bu foydalanuvchi:');
    console.log('   ✓ Yangi kompaniya yarata oladi');
    console.log('   ✓ Barcha kompaniyalarni ko\'ra oladi');
    console.log('   ✓ Kompaniyalarni faollashtirish/o\'chirish mumkin\n');

  } catch (error) {
    console.error('❌ Xato:', error.message);
    if (error.code === 'P2002') {
      console.error('Bu telefon raqam allaqachon mavjud!');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createSuperadmin();
