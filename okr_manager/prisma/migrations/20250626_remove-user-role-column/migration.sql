-- Migration: Remove 'role' column from User table and set roleId as NOT NULL

-- 1. Create a new table without the 'role' column, and with roleId as NOT NULL
CREATE TABLE "_User_new" AS SELECT * FROM "User";

-- 2. Drop the old User table
DROP TABLE "User";

-- 3. Recreate the User table without the 'role' column and with roleId as NOT NULL
CREATE TABLE "User" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "email" TEXT NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "roleId" INTEGER NOT NULL,
  "isAdmin" BOOLEAN NOT NULL DEFAULT false,
  "isLineManager" BOOLEAN NOT NULL DEFAULT false,
  "notify_preferences" TEXT NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Add other fields as needed from your schema
  FOREIGN KEY ("roleId") REFERENCES "Role"("id")
);

-- 4. Copy data back from the temp table (excluding the dropped 'role' column)
INSERT INTO "User" ("id", "email", "password_hash", "name", "roleId", "isAdmin", "isLineManager", "notify_preferences", "created_at", "updated_at")
SELECT "id", "email", "password_hash", "name", "roleId", "isAdmin", "isLineManager", "notify_preferences", "created_at", "updated_at" FROM "_User_new";

-- 5. Drop the temp table
DROP TABLE "_User_new";
