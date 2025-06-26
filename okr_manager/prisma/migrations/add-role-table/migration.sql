CREATE TABLE "Role" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "description" TEXT
);

-- Insert roles
INSERT INTO "Role" ("id", "name") VALUES (1, 'Admin');
INSERT INTO "Role" ("id", "name") VALUES (2, 'Principal Development Manager');
INSERT INTO "Role" ("id", "name") VALUES (3, 'User');

-- Add nullable roleId column
ALTER TABLE "User" ADD COLUMN "roleId" INTEGER;

-- Set roleId for existing users based on their old role string
UPDATE "User" SET "roleId" = 1 WHERE "role" = 'Admin';
UPDATE "User" SET "roleId" = 2 WHERE "role" IN ('PDM', 'Principal Development Manager');
UPDATE "User" SET "roleId" = 3 WHERE "role" = 'User';

-- Set any remaining NULL roleId values to 'User' (id=3)
UPDATE "User" SET "roleId" = 3 WHERE "roleId" IS NULL;

-- The following statements are not supported by SQLite and must be handled in a future migration:
-- ALTER TABLE "User" ALTER COLUMN "roleId" SET NOT NULL;
-- ALTER TABLE "User" DROP COLUMN "role";
-- See: https://www.sqlite.org/lang_altertable.html for details.
