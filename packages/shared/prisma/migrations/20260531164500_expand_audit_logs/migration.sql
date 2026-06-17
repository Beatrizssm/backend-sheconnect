-- AlterTable
ALTER TABLE "AuditLog"
ADD COLUMN "entityId" TEXT,
ADD COLUMN "beforeData" JSONB,
ADD COLUMN "afterData" JSONB,
ADD COLUMN "ipAddress" TEXT;

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
