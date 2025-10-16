const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function enableAutoCallingForAdmin() {
  try {
    // Bu yerda telefon raqam yoki email orqali admin topiladi
    const phoneNumber = process.argv[2]; // Terminal'dan telefon raqamni olish

    if (!phoneNumber) {
      console.log('❌ Telefon raqam ko\'rsatilmagan!');
      console.log('Foydalanish: node enable-auto-calling.js [TELEFON_RAQAM]');
      console.log('Misol: node enable-auto-calling.js +998901234567');
      process.exit(1);
    }

    // Foydalanuvchini topish
    const user = await prisma.user.findFirst({
      where: {
        phone: phoneNumber,
        role: 'ADMIN', // Faqat ADMIN rolini yangilash
      },
    });

    if (!user) {
      console.log(`❌ "${phoneNumber}" raqamli ADMIN topilmadi!`);
      console.log('Iltimos, to\'g\'ri telefon raqam kiriting va foydalanuvchi ADMIN rolida ekanligini tekshiring.');
      process.exit(1);
    }

    // auto_calling ni true qilish
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { auto_calling: true },
    });

    console.log('✅ Muvaffaqiyatli yangilandi!');
    console.log('-----------------------------------');
    console.log(`Foydalanuvchi: ${updatedUser.firstName} ${updatedUser.lastName}`);
    console.log(`Telefon: ${updatedUser.phone}`);
    console.log(`Role: ${updatedUser.role}`);
    console.log(`Auto Calling: ${updatedUser.auto_calling ? '✓ Yoqilgan' : '✗ O\'chirilgan'}`);
    console.log('-----------------------------------');
    console.log('Endi bu admin Auto Calling sahifasini ko\'ra oladi!');
  } catch (error) {
    console.error('❌ Xatolik yuz berdi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

enableAutoCallingForAdmin();
