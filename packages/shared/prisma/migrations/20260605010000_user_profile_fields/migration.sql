-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NOT_VERIFIED', 'PENDING', 'VERIFIED');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "professionalName" TEXT,
ADD COLUMN "area" TEXT,
ADD COLUMN "state" TEXT,
ADD COLUMN "instagram" TEXT,
ADD COLUMN "website" TEXT,
ADD COLUMN "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
ADD COLUMN "verificationDocument" TEXT;
