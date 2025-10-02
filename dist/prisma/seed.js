import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    await prisma.setting.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            analyticsStatus: true,
            scoringMode: 'TEN',
            excludeSeconds: 0,
            pbxUrl: 'https://pbx25732.onpbx.ru',
            language: 'rus',
        },
    });
    console.log('✅ Settings created');
    const branch1 = await prisma.branch.upsert({
        where: { id: 'branch-1' },
        update: {},
        create: {
            id: 'branch-1',
            name: 'Company',
            address: 'Tashkent, Uzbekistan',
        },
    });
    console.log('✅ Branch created');
    const dept1 = await prisma.department.upsert({
        where: { id: 'dept-1' },
        update: {},
        create: {
            id: 'dept-1',
            name: 'For Demo',
            branchId: branch1.id,
        },
    });
    console.log('✅ Department created');
    const criteria = [
        { name: 'Приветствие', weight: 1, description: 'Оператор приветствует клиента профессионально' },
        { name: 'Выявление потребностей', weight: 2, description: 'Оператор задает вопросы для выявления потребностей' },
        { name: 'Презентация продукта/услуги', weight: 2, description: 'Оператор представляет продукт/услугу' },
        { name: 'Работа с возражениями', weight: 2, description: 'Оператор эффективно работает с возражениями' },
        { name: 'Завершение разговора', weight: 1, description: 'Оператор корректно завершает разговор' },
    ];
    for (const c of criteria) {
        await prisma.criteria.upsert({
            where: { name: c.name },
            update: {},
            create: c,
        });
    }
    console.log('✅ Criteria created');
    const topic1 = await prisma.topic.upsert({
        where: { name: 'Качество обслуживания' },
        update: {},
        create: { name: 'Качество обслуживания' },
    });
    console.log('✅ Topics created');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { phone: '+998901234567' },
        update: {},
        create: {
            firstName: 'Admin',
            lastName: 'User',
            phone: '+998901234567',
            extCode: '100',
            role: 'ADMIN',
            passwordHash: adminPassword,
            branchId: branch1.id,
            departmentId: dept1.id,
        },
    });
    console.log('✅ Admin user created (phone: +998901234567, password: admin123)');
    const employeePassword = await bcrypt.hash('employee123', 10);
    const employee1 = await prisma.user.upsert({
        where: { phone: '+998901234568' },
        update: {},
        create: {
            firstName: 'Test',
            lastName: 'Employee 2',
            phone: '+998901234568',
            extCode: '12345',
            role: 'EMPLOYEE',
            passwordHash: employeePassword,
            branchId: branch1.id,
            departmentId: dept1.id,
        },
    });
    console.log('✅ Test employee created (phone: +998901234568, password: employee123)');
    const managerPassword = await bcrypt.hash('manager123', 10);
    const manager = await prisma.user.upsert({
        where: { phone: '+998901234569' },
        update: {},
        create: {
            firstName: 'Test',
            lastName: 'Manager',
            phone: '+998901234569',
            extCode: '200',
            role: 'MANAGER',
            passwordHash: managerPassword,
            branchId: branch1.id,
            departmentId: dept1.id,
        },
    });
    console.log('✅ Manager created (phone: +998901234569, password: manager123)');
    const employee701 = await prisma.user.upsert({
        where: { phone: '998905389252' },
        update: {},
        create: {
            firstName: 'Navai',
            lastName: 'Agent 701',
            phone: '998905389252',
            extCode: '701',
            role: 'EMPLOYEE',
            passwordHash: employeePassword,
            branchId: branch1.id,
            departmentId: dept1.id,
        },
    });
    console.log('✅ Employee 701 created (phone: 998905389252, password: employee123)');
    const employee702 = await prisma.user.upsert({
        where: { phone: '998932412054' },
        update: {},
        create: {
            firstName: 'Navai',
            lastName: 'Agent 702',
            phone: '998932412054',
            extCode: '702',
            role: 'EMPLOYEE',
            passwordHash: employeePassword,
            branchId: branch1.id,
            departmentId: dept1.id,
        },
    });
    console.log('✅ Employee 702 created (phone: 998932412054, password: employee123)');
    const allCriteria = await prisma.criteria.findMany();
    await prisma.call.deleteMany({
        where: {
            externalId: {
                in: ['test-sip-1', 'test-sip-2']
            }
        }
    });
    const call1 = await prisma.call.create({
        data: {
            externalId: 'test-sip-1',
            callDate: new Date(),
            employeeId: employee1.id,
            managerId: manager.id,
            branchId: branch1.id,
            departmentId: dept1.id,
            fileUrl: 'https://example.com/audio1.mp3',
            status: 'DONE',
            durationSec: 120,
            transcription: '[Agent]: Salom, Navai Analytics. [Customer]: Salom, yordamingiz kerak.',
            analysis: {
                overallScore: 8.5,
                summary: 'Good call, agent was polite and helpful.',
                violations: [],
                criteriaScores: allCriteria.slice(0, 2).map(c => ({
                    criteriaId: c.id,
                    score: Math.floor(Math.random() * 3 + 7),
                    notes: 'Good performance'
                }))
            }
        }
    });
    const call2 = await prisma.call.create({
        data: {
            externalId: 'test-sip-2',
            callDate: new Date(),
            employeeId: employee1.id,
            managerId: manager.id,
            branchId: branch1.id,
            departmentId: dept1.id,
            fileUrl: 'https://example.com/audio2.mp3',
            status: 'DONE',
            durationSec: 180,
            transcription: '[Agent]: Navai Analytics, eshitaman. [Customer]: Mahsulot haqida savolim bor.',
            analysis: {
                overallScore: 7.2,
                summary: 'Agent could have been more proactive.',
                violations: [{ type: 'Long pause', timestampMs: 45000, details: 'Agent was silent for 15 seconds' }],
                criteriaScores: allCriteria.slice(1, 3).map(c => ({
                    criteriaId: c.id,
                    score: Math.floor(Math.random() * 4 + 5),
                    notes: 'Could be improved'
                }))
            }
        }
    });
    console.log('✅ Test calls created');
    console.log('🎉 Seeding completed!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map