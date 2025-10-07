import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function runMigration() {
  console.log('Starting multi-tenancy migration...');

  try {
    // Read SQL file
    const sql = fs.readFileSync('./prisma/migrations/add-multi-tenancy.sql', 'utf-8');

    // Split into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`[${i + 1}/${statements.length}] Executing...`);
        try {
          await prisma.$executeRawUnsafe(statement);
          console.log(`✓ Success`);
        } catch (error) {
          console.error(`✗ Failed: ${error.message}`);
          // Continue on errors like "already exists"
          if (!error.message.includes('already exists') &&
              !error.message.includes('does not exist')) {
            throw error;
          }
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nDefault organization created:');
    console.log('  ID: default-org-id');
    console.log('  Name: Default Organization');
    console.log('  Slug: default');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

runMigration()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
