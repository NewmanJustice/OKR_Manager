-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "notify_preferences" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Team" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "service_area" TEXT NOT NULL,
    "pdm_id" INTEGER,
    "description" TEXT,
    "created_by_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Team_pdm_id_fkey" FOREIGN KEY ("pdm_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Team_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Objective" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pdm_id" INTEGER,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "objective_number" INTEGER NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "assigned_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Objective_pdm_id_fkey" FOREIGN KEY ("pdm_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Objective_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KeyResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "objective_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "target_value" REAL,
    "current_value" REAL,
    "unit" TEXT,
    "due_date" DATETIME,
    "status" TEXT NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "KeyResult_objective_id_fkey" FOREIGN KEY ("objective_id") REFERENCES "Objective" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KeyResult_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgressUpdate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key_result_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "progress_value" REAL,
    "comments" TEXT,
    "evidence_url" TEXT,
    "updated_by_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgressUpdate_key_result_id_fkey" FOREIGN KEY ("key_result_id") REFERENCES "KeyResult" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProgressUpdate_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProgressUpdate_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonthlyReview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pdm_id" INTEGER NOT NULL,
    "review_date" DATETIME NOT NULL,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "progress_summary" TEXT NOT NULL,
    "blockers_identified" TEXT NOT NULL,
    "resource_needs" TEXT NOT NULL,
    "forward_planning" TEXT NOT NULL,
    "submitted_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MonthlyReview_pdm_id_fkey" FOREIGN KEY ("pdm_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuarterlyReview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pdm_id" INTEGER NOT NULL,
    "review_date" DATETIME NOT NULL,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "okr_grading" JSONB NOT NULL,
    "lessons_learned" TEXT NOT NULL,
    "strategic_adjustments" TEXT NOT NULL,
    "next_quarter_planning" TEXT NOT NULL,
    "stakeholder_feedback" TEXT NOT NULL,
    "submitted_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuarterlyReview_pdm_id_fkey" FOREIGN KEY ("pdm_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewMeeting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "scheduled_date" DATETIME NOT NULL,
    "attendees" JSONB NOT NULL,
    "agenda" TEXT,
    "outcomes" TEXT,
    "action_items" JSONB NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
