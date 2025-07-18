/*
  Warnings:

  - A unique constraint covering the columns `[user_id,quarter,year]` on the table `QuarterlyReview` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "QuarterlyReview" DROP CONSTRAINT "QuarterlyReview_pdm_id_fkey";

-- AlterTable
ALTER TABLE "QuarterlyReview" ADD COLUMN     "user_id" INTEGER,
ALTER COLUMN "pdm_id" DROP NOT NULL,
ALTER COLUMN "review_date" DROP NOT NULL,
ALTER COLUMN "stakeholder_feedback" DROP NOT NULL,
ALTER COLUMN "submitted_at" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "QuarterlyReview_user_id_quarter_year_key" ON "QuarterlyReview"("user_id", "quarter", "year");

-- AddForeignKey
ALTER TABLE "QuarterlyReview" ADD CONSTRAINT "QuarterlyReview_pdm_id_fkey" FOREIGN KEY ("pdm_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuarterlyReview" ADD CONSTRAINT "QuarterlyReview_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
