/*
  Warnings:

  - You are about to drop the column `transcriptJson` on the `Call` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[externalId]` on the table `Call` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `callDate` to the `Call` table without a default value. This is not possible if the table is not empty.
  - Added the required column `externalId` to the `Call` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Call" DROP COLUMN "transcriptJson",
ADD COLUMN     "analysis" JSONB,
ADD COLUMN     "callDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "calleeNumber" TEXT,
ADD COLUMN     "callerNumber" TEXT,
ADD COLUMN     "externalId" TEXT NOT NULL,
ADD COLUMN     "transcription" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Call_externalId_key" ON "public"."Call"("externalId");
