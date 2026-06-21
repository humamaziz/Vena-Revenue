-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CLOSER', 'DATA_MANAGER', 'VIDEO_CREATOR', 'PPT_CREATOR', 'LEAD_GEN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");

-- AlterTable: split out company/phone, add ppt link, decouple PDF bytes
-- from the row that gets fetched in bulk (see schema.prisma comment on
-- `pdfData` for why), and relax `goal` to optional since CSV-imported /
-- manually-added leads don't go through the public "goal" funnel step.
ALTER TABLE "Lead"
  ADD COLUMN "company" TEXT,
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "pdfData" BYTEA,
  ADD COLUMN "pdfGeneratedAt" TIMESTAMP(3),
  ADD COLUMN "pptUrl" TEXT,
  ADD COLUMN "createdByRole" "Role",
  ALTER COLUMN "goal" DROP NOT NULL;

-- CreateIndex (Lead) — used by admin/leads server-side filtering & sorting
CREATE INDEX "Lead_status_idx" ON "Lead"("status");
CREATE INDEX "Lead_priority_idx" ON "Lead"("priority");
CREATE INDEX "Lead_email_idx" ON "Lead"("email");
CREATE INDEX "Lead_paid_idx" ON "Lead"("paid");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
CREATE INDEX "Lead_industry_idx" ON "Lead"("industry");

-- CreateIndex (Interaction)
CREATE INDEX "Interaction_leadId_idx" ON "Interaction"("leadId");

-- CreateTable
CREATE TABLE "LeadRating" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "notes" TEXT,
    "ratedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeadRating_leadId_ratedById_key" ON "LeadRating"("leadId", "ratedById");
CREATE INDEX "LeadRating_leadId_idx" ON "LeadRating"("leadId");

-- AddForeignKey
ALTER TABLE "LeadRating" ADD CONSTRAINT "LeadRating_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeadRating" ADD CONSTRAINT "LeadRating_ratedById_fkey" FOREIGN KEY ("ratedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;