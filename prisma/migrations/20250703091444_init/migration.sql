-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isLineManager" BOOLEAN NOT NULL DEFAULT false,
    "notify_preferences" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resetAttempts" INTEGER NOT NULL DEFAULT 0,
    "resetLockoutUntil" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifyToken" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "service_area" TEXT NOT NULL,
    "pdm_id" INTEGER,
    "description" TEXT,
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objective" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pdm_id" INTEGER,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "objective_number" INTEGER NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Objective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyResult" (
    "id" SERIAL NOT NULL,
    "objective_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "target_value" DOUBLE PRECISION,
    "current_value" DOUBLE PRECISION,
    "unit" TEXT,
    "due_date" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "success_criteria" TEXT,

    CONSTRAINT "KeyResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressUpdate" (
    "id" SERIAL NOT NULL,
    "key_result_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "progress_value" DOUBLE PRECISION,
    "comments" TEXT,
    "evidence_url" TEXT,
    "updated_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyReview" (
    "id" SERIAL NOT NULL,
    "pdm_id" INTEGER NOT NULL,
    "review_date" TIMESTAMP(3) NOT NULL,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "progress_summary" TEXT NOT NULL,
    "blockers_identified" TEXT NOT NULL,
    "resource_needs" TEXT NOT NULL,
    "forward_planning" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuarterlyReview" (
    "id" SERIAL NOT NULL,
    "pdm_id" INTEGER NOT NULL,
    "review_date" TIMESTAMP(3) NOT NULL,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "okr_grading" JSONB NOT NULL,
    "lessons_learned" TEXT NOT NULL,
    "strategic_adjustments" TEXT NOT NULL,
    "next_quarter_planning" TEXT NOT NULL,
    "stakeholder_feedback" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuarterlyReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewMeeting" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "attendees" JSONB NOT NULL,
    "agenda" TEXT,
    "outcomes" TEXT,
    "action_items" JSONB NOT NULL,

    CONSTRAINT "ReviewMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OkrAssignment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "okrId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OkrAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMembership" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyResultProgress" (
    "id" SERIAL NOT NULL,
    "key_result_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "metric_value" DOUBLE PRECISION,
    "evidence" TEXT,
    "comments" TEXT,
    "blockers" TEXT,
    "resources_needed" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeyResultProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleDescription" (
    "id" SERIAL NOT NULL,
    "roleName" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "RoleDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OkrAssignment_userId_okrId_key" ON "OkrAssignment"("userId", "okrId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMembership_adminId_userId_key" ON "TeamMembership"("adminId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "RoleDescription_roleName_key" ON "RoleDescription"("roleName");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_pdm_id_fkey" FOREIGN KEY ("pdm_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objective" ADD CONSTRAINT "Objective_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objective" ADD CONSTRAINT "Objective_pdm_id_fkey" FOREIGN KEY ("pdm_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyResult" ADD CONSTRAINT "KeyResult_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyResult" ADD CONSTRAINT "KeyResult_objective_id_fkey" FOREIGN KEY ("objective_id") REFERENCES "Objective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressUpdate" ADD CONSTRAINT "ProgressUpdate_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressUpdate" ADD CONSTRAINT "ProgressUpdate_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressUpdate" ADD CONSTRAINT "ProgressUpdate_key_result_id_fkey" FOREIGN KEY ("key_result_id") REFERENCES "KeyResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyReview" ADD CONSTRAINT "MonthlyReview_pdm_id_fkey" FOREIGN KEY ("pdm_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuarterlyReview" ADD CONSTRAINT "QuarterlyReview_pdm_id_fkey" FOREIGN KEY ("pdm_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OkrAssignment" ADD CONSTRAINT "OkrAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OkrAssignment" ADD CONSTRAINT "OkrAssignment_okrId_fkey" FOREIGN KEY ("okrId") REFERENCES "Objective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyResultProgress" ADD CONSTRAINT "KeyResultProgress_key_result_id_fkey" FOREIGN KEY ("key_result_id") REFERENCES "KeyResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyResultProgress" ADD CONSTRAINT "KeyResultProgress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
