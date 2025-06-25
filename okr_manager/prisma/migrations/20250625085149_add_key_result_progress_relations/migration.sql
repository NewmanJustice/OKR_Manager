-- CreateTable
CREATE TABLE "KeyResultProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key_result_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "metric_value" REAL,
    "evidence" TEXT,
    "comments" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "KeyResultProgress_key_result_id_fkey" FOREIGN KEY ("key_result_id") REFERENCES "KeyResult" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KeyResultProgress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "KeyResultProgress_key_result_id_user_id_month_year_key" ON "KeyResultProgress"("key_result_id", "user_id", "month", "year");
