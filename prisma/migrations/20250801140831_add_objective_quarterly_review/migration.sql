-- CreateTable
CREATE TABLE "public"."ObjectiveQuarterlyReview" (
    "id" SERIAL NOT NULL,
    "objectiveId" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "grading" DOUBLE PRECISION,
    "lessonsLearned" TEXT,
    "strategicAdjustment" TEXT,
    "nextQuarterPlanning" TEXT,
    "engagement" TEXT,
    "actionCompletion" TEXT,
    "strategicAlignment" TEXT,
    "feedbackQuality" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObjectiveQuarterlyReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ObjectiveQuarterlyReview_objectiveId_quarter_year_key" ON "public"."ObjectiveQuarterlyReview"("objectiveId", "quarter", "year");

-- AddForeignKey
ALTER TABLE "public"."ObjectiveQuarterlyReview" ADD CONSTRAINT "ObjectiveQuarterlyReview_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "public"."Objective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
