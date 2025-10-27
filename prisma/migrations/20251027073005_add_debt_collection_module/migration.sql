/*
  Warnings:

  - The primary key for the `settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[organizationId,externalId]` on the table `Call` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,name]` on the table `Criteria` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId]` on the table `settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationId` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Call` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Criteria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `settings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('PBX', 'SIPUNI');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CallResultStatus" AS ENUM ('ANSWERED', 'NO_ANSWER', 'BUSY', 'FAILED', 'CONNECTED_TO_OPERATOR', 'REJECTED', 'INVALID_NUMBER', 'NETWORK_ERROR');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED', 'DO_NOT_CALL');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('GENERAL', 'DEBT_COLLECTION', 'SURVEY', 'REMINDER', 'MARKETING', 'CUSTOMER_SERVICE');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('PENDING', 'RUNNING', 'PAUSED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CampaignCallStatus" AS ENUM ('PENDING', 'CALLING', 'SUCCESS', 'FAILED', 'NO_ANSWER', 'BUSY', 'PROMISE_TO_PAY', 'REFUSED', 'CALLBACK_REQUESTED');

-- CreateEnum
CREATE TYPE "DebtorStatus" AS ENUM ('ACTIVE', 'PAID', 'DISPUTED', 'DO_NOT_CALL', 'LEGAL_ACTION');

-- CreateEnum
CREATE TYPE "DebtCampaignStatus" AS ENUM ('DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED', 'STOPPED');

-- CreateEnum
CREATE TYPE "DebtCallStatus" AS ENUM ('PENDING', 'CALLING', 'SUCCESS', 'FAILED', 'NO_ANSWER', 'BUSY');

-- CreateEnum
CREATE TYPE "DebtCallOutcome" AS ENUM ('PROMISE', 'DISPUTED', 'REFUSED', 'NO_ANSWER', 'WRONG_NUMBER', 'CALLBACK_REQUESTED', 'PAID');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPERADMIN';

-- DropIndex
DROP INDEX "public"."Call_externalId_key";

-- DropIndex
DROP INDEX "public"."Criteria_name_key";

-- DropIndex
DROP INDEX "public"."User_phone_key";

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "organizationId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Call" ADD COLUMN     "organizationId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Criteria" ADD COLUMN     "organizationId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "auto_calling" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "organizationId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "settings" DROP CONSTRAINT "settings_pkey",
ADD COLUMN     "autoSyncOnStartup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dataSource" "DataSource" NOT NULL DEFAULT 'PBX',
ADD COLUMN     "organizationId" INTEGER NOT NULL,
ADD COLUMN     "sipuniApiKey" VARCHAR(255),
ADD COLUMN     "sipuniApiUrl" VARCHAR(255),
ADD COLUMN     "sipuniUserId" VARCHAR(255),
ADD COLUMN     "syncSchedule" VARCHAR(50) DEFAULT '50 23 * * *',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_prompts" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_sessions" (
    "id" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'PENDING',
    "totalNumbers" INTEGER NOT NULL DEFAULT 0,
    "processedNumbers" INTEGER NOT NULL DEFAULT 0,
    "connectedCalls" INTEGER NOT NULL DEFAULT 0,
    "failedCalls" INTEGER NOT NULL DEFAULT 0,
    "remoteResponse" TEXT,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_results" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "phoneNumber" VARCHAR(32) NOT NULL,
    "callStatus" "CallResultStatus" NOT NULL,
    "callDuration" INTEGER,
    "operatorName" VARCHAR(255),
    "operatorId" TEXT,
    "callStartTime" TIMESTAMP(3),
    "callEndTime" TIMESTAMP(3),
    "recordingUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_stats" (
    "id" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
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

-- CreateTable
CREATE TABLE "monthly_stats" (
    "id" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
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

-- CreateTable
CREATE TABLE "auto_call_contacts" (
    "id" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "firstName" VARCHAR(120) NOT NULL,
    "lastName" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(32) NOT NULL,
    "dateOfBirth" DATE,
    "customData" JSONB,
    "lastConversationDate" TIMESTAMP(3),
    "lastConversationOutcome" VARCHAR(255),
    "currentConversationOutcome" VARCHAR(255),
    "isCalled" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContactStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastContactDate" TIMESTAMP(3),

    CONSTRAINT "auto_call_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_call_campaigns" (
    "id" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "campaignType" "CampaignType" NOT NULL DEFAULT 'GENERAL',
    "status" "CampaignStatus" NOT NULL DEFAULT 'PENDING',
    "totalContacts" INTEGER NOT NULL DEFAULT 0,
    "calledContacts" INTEGER NOT NULL DEFAULT 0,
    "successfulCalls" INTEGER NOT NULL DEFAULT 0,
    "failedCalls" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auto_call_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_call_campaign_contacts" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "callStatus" "CampaignCallStatus" NOT NULL DEFAULT 'PENDING',
    "callAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastCallDate" TIMESTAMP(3),
    "conversationOutcome" VARCHAR(255),
    "conversationSummary" TEXT,
    "recordingUrl" TEXT,
    "callDuration" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auto_call_campaign_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debtors" (
    "id" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "firstName" VARCHAR(120) NOT NULL,
    "lastName" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(32) NOT NULL,
    "alternatePhone" VARCHAR(32),
    "email" VARCHAR(255),
    "debtAmount" DOUBLE PRECISION NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'UZS',
    "contractNumber" VARCHAR(100) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "daysOverdue" INTEGER NOT NULL DEFAULT 0,
    "productService" VARCHAR(255) NOT NULL,
    "debtReason" TEXT,
    "status" "DebtorStatus" NOT NULL DEFAULT 'ACTIVE',
    "callAttempts" INTEGER NOT NULL DEFAULT 0,
    "maxCallAttempts" INTEGER NOT NULL DEFAULT 5,
    "lastContactDate" TIMESTAMP(3),
    "lastContactOutcome" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debtors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt_campaigns" (
    "id" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "dailyCallStartHour" INTEGER NOT NULL DEFAULT 9,
    "dailyCallEndHour" INTEGER NOT NULL DEFAULT 18,
    "maxCallsPerDay" INTEGER NOT NULL DEFAULT 100,
    "status" "DebtCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "totalDebtors" INTEGER NOT NULL DEFAULT 0,
    "calledDebtors" INTEGER NOT NULL DEFAULT 0,
    "successfulCalls" INTEGER NOT NULL DEFAULT 0,
    "failedCalls" INTEGER NOT NULL DEFAULT 0,
    "promisesReceived" INTEGER NOT NULL DEFAULT 0,
    "disputesReceived" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "debt_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt_campaign_debtors" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "debtorId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "callStatus" "DebtCallStatus" NOT NULL DEFAULT 'PENDING',
    "callAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastCallAt" TIMESTAMP(3),
    "nextCallAt" TIMESTAMP(3),
    "liveKitRoomName" TEXT,
    "pbxCallId" TEXT,
    "callDurationSeconds" INTEGER,
    "callContext" JSONB,
    "outcome" "DebtCallOutcome",
    "promisedAmount" DOUBLE PRECISION,
    "promisedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debt_campaign_debtors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "call_sessions_sessionId_key" ON "call_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "call_sessions_organizationId_idx" ON "call_sessions"("organizationId");

-- CreateIndex
CREATE INDEX "call_results_sessionId_idx" ON "call_results"("sessionId");

-- CreateIndex
CREATE INDEX "call_results_phoneNumber_idx" ON "call_results"("phoneNumber");

-- CreateIndex
CREATE INDEX "call_results_callStatus_idx" ON "call_results"("callStatus");

-- CreateIndex
CREATE INDEX "daily_stats_organizationId_idx" ON "daily_stats"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_stats_organizationId_date_extCode_key" ON "daily_stats"("organizationId", "date", "extCode");

-- CreateIndex
CREATE INDEX "monthly_stats_organizationId_idx" ON "monthly_stats"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_stats_organizationId_year_month_extCode_key" ON "monthly_stats"("organizationId", "year", "month", "extCode");

-- CreateIndex
CREATE INDEX "auto_call_contacts_organizationId_idx" ON "auto_call_contacts"("organizationId");

-- CreateIndex
CREATE INDEX "auto_call_contacts_organizationId_status_idx" ON "auto_call_contacts"("organizationId", "status");

-- CreateIndex
CREATE INDEX "auto_call_contacts_organizationId_isCalled_idx" ON "auto_call_contacts"("organizationId", "isCalled");

-- CreateIndex
CREATE UNIQUE INDEX "auto_call_contacts_organizationId_phone_key" ON "auto_call_contacts"("organizationId", "phone");

-- CreateIndex
CREATE INDEX "auto_call_campaigns_organizationId_idx" ON "auto_call_campaigns"("organizationId");

-- CreateIndex
CREATE INDEX "auto_call_campaigns_organizationId_status_idx" ON "auto_call_campaigns"("organizationId", "status");

-- CreateIndex
CREATE INDEX "auto_call_campaigns_organizationId_campaignType_idx" ON "auto_call_campaigns"("organizationId", "campaignType");

-- CreateIndex
CREATE INDEX "auto_call_campaign_contacts_campaignId_idx" ON "auto_call_campaign_contacts"("campaignId");

-- CreateIndex
CREATE INDEX "auto_call_campaign_contacts_contactId_idx" ON "auto_call_campaign_contacts"("contactId");

-- CreateIndex
CREATE INDEX "auto_call_campaign_contacts_campaignId_callStatus_idx" ON "auto_call_campaign_contacts"("campaignId", "callStatus");

-- CreateIndex
CREATE UNIQUE INDEX "auto_call_campaign_contacts_campaignId_contactId_key" ON "auto_call_campaign_contacts"("campaignId", "contactId");

-- CreateIndex
CREATE INDEX "debtors_organizationId_status_idx" ON "debtors"("organizationId", "status");

-- CreateIndex
CREATE INDEX "debtors_phone_idx" ON "debtors"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "debtors_organizationId_contractNumber_key" ON "debtors"("organizationId", "contractNumber");

-- CreateIndex
CREATE INDEX "debt_campaigns_organizationId_status_idx" ON "debt_campaigns"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "debt_campaign_debtors_liveKitRoomName_key" ON "debt_campaign_debtors"("liveKitRoomName");

-- CreateIndex
CREATE INDEX "debt_campaign_debtors_campaignId_callStatus_idx" ON "debt_campaign_debtors"("campaignId", "callStatus");

-- CreateIndex
CREATE INDEX "debt_campaign_debtors_nextCallAt_idx" ON "debt_campaign_debtors"("nextCallAt");

-- CreateIndex
CREATE INDEX "debt_campaign_debtors_liveKitRoomName_idx" ON "debt_campaign_debtors"("liveKitRoomName");

-- CreateIndex
CREATE UNIQUE INDEX "debt_campaign_debtors_campaignId_debtorId_key" ON "debt_campaign_debtors"("campaignId", "debtorId");

-- CreateIndex
CREATE INDEX "Branch_organizationId_idx" ON "Branch"("organizationId");

-- CreateIndex
CREATE INDEX "Call_organizationId_idx" ON "Call"("organizationId");

-- CreateIndex
CREATE INDEX "Call_organizationId_employeeId_idx" ON "Call"("organizationId", "employeeId");

-- CreateIndex
CREATE INDEX "Call_organizationId_status_idx" ON "Call"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Call_organizationId_callDate_idx" ON "Call"("organizationId", "callDate");

-- CreateIndex
CREATE UNIQUE INDEX "Call_organizationId_externalId_key" ON "Call"("organizationId", "externalId");

-- CreateIndex
CREATE INDEX "Criteria_organizationId_idx" ON "Criteria"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Criteria_organizationId_name_key" ON "Criteria"("organizationId", "name");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_organizationId_extCode_idx" ON "User"("organizationId", "extCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_organizationId_phone_key" ON "User"("organizationId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "settings_organizationId_key" ON "settings"("organizationId");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Criteria" ADD CONSTRAINT "Criteria_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_results" ADD CONSTRAINT "call_results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "call_sessions"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_stats" ADD CONSTRAINT "daily_stats_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_stats" ADD CONSTRAINT "monthly_stats_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_call_contacts" ADD CONSTRAINT "auto_call_contacts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_call_campaigns" ADD CONSTRAINT "auto_call_campaigns_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_call_campaign_contacts" ADD CONSTRAINT "auto_call_campaign_contacts_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "auto_call_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_call_campaign_contacts" ADD CONSTRAINT "auto_call_campaign_contacts_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "auto_call_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debtors" ADD CONSTRAINT "debtors_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_campaigns" ADD CONSTRAINT "debt_campaigns_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_campaign_debtors" ADD CONSTRAINT "debt_campaign_debtors_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "debt_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_campaign_debtors" ADD CONSTRAINT "debt_campaign_debtors_debtorId_fkey" FOREIGN KEY ("debtorId") REFERENCES "debtors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
