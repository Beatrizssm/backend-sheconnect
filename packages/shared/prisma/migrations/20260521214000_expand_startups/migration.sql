ALTER TABLE "Startup" RENAME COLUMN "ownerId" TO "founderId";

ALTER TABLE "Startup"
  ADD COLUMN "category" TEXT NOT NULL DEFAULT 'General',
  ADD COLUMN "stage" TEXT NOT NULL DEFAULT 'Idea',
  ADD COLUMN "website" TEXT,
  ADD COLUMN "linkedin" TEXT,
  ADD COLUMN "instagram" TEXT,
  ADD COLUMN "pitch" TEXT,
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER INDEX IF EXISTS "Startup_ownerId_idx" RENAME TO "Startup_founderId_idx";
ALTER TABLE "Startup" RENAME CONSTRAINT "Startup_ownerId_fkey" TO "Startup_founderId_fkey";

CREATE INDEX "Startup_category_idx" ON "Startup"("category");
CREATE INDEX "Startup_stage_idx" ON "Startup"("stage");
CREATE INDEX "Startup_createdAt_idx" ON "Startup"("createdAt");
