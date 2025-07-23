-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isLineManager" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSuperUser" BOOLEAN NOT NULL DEFAULT false;
