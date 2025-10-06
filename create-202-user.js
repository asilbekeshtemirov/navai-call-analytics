import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const branch = await prisma.branch.findFirst({ where: { name: 'Test Branch' } });
  const department = await prisma.department.findFirst({ where: { name: 'Test Department' } });

  const password = await bcrypt.hash('password123', 10);

  const user = await prisma.user.create({
    data: {
      extCode: '202',
      firstName: 'Agent',
      lastName: '202',
      phone: '+998900000202',
      passwordHash: password,
      role: 'EMPLOYEE',
      branchId: branch.id,
      departmentId: department.id
    }
  });

  console.log(`✅ Created user: Agent 202 (ext: 202)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
