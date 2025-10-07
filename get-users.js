import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        passwordHash: true,
        organizationId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('\n=== ALL USERS ===\n');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password Hash: ${user.passwordHash}`);
      console.log(`   Organization ID: ${user.organizationId}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });

    console.log(`Total users: ${users.length}\n`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getUsers();
