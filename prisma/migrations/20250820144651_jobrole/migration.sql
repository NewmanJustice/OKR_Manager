-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "jobRoleId" INTEGER;

-- CreateTable
CREATE TABLE "public"."JobRole" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobRole_name_key" ON "public"."JobRole"("name");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "public"."JobRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;
