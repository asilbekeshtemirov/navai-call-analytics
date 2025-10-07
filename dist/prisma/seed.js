import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Seeding database with multi-tenancy support...');
    const defaultOrg = await prisma.organization.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Default Organization',
            slug: 'default',
            description: 'Default organization for existing data',
            isActive: true,
        },
    });
    console.log('✅ Default organization created');
    const existingSettings = await prisma.setting.findFirst({
        where: { organizationId: defaultOrg.id },
    });
    if (!existingSettings) {
        await prisma.setting.create({
            data: {
                organizationId: defaultOrg.id,
                analyticsStatus: true,
                scoringMode: 'TEN',
                excludeSeconds: 0,
                pbxUrl: 'https://pbx25732.onpbx.ru',
                language: 'uz',
            },
        });
        console.log('✅ Settings created for default organization');
    }
    const branch1 = await prisma.branch.upsert({
        where: { id: 'branch-1' },
        update: {},
        create: {
            id: 'branch-1',
            organizationId: defaultOrg.id,
            name: 'Main Branch',
            address: 'Tashkent, Uzbekistan',
        },
    });
    console.log('✅ Branch created');
    const dept1 = await prisma.department.upsert({
        where: { id: 'dept-1' },
        update: {},
        create: {
            id: 'dept-1',
            branchId: branch1.id,
            name: 'Sales Department',
        },
    });
    console.log('✅ Department created');
    const criteria = [
        {
            name: 'Приветствие',
            weight: 1,
            description: 'Дружелюбное приветствие клиента',
        },
        {
            name: 'Выявление потребностей',
            weight: 2,
            description: 'Выяснение потребностей клиента',
        },
        {
            name: 'Презентация продукта/услуги',
            weight: 2,
            description: 'Четкое описание продукта',
        },
        {
            name: 'Работа с возражениями',
            weight: 2,
            description: 'Ответы на вопросы клиента',
        },
        {
            name: 'Завершение разговора',
            weight: 1,
            description: 'Профессиональное завершение звонка',
        },
    ];
    for (const c of criteria) {
        await prisma.criteria.upsert({
            where: {
                organizationId_name: {
                    organizationId: defaultOrg.id,
                    name: c.name,
                },
            },
            update: {},
            create: {
                organizationId: defaultOrg.id,
                ...c,
            },
        });
    }
    console.log('✅ Criteria created');
    const users = [
        {
            firstName: 'Super',
            lastName: 'Admin',
            phone: '+998901234567',
            extCode: '100',
            role: UserRole.SUPERADMIN,
            password: 'super123',
        },
        {
            firstName: 'Admin',
            lastName: 'User',
            phone: '+998901234568',
            extCode: '101',
            role: UserRole.ADMIN,
            password: 'admin123',
        },
        {
            firstName: 'Manager',
            lastName: 'One',
            phone: '+998901234569',
            extCode: '102',
            role: UserRole.MANAGER,
            password: 'manager123',
        },
        {
            firstName: 'Employee',
            lastName: 'One',
            phone: '+998901234570',
            extCode: '103',
            role: UserRole.EMPLOYEE,
            password: 'employee123',
        },
        {
            firstName: 'Employee',
            lastName: 'Two',
            phone: '+998901234571',
            extCode: '104',
            role: UserRole.EMPLOYEE,
            password: 'employee456',
        },
        {
            firstName: 'Test',
            lastName: 'Manager',
            phone: '+998901234572',
            extCode: '105',
            role: UserRole.MANAGER,
            password: 'test123',
        },
    ];
    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await prisma.user.upsert({
            where: {
                organizationId_phone: {
                    organizationId: defaultOrg.id,
                    phone: user.phone,
                },
            },
            update: {},
            create: {
                organizationId: defaultOrg.id,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                extCode: user.extCode,
                role: user.role,
                passwordHash: hashedPassword,
                branchId: branch1.id,
                departmentId: dept1.id,
            },
        });
        console.log(`✅ ${user.role} created: ${user.phone} / ${user.password}`);
    }
    console.log('\n🎉 Seeding completed successfully!');
    console.log('\nDefault Organization:');
    console.log('  ID:', defaultOrg.id);
    console.log('  Name:', defaultOrg.name);
    console.log('  Slug:', defaultOrg.slug);
    console.log('\n📋 All Test Accounts:');
    users.forEach((user) => {
        console.log(`  ${user.role}: ${user.phone} / ${user.password}`);
    });
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map