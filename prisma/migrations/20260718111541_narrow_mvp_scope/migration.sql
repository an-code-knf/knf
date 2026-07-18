/*
  Warnings:

  - You are about to drop the column `currentCompanyStabilityRating` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `currentManagerRating` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `currentPensionPct` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `currentVacationDays` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `tier` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `CareerEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comparison` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Decision` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MarketBenchmark` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NegotiationDraft` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Offer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Opportunity` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CareerEvent" DROP CONSTRAINT "CareerEvent_opportunityId_fkey";

-- DropForeignKey
ALTER TABLE "CareerEvent" DROP CONSTRAINT "CareerEvent_userId_fkey";

-- DropForeignKey
ALTER TABLE "Comparison" DROP CONSTRAINT "Comparison_opportunityId_fkey";

-- DropForeignKey
ALTER TABLE "Decision" DROP CONSTRAINT "Decision_opportunityId_fkey";

-- DropForeignKey
ALTER TABLE "NegotiationDraft" DROP CONSTRAINT "NegotiationDraft_opportunityId_fkey";

-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_opportunityId_fkey";

-- DropForeignKey
ALTER TABLE "Opportunity" DROP CONSTRAINT "Opportunity_userId_fkey";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "currentCompanyStabilityRating",
DROP COLUMN "currentManagerRating",
DROP COLUMN "currentPensionPct",
DROP COLUMN "currentVacationDays";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "tier";

-- DropTable
DROP TABLE "CareerEvent";

-- DropTable
DROP TABLE "Comparison";

-- DropTable
DROP TABLE "Decision";

-- DropTable
DROP TABLE "MarketBenchmark";

-- DropTable
DROP TABLE "NegotiationDraft";

-- DropTable
DROP TABLE "Offer";

-- DropTable
DROP TABLE "Opportunity";

-- DropEnum
DROP TYPE "CareerEventType";

-- DropEnum
DROP TYPE "CompanyStage";

-- DropEnum
DROP TYPE "CompanyTrajectory";

-- DropEnum
DROP TYPE "OpportunitySource";

-- DropEnum
DROP TYPE "OpportunityStage";

-- DropEnum
DROP TYPE "Recommendation";

-- DropEnum
DROP TYPE "Tier";
