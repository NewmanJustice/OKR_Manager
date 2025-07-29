/*
  Warnings:

  - A unique constraint covering the columns `[guid]` on the table `Objective` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Objective" ADD COLUMN     "guid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Objective_guid_key" ON "Objective"("guid");
