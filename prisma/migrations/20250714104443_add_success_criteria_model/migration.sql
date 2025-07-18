-- CreateTable
CREATE TABLE "SuccessCriteria" (
    "id" SERIAL NOT NULL,
    "key_result_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuccessCriteria_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SuccessCriteria" ADD CONSTRAINT "SuccessCriteria_key_result_id_fkey" FOREIGN KEY ("key_result_id") REFERENCES "KeyResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
