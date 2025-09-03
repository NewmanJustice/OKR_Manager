-- CreateTable
CREATE TABLE "public"."LineManagerTeam" (
    "id" SERIAL NOT NULL,
    "lineManagerId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LineManagerTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LineManagerTeam_lineManagerId_userId_key" ON "public"."LineManagerTeam"("lineManagerId", "userId");

-- AddForeignKey
ALTER TABLE "public"."LineManagerTeam" ADD CONSTRAINT "LineManagerTeam_lineManagerId_fkey" FOREIGN KEY ("lineManagerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LineManagerTeam" ADD CONSTRAINT "LineManagerTeam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
