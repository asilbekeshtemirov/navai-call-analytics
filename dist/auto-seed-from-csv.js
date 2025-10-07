import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Auto-seeding employees from CSV...');
    const csvPath = path.join(__dirname, 'sipuni-all-records.csv');
    if (!fs.existsSync(csvPath)) {
        console.error('❌ CSV file not found:', csvPath);
        process.exit(1);
    }
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(l => l.trim());
    const records = lines.slice(1).map(line => {
        const cols = line.split(';');
        return {
            type: cols[0],
            status: cols[1],
            time: cols[2],
            tree: cols[3],
            from: cols[4],
            to: cols[5],
            answered: cols[6],
        };
    });
    console.log(`📄 Found ${records.length} records in CSV`);
    const extCodes = new Set();
    for (const record of records) {
        if (/^\d{3}$/.test(record.from)) {
            extCodes.add(record.from);
        }
        if (/^\d{3}$/.test(record.answered)) {
            extCodes.add(record.answered);
        }
    }
    const uniqueExtCodes = Array.from(extCodes).sort();
    console.log(`🔍 Found ${uniqueExtCodes.length} unique extension codes:`, uniqueExtCodes.join(', '));
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
    console.log('✅ Branch:', branch.name);
    const department = await prisma.department.upsert({
        where: { id: 'default-dept-001' },
        update: {},
        create: {
            id: 'default-dept-001',
            branchId: branch.id,
            name: 'Call Center',
        },
    });
    console.log('✅ Department:', department.name);
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);
    const firstNames = ['Alisher', 'Bobur', 'Dilshod', 'Eldor', 'Farrux', 'Gulnora', 'Hasan', 'Iroda', 'Jasur', 'Kamila'];
    const lastNames = ['Navoiy', 'Mirzo', 'Qodirov', 'Tursunov', 'Usmonov', 'Karimova', 'Rashidov', 'Sadikova', 'Yusupov', 'Azizova'];
    let createdCount = 0;
    let skippedCount = 0;
    for (const [index, extCode] of uniqueExtCodes.entries()) {
        const firstName = firstNames[index % firstNames.length];
        const lastName = lastNames[index % lastNames.length];
        const phone = `+99890123${extCode}`;
        const employeeId = `emp-${extCode}-uuid`;
        try {
            const user = await prisma.user.upsert({
                where: {
                    organizationId_phone: {
                        organizationId: 1,
                        phone: phone,
                    },
                },
                update: {
                    extCode: extCode,
                },
                create: {
                    id: employeeId,
                    organizationId: 1,
                    firstName: firstName,
                    lastName: lastName,
                    phone: phone,
                    extCode: extCode,
                    role: 'EMPLOYEE',
                    passwordHash: passwordHash,
                    branchId: branch.id,
                    departmentId: department.id,
                },
            });
            console.log(`✅ Employee: ${user.firstName} ${user.lastName} (ext: ${user.extCode})`);
            createdCount++;
        }
        catch (error) {
            console.warn(`⚠️  Skipped ext ${extCode}: ${error.message}`);
            skippedCount++;
        }
    }
    console.log('\n🎉 Auto-seeding completed!');
    console.log('\n📋 Summary:');
    console.log(`  - Branch: ${branch.name}`);
    console.log(`  - Department: ${department.name}`);
    console.log(`  - Extension codes found: ${uniqueExtCodes.length}`);
    console.log(`  - Employees created: ${createdCount}`);
    console.log(`  - Skipped: ${skippedCount}`);
    console.log('\n🔑 Login credentials:');
    console.log('  - Phone format: +99890123XXX (XXX = extCode)');
    console.log('  - Password: password123');
    console.log('\n📞 Extension codes created:');
    console.log(`  ${uniqueExtCodes.join(', ')}`);
}
main()
    .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=auto-seed-from-csv.js.map