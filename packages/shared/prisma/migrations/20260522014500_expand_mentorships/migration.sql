CREATE TYPE "MentorshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');

ALTER TABLE "Mentorship" RENAME COLUMN "menteeId" TO "entrepreneurId";

ALTER TABLE "Mentorship"
  ADD COLUMN "title" TEXT NOT NULL DEFAULT 'Mentoria SheConnect',
  ADD COLUMN "description" TEXT NOT NULL DEFAULT 'Solicitação de mentoria criada pela plataforma SheConnect.',
  ADD COLUMN "category" TEXT NOT NULL DEFAULT 'General',
  ADD COLUMN "status" "MentorshipStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "scheduledAt" DROP NOT NULL;

ALTER INDEX IF EXISTS "Mentorship_menteeId_idx" RENAME TO "Mentorship_entrepreneurId_idx";
ALTER TABLE "Mentorship" RENAME CONSTRAINT "Mentorship_menteeId_fkey" TO "Mentorship_entrepreneurId_fkey";

CREATE INDEX "Mentorship_status_idx" ON "Mentorship"("status");
CREATE INDEX "Mentorship_category_idx" ON "Mentorship"("category");
CREATE INDEX "Mentorship_createdAt_idx" ON "Mentorship"("createdAt");
