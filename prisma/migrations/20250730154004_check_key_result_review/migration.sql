-- CreateTable
CREATE TABLE "public"."KeyResultReview" (
    "id" SERIAL NOT NULL,
    "keyResultId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeyResultReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KeyResultReview_keyResultId_month_year_key" ON "public"."KeyResultReview"("keyResultId", "month", "year");

-- AddForeignKey
ALTER TABLE "public"."KeyResultReview" ADD CONSTRAINT "KeyResultReview_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "public"."KeyResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
