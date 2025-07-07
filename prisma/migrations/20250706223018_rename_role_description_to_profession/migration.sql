/*
  Warnings:

  - You are about to drop the `RoleDescription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "RoleDescription";

-- CreateTable
CREATE TABLE "Profession" (
    "id" SERIAL NOT NULL,
    "roleName" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Profession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profession_roleName_key" ON "Profession"("roleName");
