-- Create daily_stats table
CREATE TABLE IF NOT EXISTS "daily_stats" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "extCode" VARCHAR(10) NOT NULL,
    "callsCount" INTEGER NOT NULL DEFAULT 0,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_stats_pkey" PRIMARY KEY ("id")
);

-- Create monthly_stats table
CREATE TABLE IF NOT EXISTS "monthly_stats" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "extCode" VARCHAR(10) NOT NULL,
    "callsCount" INTEGER NOT NULL DEFAULT 0,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_stats_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "daily_stats_date_extCode_key" ON "daily_stats"("date", "extCode");
CREATE UNIQUE INDEX IF NOT EXISTS "monthly_stats_year_month_extCode_key" ON "monthly_stats"("year", "month", "extCode");
