import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Creating Test Users for Sipuni Extensions ===\n');

  // Create branch if not exists
  let branch = await prisma.branch.findFirst({ where: { name: 'Test Branch' } });
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        name: 'Test Branch',
        address: 'Test Address'
      }
    });
    console.log('✅ Created branch:', branch.name);
  }

  // Create department if not exists
  let department = await prisma.department.findFirst({ where: { name: 'Test Department' } });
  if (!department) {
    department = await prisma.department.create({
      data: {
        name: 'Test Department',
        branchId: branch.id
      }
    });
    console.log('✅ Created department:', department.name);
  }

  // Extensions from Sipuni CSV
  const extensions = [
    { extCode: '204', firstName: 'Agent', lastName: '204', phone: '+998900000204' },
    { extCode: '206', firstName: 'Agent', lastName: '206', phone: '+998900000206' },
    { extCode: '208', firstName: 'Agent', lastName: '208', phone: '+998900000208' },
    { extCode: '209', firstName: 'Agent', lastName: '209', phone: '+998900000209' },
    { extCode: '210', firstName: 'Agent', lastName: '210', phone: '+998900000210' },
    { extCode: '212', firstName: 'Agent', lastName: '212', phone: '+998900000212' },
  ];

  const password = await bcrypt.hash('password123', 10);

  for (const ext of extensions) {
    const existing = await prisma.user.findFirst({ where: { extCode: ext.extCode } });

    if (!existing) {
      const user = await prisma.user.create({
        data: {
          ...ext,
          passwordHash: password,
          role: 'EMPLOYEE',
          branchId: branch.id,
          departmentId: department.id
        }
      });
      console.log(`✅ Created user: ${user.firstName} ${user.lastName} (ext: ${user.extCode})`);
    } else {
      console.log(`⏭️  User already exists: ${existing.firstName} ${existing.lastName} (ext: ${existing.extCode})`);
    }
  }

  console.log('\n✅ Done!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
