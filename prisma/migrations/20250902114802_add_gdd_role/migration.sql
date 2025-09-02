-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "gddRoleId" INTEGER;

-- CreateTable
CREATE TABLE "public"."GddRole" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "GddRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GddRole_name_key" ON "public"."GddRole"("name");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_gddRoleId_fkey" FOREIGN KEY ("gddRoleId") REFERENCES "public"."GddRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;
