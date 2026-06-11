-- AlterEnum
ALTER TYPE "VerificationStatus" ADD VALUE IF NOT EXISTS 'REJECTED';

-- AlterTable
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "verifiedBy" UUID,
ADD COLUMN IF NOT EXISTS "verificationReason" TEXT,
ADD COLUMN IF NOT EXISTS "verificationNotes" TEXT;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'User_verifiedBy_fkey'
  ) THEN
    ALTER TABLE "User"
    ADD CONSTRAINT "User_verifiedBy_fkey"
    FOREIGN KEY ("verifiedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_verificationStatus_idx" ON "User"("verificationStatus");

-- CreateTable
CREATE TABLE IF NOT EXISTS "UserReport" (
    "id" UUID NOT NULL,
    "reporterId" UUID NOT NULL,
    "reportedUserId" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserReport_reportedUserId_idx" ON "UserReport"("reportedUserId");
CREATE INDEX IF NOT EXISTS "UserReport_reporterId_idx" ON "UserReport"("reporterId");
CREATE INDEX IF NOT EXISTS "UserReport_status_idx" ON "UserReport"("status");
CREATE INDEX IF NOT EXISTS "UserReport_createdAt_idx" ON "UserReport"("createdAt");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'UserReport_reporterId_fkey'
  ) THEN
    ALTER TABLE "UserReport"
    ADD CONSTRAINT "UserReport_reporterId_fkey"
    FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'UserReport_reportedUserId_fkey'
  ) THEN
    ALTER TABLE "UserReport"
    ADD CONSTRAINT "UserReport_reportedUserId_fkey"
    FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
