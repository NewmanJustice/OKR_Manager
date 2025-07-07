-- AlterTable
ALTER TABLE "Objective" ADD COLUMN     "professionId" INTEGER;

-- AddForeignKey
ALTER TABLE "Objective" ADD CONSTRAINT "Objective_professionId_fkey" FOREIGN KEY ("professionId") REFERENCES "Profession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
