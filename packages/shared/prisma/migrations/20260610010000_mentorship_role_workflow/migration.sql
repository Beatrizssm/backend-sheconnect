-- CreateEnum
CREATE TYPE "MentorshipStatus_new" AS ENUM (
  'SOLICITADA',
  'EM_ANALISE',
  'ACEITA',
  'REJEITADA',
  'AGENDADA',
  'EM_ANDAMENTO',
  'CONCLUIDA',
  'CANCELADA'
);

-- AlterTable: migrate status column
ALTER TABLE "Mentorship" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Mentorship"
ALTER COLUMN "status" TYPE "MentorshipStatus_new"
USING (
  CASE "status"::text
    WHEN 'PENDING' THEN 'SOLICITADA'
    WHEN 'ACCEPTED' THEN 'ACEITA'
    WHEN 'REJECTED' THEN 'REJEITADA'
    WHEN 'COMPLETED' THEN 'CONCLUIDA'
    WHEN 'CANCELLED' THEN 'CANCELADA'
    ELSE 'SOLICITADA'
  END
)::"MentorshipStatus_new";

DROP TYPE "MentorshipStatus";
ALTER TYPE "MentorshipStatus_new" RENAME TO "MentorshipStatus";
ALTER TABLE "Mentorship" ALTER COLUMN "status" SET DEFAULT 'SOLICITADA';

-- AlterTable: new mentorship fields
ALTER TABLE "Mentorship"
ADD COLUMN "mentorshipArea" TEXT,
ADD COLUMN "initialMessage" TEXT,
ADD COLUMN "completedAt" TIMESTAMP(3),
ADD COLUMN "rejectionReason" TEXT;

UPDATE "Mentorship"
SET
  "mentorshipArea" = COALESCE("mentorshipArea", "category"),
  "initialMessage" = COALESCE("initialMessage", "description")
WHERE "mentorshipArea" IS NULL OR "initialMessage" IS NULL;

UPDATE "Mentorship"
SET "completedAt" = "updatedAt"
WHERE "status" = 'CONCLUIDA' AND "completedAt" IS NULL;

UPDATE "Mentorship"
SET "status" = 'AGENDADA'
WHERE "status" = 'ACEITA' AND "scheduledAt" IS NOT NULL;

-- CreateTable
CREATE TABLE "StartupFavorite" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "startupId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StartupFavorite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StartupFavorite_userId_startupId_key" ON "StartupFavorite"("userId", "startupId");
CREATE INDEX "StartupFavorite_userId_idx" ON "StartupFavorite"("userId");
CREATE INDEX "StartupFavorite_startupId_idx" ON "StartupFavorite"("startupId");

ALTER TABLE "StartupFavorite"
ADD CONSTRAINT "StartupFavorite_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StartupFavorite"
ADD CONSTRAINT "StartupFavorite_startupId_fkey"
FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
