-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "bio" TEXT,
ADD COLUMN "linkedin" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "profileImage" TEXT,
ADD COLUMN "specialty" TEXT,
ADD COLUMN "experienceYears" INTEGER,
ADD COLUMN "refreshTokenHash" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Startup"
ADD COLUMN "investmentGoal" DECIMAL(14,2),
ADD COLUMN "valuation" DECIMAL(14,2),
ADD COLUMN "city" TEXT;

-- AlterTable
ALTER TABLE "Mentorship"
ADD COLUMN "startupId" UUID,
ADD COLUMN "feedback" TEXT,
ADD COLUMN "rating" INTEGER;

-- AlterTable
ALTER TABLE "AuditLog"
ADD COLUMN "oldValue" JSONB,
ADD COLUMN "newValue" JSONB,
ADD COLUMN "userAgent" TEXT;

-- AlterTable
ALTER TABLE "Event"
ADD COLUMN "type" TEXT,
ADD COLUMN "speaker" TEXT;

-- CreateTable
CREATE TABLE "UserConnection" (
    "id" UUID NOT NULL,
    "requesterId" UUID NOT NULL,
    "receiverId" UUID NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_city_idx" ON "User"("city");

-- CreateIndex
CREATE INDEX "Mentorship_startupId_idx" ON "Mentorship"("startupId");

-- CreateIndex
CREATE UNIQUE INDEX "UserConnection_requesterId_receiverId_key" ON "UserConnection"("requesterId", "receiverId");

-- CreateIndex
CREATE INDEX "UserConnection_requesterId_idx" ON "UserConnection"("requesterId");

-- CreateIndex
CREATE INDEX "UserConnection_receiverId_idx" ON "UserConnection"("receiverId");

-- CreateIndex
CREATE INDEX "UserConnection_status_idx" ON "UserConnection"("status");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");

-- CreateIndex
CREATE INDEX "UserSession_revokedAt_idx" ON "UserSession"("revokedAt");

-- CreateIndex
CREATE INDEX "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");

-- AddForeignKey
ALTER TABLE "Mentorship" ADD CONSTRAINT "Mentorship_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConnection" ADD CONSTRAINT "UserConnection_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConnection" ADD CONSTRAINT "UserConnection_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
