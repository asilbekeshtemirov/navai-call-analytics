import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function safeMigrate() {
  console.log('🔧 Starting safe multi-tenancy migration...\n');

  try {
    console.log('Step 1: Creating organizations table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "organizations" (
        "id" TEXT NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "slug" VARCHAR(100) NOT NULL,
        "description" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log('✅ Organizations table created\n');

    console.log('Step 2: Creating unique index on slug...');
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "organizations_slug_key" ON "organizations"("slug")
    `);
    console.log('✅ Index created\n');

    console.log('Step 3: Inserting default organization...');
    await prisma.$executeRawUnsafe(`
      INSERT INTO "organizations" ("id", "name", "slug", "description", "createdAt", "updatedAt")
      VALUES ('default-org-id', 'Default Organization', 'default', 'Default organization for existing data', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT ("id") DO NOTHING
    `);
    console.log('✅ Default organization created\n');

    console.log('Step 4: Adding organizationId columns...');
    const tables = ['Branch', 'User', 'Criteria', 'Call', 'call_sessions', 'daily_stats', 'monthly_stats', 'settings'];

    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "organizationId" TEXT`);
        console.log(`  ✓ Added organizationId to ${table}`);
      } catch (e) {
        if (!e.message.includes('already exists')) {
          console.log(`  ⚠ Skipped ${table}: ${e.message}`);
        }
      }
    }
    console.log('✅ Columns added\n');

    console.log('Step 5: Updating existing records with default organization...');
    for (const table of tables) {
      await prisma.$executeRawUnsafe(`UPDATE "${table}" SET "organizationId" = 'default-org-id' WHERE "organizationId" IS NULL`);
      console.log(`  ✓ Updated ${table}`);
    }
    console.log('✅ Records updated\n');

    console.log('Step 6: Making organizationId NOT NULL...');
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ALTER COLUMN "organizationId" SET NOT NULL`);
        console.log(`  ✓ Set NOT NULL on ${table}`);
      } catch (e) {
        console.log(`  ⚠ Skipped ${table}: ${e.message}`);
      }
    }
    console.log('✅ Constraints added\n');

    console.log('Step 7: Adding foreign key constraints...');
    const fkConstraints = [
      { table: 'Branch', name: 'Branch_organizationId_fkey' },
      { table: 'User', name: 'User_organizationId_fkey' },
      { table: 'Criteria', name: 'Criteria_organizationId_fkey' },
      { table: 'Call', name: 'Call_organizationId_fkey' },
      { table: 'call_sessions', name: 'call_sessions_organizationId_fkey' },
      { table: 'daily_stats', name: 'daily_stats_organizationId_fkey' },
      { table: 'monthly_stats', name: 'monthly_stats_organizationId_fkey' },
      { table: 'settings', name: 'settings_organizationId_fkey' },
    ];

    for (const { table, name } of fkConstraints) {
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "${table}"
          ADD CONSTRAINT "${name}"
          FOREIGN KEY ("organizationId") REFERENCES "organizations"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
        `);
        console.log(`  ✓ Added FK to ${table}`);
      } catch (e) {
        if (!e.message.includes('already exists')) {
          console.log(`  ⚠ Skipped ${table}: ${e.message}`);
        }
      }
    }
    console.log('✅ Foreign keys added\n');

    console.log('Step 8: Updating unique constraints...');

    // Drop old unique constraints
    try {
      await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "User_phone_key"`);
      await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "Criteria_name_key"`);
      await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "Call_externalId_key"`);
      await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "daily_stats_date_extCode_key"`);
      await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "monthly_stats_year_month_extCode_key"`);
      console.log('  ✓ Dropped old unique indexes');
    } catch (e) {
      console.log(`  ⚠ Error dropping indexes: ${e.message}`);
    }

    // Add new unique constraints
    try {
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_organizationId_phone_key" ON "User"("organizationId", "phone")`);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Criteria_organizationId_name_key" ON "Criteria"("organizationId", "name")`);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Call_organizationId_externalId_key" ON "Call"("organizationId", "externalId")`);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "settings_organizationId_key" ON "settings"("organizationId")`);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "daily_stats_organizationId_date_extCode_key" ON "daily_stats"("organizationId", "date", "extCode")`);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "monthly_stats_organizationId_year_month_extCode_key" ON "monthly_stats"("organizationId", "year", "month", "extCode")`);
      console.log('  ✓ Created new unique indexes');
    } catch (e) {
      console.log(`  ⚠ Error creating indexes: ${e.message}`);
    }
    console.log('✅ Unique constraints updated\n');

    console.log('Step 9: Adding performance indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "Branch_organizationId_idx" ON "Branch"("organizationId")',
      'CREATE INDEX IF NOT EXISTS "User_organizationId_idx" ON "User"("organizationId")',
      'CREATE INDEX IF NOT EXISTS "User_organizationId_extCode_idx" ON "User"("organizationId", "extCode")',
      'CREATE INDEX IF NOT EXISTS "Criteria_organizationId_idx" ON "Criteria"("organizationId")',
      'CREATE INDEX IF NOT EXISTS "Call_organizationId_idx" ON "Call"("organizationId")',
      'CREATE INDEX IF NOT EXISTS "Call_organizationId_employeeId_idx" ON "Call"("organizationId", "employeeId")',
      'CREATE INDEX IF NOT EXISTS "Call_organizationId_status_idx" ON "Call"("organizationId", "status")',
      'CREATE INDEX IF NOT EXISTS "Call_organizationId_callDate_idx" ON "Call"("organizationId", "callDate")',
      'CREATE INDEX IF NOT EXISTS "call_sessions_organizationId_idx" ON "call_sessions"("organizationId")',
      'CREATE INDEX IF NOT EXISTS "daily_stats_organizationId_idx" ON "daily_stats"("organizationId")',
      'CREATE INDEX IF NOT EXISTS "monthly_stats_organizationId_idx" ON "monthly_stats"("organizationId")',
    ];

    for (const index of indexes) {
      try {
        await prisma.$executeRawUnsafe(index);
      } catch (e) {
        // Ignore if already exists
      }
    }
    console.log('✅ Indexes created\n');

    console.log('✅✅✅ Migration completed successfully! ✅✅✅\n');
    console.log('Default organization created:');
    console.log('  ID: default-org-id');
    console.log('  Name: Default Organization');
    console.log('  Slug: default\n');
    console.log('All existing data has been linked to the default organization.');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

safeMigrate()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
