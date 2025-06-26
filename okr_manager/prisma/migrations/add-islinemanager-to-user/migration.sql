-- Add isLineManager boolean field to User table with default false
ALTER TABLE "User" ADD COLUMN "isLineManager" BOOLEAN NOT NULL DEFAULT false;
