-- CreateTable
CREATE TABLE "public"."Invite" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "lineManagerId" INTEGER NOT NULL,
    "dateSent" TIMESTAMP(3) NOT NULL,
    "dateUsed" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "public"."Invite"("token");

-- AddForeignKey
ALTER TABLE "public"."Invite" ADD CONSTRAINT "Invite_lineManagerId_fkey" FOREIGN KEY ("lineManagerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add expiresAt column as nullable
ALTER TABLE "public"."Invite" ADD COLUMN "expiresAt" TIMESTAMP(3);

-- Set expiresAt for existing rows
UPDATE "public"."Invite"
SET "expiresAt" = "dateSent" + interval '7 days'
WHERE "expiresAt" IS NULL;

-- Make expiresAt NOT NULL
ALTER TABLE "public"."Invite" ALTER COLUMN "expiresAt" SET NOT NULL;
