-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "currentCompanyStabilityRating" INTEGER,
ADD COLUMN     "currentLearningRating" INTEGER,
ADD COLUMN     "currentManagerRating" INTEGER,
ADD COLUMN     "currentPensionPct" DOUBLE PRECISION,
ADD COLUMN     "currentPromotionOutlook" INTEGER,
ADD COLUMN     "currentVacationDays" INTEGER;
