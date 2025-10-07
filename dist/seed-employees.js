import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Seeding employees...');
    const branch = await prisma.branch.upsert({
        where: { id: 'default-branch-001' },
        update: {},
        create: {
            id: 'default-branch-001',
            organizationId: 1,
            name: 'Main Branch',
            address: 'Navoi, Uzbekistan',
        },
    });
    console.log('✅ Branch created:', branch.name);
    const department = await prisma.department.upsert({
        where: { id: 'default-dept-001' },
        update: {},
        create: {
            id: 'default-dept-001',
            branchId: branch.id,
            name: 'Call Center',
        },
    });
    console.log('✅ Department created:', department.name);
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);
    const employees = [
        { id: 'emp-201-uuid-0001', firstName: 'Alisher', lastName: 'Navoiy', phone: '+998901234501', extCode: '201' },
        { id: 'emp-202-uuid-0002', firstName: 'Bobur', lastName: 'Mirzo', phone: '+998901234502', extCode: '202' },
        { id: 'emp-203-uuid-0003', firstName: 'Dilshod', lastName: 'Qodirov', phone: '+998901234503', extCode: '203' },
        { id: 'emp-205-uuid-0005', firstName: 'Eldor', lastName: 'Tursunov', phone: '+998901234505', extCode: '205' },
        { id: 'emp-210-uuid-0010', firstName: 'Farrux', lastName: 'Usmonov', phone: '+998901234510', extCode: '210' },
    ];
    for (const emp of employees) {
        const user = await prisma.user.upsert({
            where: {
                organizationId_phone: {
                    organizationId: 1,
                    phone: emp.phone,
                },
            },
            update: {
                extCode: emp.extCode,
            },
            create: {
                id: emp.id,
                organizationId: 1,
                firstName: emp.firstName,
                lastName: emp.lastName,
                phone: emp.phone,
                extCode: emp.extCode,
                role: 'EMPLOYEE',
                passwordHash: passwordHash,
                branchId: branch.id,
                departmentId: department.id,
            },
        });
        console.log(`✅ Employee created: ${user.firstName} ${user.lastName} (ext: ${user.extCode})`);
    }
    console.log('\n🎉 Seeding completed!');
    console.log('\n📋 Summary:');
    console.log(`  - Branch: ${branch.name}`);
    console.log(`  - Department: ${department.name}`);
    console.log(`  - Employees: ${employees.length}`);
    console.log('\n🔑 Login credentials for employees:');
    console.log('  - Phone: +998901234501 (201), +998901234502 (202), etc.');
    console.log('  - Password: password123');
}
main()
    .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-employees.js.map