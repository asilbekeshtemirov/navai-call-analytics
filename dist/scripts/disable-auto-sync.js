import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('Disabling auto-sync on startup for all organizations...');
    const result = await prisma.setting.updateMany({
        where: {
            autoSyncOnStartup: true,
        },
        data: {
            autoSyncOnStartup: false,
        },
    });
    console.log(`✅ Updated ${result.count} organization(s)`);
    const settings = await prisma.setting.findMany({
        include: {
            organization: {
                select: {
                    name: true,
                },
            },
        },
    });
    console.log('\nCurrent settings:');
    settings.forEach(s => {
        console.log(`  ${s.organization.name}: autoSyncOnStartup = ${s.autoSyncOnStartup}`);
    });
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=disable-auto-sync.js.map