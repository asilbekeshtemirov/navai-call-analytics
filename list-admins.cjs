const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        auto_calling: true,
        organization: {
          select: { name: true }
        }
      }
    });

    console.log('📋 ADMIN foydalanuvchilar:');
    console.log('-----------------------------------');

    if (admins.length === 0) {
      console.log('❌ Hech qanday ADMIN topilmadi!');
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.firstName} ${admin.lastName}`);
        console.log(`   Telefon: ${admin.phone}`);
        console.log(`   Organizatsiya: ${admin.organization?.name || 'N/A'}`);
        console.log(`   Auto Calling: ${admin.auto_calling ? '✓ Yoqilgan' : '✗ O\'chirilgan'}`);
        console.log('-----------------------------------');
      });
    }
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listAdmins();
