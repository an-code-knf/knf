-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "RiskTolerance" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ConnectorType" AS ENUM ('LINKEDIN', 'GMAIL', 'CALENDAR', 'JOB_BOARDS');

-- CreateEnum
CREATE TYPE "OpportunitySource" AS ENUM ('INBOUND_EMAIL', 'APPLIED', 'REFERRAL', 'RECRUITER');

-- CreateEnum
CREATE TYPE "OpportunityStage" AS ENUM ('SAVED', 'INVITED', 'INTERVIEWING', 'OFFER', 'NEGOTIATING', 'ACCEPTED', 'DECLINED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "CompanyStage" AS ENUM ('STARTUP', 'GROWTH', 'ESTABLISHED', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "CompanyTrajectory" AS ENUM ('SLOWING', 'STABLE', 'GROWING');

-- CreateEnum
CREATE TYPE "Recommendation" AS ENUM ('INTERVIEW', 'SKIP');

-- CreateEnum
CREATE TYPE "CareerEventType" AS ENUM ('INTERVIEW', 'REJECTION', 'OFFER', 'NEGOTIATION', 'MANAGER_CHANGE', 'PROMOTION', 'ACHIEVEMENT', 'CV_VERSION', 'PERFORMANCE_REVIEW', 'SALARY_CHANGE', 'STAGE_CHANGE', 'NOTE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "Tier" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentEmployer" TEXT,
    "currentTitle" TEXT,
    "currentSalary" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'DKK',
    "commuteMinutes" INTEGER,
    "industry" TEXT,
    "location" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "yearsExperience" INTEGER,
    "familySituation" TEXT,
    "careerGoals" TEXT,
    "riskTolerance" "RiskTolerance" NOT NULL DEFAULT 'MEDIUM',
    "cvText" TEXT,
    "cvUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Connector" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ConnectorType" NOT NULL,
    "connected" BOOLEAN NOT NULL DEFAULT false,
    "connectedAt" TIMESTAMP(3),
    "syncedData" JSONB,

    CONSTRAINT "Connector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketBenchmark" (
    "id" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "p25Salary" INTEGER NOT NULL,
    "medianSalary" INTEGER NOT NULL,
    "p75Salary" INTEGER NOT NULL,
    "yoyGrowthPct" DOUBLE PRECISION NOT NULL,
    "demandIndex" INTEGER NOT NULL,
    "openRolesCount" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketBenchmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "source" "OpportunitySource" NOT NULL DEFAULT 'APPLIED',
    "stage" "OpportunityStage" NOT NULL DEFAULT 'SAVED',
    "industry" TEXT,
    "salaryEstimateMin" INTEGER,
    "salaryEstimateMax" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'DKK',
    "commuteMinutes" INTEGER,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "companyStage" "CompanyStage",
    "companyTrajectory" "CompanyTrajectory",
    "leadershipRating" INTEGER,
    "promotionOutlook" INTEGER,
    "learningRating" INTEGER,
    "vacationDays" INTEGER,
    "pensionPct" DOUBLE PRECISION,
    "notes" TEXT,
    "hiringManager" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "recommendation" "Recommendation" NOT NULL,
    "confidence" INTEGER NOT NULL,
    "pros" TEXT[],
    "cons" TEXT[],
    "rationale" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "baseSalary" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'DKK',
    "bonusPct" DOUBLE PRECISION,
    "signOnBonus" INTEGER,
    "pensionPct" DOUBLE PRECISION,
    "vacationDays" INTEGER,
    "equity" TEXT,
    "remotePolicy" TEXT,
    "benefitsNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comparison" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "rows" JSONB NOT NULL,
    "fiveYearStayEarnings" INTEGER NOT NULL,
    "fiveYearNewEarnings" INTEGER NOT NULL,
    "recommendation" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NegotiationDraft" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "targetSalary" INTEGER NOT NULL,
    "asks" JSONB NOT NULL,
    "emailDraft" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NegotiationDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "type" "CareerEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Connector_userId_type_key" ON "Connector"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "MarketBenchmark_industry_title_region_key" ON "MarketBenchmark"("industry", "title", "region");

-- CreateIndex
CREATE UNIQUE INDEX "Decision_opportunityId_key" ON "Decision"("opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_opportunityId_key" ON "Offer"("opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "Comparison_opportunityId_key" ON "Comparison"("opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "NegotiationDraft_opportunityId_key" ON "NegotiationDraft"("opportunityId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connector" ADD CONSTRAINT "Connector_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NegotiationDraft" ADD CONSTRAINT "NegotiationDraft_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerEvent" ADD CONSTRAINT "CareerEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerEvent" ADD CONSTRAINT "CareerEvent_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
