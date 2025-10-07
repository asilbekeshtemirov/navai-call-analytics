-- Add multi-tenancy support
-- Step 1: Create Organization table
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- Step 2: Insert default organization for existing data
INSERT INTO "organizations" ("id", "name", "slug", "description", "createdAt", "updatedAt")
VALUES ('default-org-id', 'Default Organization', 'default', 'Default organization for existing data', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Step 3: Add organizationId to existing tables
ALTER TABLE "Branch" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "User" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "Criteria" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "Call" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "call_sessions" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "daily_stats" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "monthly_stats" ADD COLUMN "organizationId" TEXT;

-- Step 4: Update existing records with default organization
UPDATE "Branch" SET "organizationId" = 'default-org-id';
UPDATE "User" SET "organizationId" = 'default-org-id';
UPDATE "Criteria" SET "organizationId" = 'default-org-id';
UPDATE "Call" SET "organizationId" = 'default-org-id';
UPDATE "call_sessions" SET "organizationId" = 'default-org-id';
UPDATE "daily_stats" SET "organizationId" = 'default-org-id';
UPDATE "monthly_stats" SET "organizationId" = 'default-org-id';

-- Step 5: Make organizationId NOT NULL
ALTER TABLE "Branch" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Criteria" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Call" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "call_sessions" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "daily_stats" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "monthly_stats" ALTER COLUMN "organizationId" SET NOT NULL;

-- Step 6: Add foreign key constraints
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Criteria" ADD CONSTRAINT "Criteria_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Call" ADD CONSTRAINT "Call_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "daily_stats" ADD CONSTRAINT "daily_stats_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "monthly_stats" ADD CONSTRAINT "monthly_stats_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 7: Update Settings table
ALTER TABLE "settings" ADD COLUMN "organizationId" TEXT;
UPDATE "settings" SET "organizationId" = 'default-org-id';
ALTER TABLE "settings" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "settings" ADD CONSTRAINT "settings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop old primary key and add new one
ALTER TABLE "settings" DROP CONSTRAINT "settings_pkey";
ALTER TABLE "settings" DROP COLUMN "id";
ALTER TABLE "settings" ADD COLUMN "id" TEXT NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "settings" ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("id");

-- Step 8: Drop old unique constraints and add new ones
DROP INDEX IF EXISTS "User_phone_key";
DROP INDEX IF EXISTS "Criteria_name_key";
DROP INDEX IF EXISTS "Call_externalId_key";
DROP INDEX IF EXISTS "daily_stats_date_extCode_key";
DROP INDEX IF EXISTS "monthly_stats_year_month_extCode_key";

CREATE UNIQUE INDEX "User_organizationId_phone_key" ON "User"("organizationId", "phone");
CREATE UNIQUE INDEX "Criteria_organizationId_name_key" ON "Criteria"("organizationId", "name");
CREATE UNIQUE INDEX "Call_organizationId_externalId_key" ON "Call"("organizationId", "externalId");
CREATE UNIQUE INDEX "settings_organizationId_key" ON "settings"("organizationId");
CREATE UNIQUE INDEX "daily_stats_organizationId_date_extCode_key" ON "daily_stats"("organizationId", "date", "extCode");
CREATE UNIQUE INDEX "monthly_stats_organizationId_year_month_extCode_key" ON "monthly_stats"("organizationId", "year", "month", "extCode");

-- Step 9: Add indexes
CREATE INDEX "Branch_organizationId_idx" ON "Branch"("organizationId");
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");
CREATE INDEX "User_organizationId_extCode_idx" ON "User"("organizationId", "extCode");
CREATE INDEX "Criteria_organizationId_idx" ON "Criteria"("organizationId");
CREATE INDEX "Call_organizationId_idx" ON "Call"("organizationId");
CREATE INDEX "Call_organizationId_employeeId_idx" ON "Call"("organizationId", "employeeId");
CREATE INDEX "Call_organizationId_status_idx" ON "Call"("organizationId", "status");
CREATE INDEX "Call_organizationId_callDate_idx" ON "Call"("organizationId", "callDate");
CREATE INDEX "call_sessions_organizationId_idx" ON "call_sessions"("organizationId");
CREATE INDEX "daily_stats_organizationId_idx" ON "daily_stats"("organizationId");
CREATE INDEX "monthly_stats_organizationId_idx" ON "monthly_stats"("organizationId");
