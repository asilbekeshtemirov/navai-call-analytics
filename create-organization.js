import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function createOrganization() {
  console.log('🏢 Yangi Kompaniya Yaratish\n');
  console.log('=' .repeat(50));

  try {
    // Step 1: Organization ma'lumotlari
    console.log('\n1️⃣  Kompaniya ma\'lumotlarini kiriting:\n');

    const orgName = await question('Kompaniya nomi: ');
    const orgSlug = await question('Slug (URL uchun, masalan: company-name): ');
    const orgDescription = await question('Tavsif (ixtiyoriy): ');

    // Check if slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: orgSlug },
    });

    if (existingOrg) {
      console.log('\n❌ Xato: Bu slug allaqachon mavjud!');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Step 2: Branch ma'lumotlari
    console.log('\n2️⃣  Filial ma\'lumotlarini kiriting:\n');

    const branchName = await question('Filial nomi: ');
    const branchAddress = await question('Manzil: ');

    // Step 3: Department ma'lumotlari
    console.log('\n3️⃣  Bo\'lim ma\'lumotlarini kiriting:\n');

    const deptName = await question('Bo\'lim nomi: ');

    // Step 4: Admin foydalanuvchi ma'lumotlari
    console.log('\n4️⃣  Admin foydalanuvchi ma\'lumotlarini kiriting:\n');

    const firstName = await question('Ism: ');
    const lastName = await question('Familiya: ');
    const phone = await question('Telefon raqam (+998XXXXXXXXX): ');
    const extCode = await question('Ichki raqam (ext code): ');
    const password = await question('Parol: ');

    console.log('\n🔄 Kompaniya yaratilmoqda...\n');

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name: orgName,
        slug: orgSlug,
        description: orgDescription || null,
        isActive: true,
      },
    });
    console.log(`✓ Kompaniya yaratildi: ${organization.name}`);

    // Create branch
    const branch = await prisma.branch.create({
      data: {
        organizationId: organization.id,
        name: branchName,
        address: branchAddress,
      },
    });
    console.log(`✓ Filial yaratildi: ${branch.name}`);

    // Create department
    const department = await prisma.department.create({
      data: {
        branchId: branch.id,
        name: deptName,
      },
    });
    console.log(`✓ Bo'lim yaratildi: ${department.name}`);

    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        organizationId: organization.id,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        extCode: extCode,
        role: 'ADMIN',
        passwordHash: hashedPassword,
        branchId: branch.id,
        departmentId: department.id,
      },
    });
    console.log(`✓ Admin foydalanuvchi yaratildi: ${user.firstName} ${user.lastName}`);

    // Create default settings
    await prisma.setting.create({
      data: {
        organizationId: organization.id,
        analyticsStatus: true,
        scoringMode: 'TEN',
        excludeSeconds: 0,
        language: 'uz',
      },
    });
    console.log(`✓ Standart sozlamalar yaratildi`);

    // Create default criteria
    const defaultCriteria = [
      { name: 'Приветствие', weight: 1, description: 'Дружелюбное приветствие клиента' },
      { name: 'Выявление потребностей', weight: 2, description: 'Выяснение потребностей клиента' },
      { name: 'Презентация продукта/услуги', weight: 2, description: 'Четкое описание продукта' },
      { name: 'Работа с возражениями', weight: 2, description: 'Ответы на вопросы клиента' },
      { name: 'Завершение разговора', weight: 1, description: 'Профессиональное завершение звонка' },
    ];

    for (const criteria of defaultCriteria) {
      await prisma.criteria.create({
        data: {
          organizationId: organization.id,
          ...criteria,
        },
      });
    }
    console.log(`✓ Standart baholash mezonlari yaratildi (${defaultCriteria.length} ta)`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Kompaniya muvaffaqiyatli yaratildi!\n');

    console.log('📋 Qisqacha ma\'lumot:');
    console.log(`   Kompaniya: ${organization.name}`);
    console.log(`   Slug: ${organization.slug}`);
    console.log(`   ID: ${organization.id}\n`);

    console.log('🔑 Kirish uchun:');
    console.log(`   Telefon: ${phone}`);
    console.log(`   Parol: ${password}\n`);

    console.log('📊 Yaratilgan:');
    console.log(`   ✓ 1 ta filial`);
    console.log(`   ✓ 1 ta bo'lim`);
    console.log(`   ✓ 1 ta admin foydalanuvchi`);
    console.log(`   ✓ ${defaultCriteria.length} ta baholash mezoni`);
    console.log(`   ✓ Standart sozlamalar\n`);

  } catch (error) {
    console.error('\n❌ Xato yuz berdi:', error.message);
    if (error.code === 'P2002') {
      console.error('Bu telefon raqam yoki slug allaqachon mavjud!');
    }
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createOrganization();
