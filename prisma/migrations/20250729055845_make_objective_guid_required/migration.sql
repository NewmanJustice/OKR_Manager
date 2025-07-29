/*
  Warnings:

  - Made the column `guid` on table `Objective` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Objective" ALTER COLUMN "guid" SET NOT NULL;
