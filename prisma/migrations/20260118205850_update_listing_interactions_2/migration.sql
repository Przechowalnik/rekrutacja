/*
  Warnings:

  - You are about to drop the column `companyId` on the `ListingInteraction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ListingInteraction" DROP CONSTRAINT "ListingInteraction_companyId_fkey";

-- DropIndex
DROP INDEX "ListingInteraction_listingId_companyId_idx";

-- AlterTable
ALTER TABLE "ListingInteraction" DROP COLUMN "companyId",
ADD COLUMN     "ownerCompanyId" TEXT,
ADD COLUMN     "ownerUserId" TEXT;

-- CreateIndex
CREATE INDEX "ListingInteraction_listingId_ownerCompanyId_idx" ON "ListingInteraction"("listingId", "ownerCompanyId");

-- CreateIndex
CREATE INDEX "ListingInteraction_ownerCompanyId_type_createdAt_idx" ON "ListingInteraction"("ownerCompanyId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "ListingInteraction_ownerUserId_type_createdAt_idx" ON "ListingInteraction"("ownerUserId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "ListingInteraction_userId_type_createdAt_idx" ON "ListingInteraction"("userId", "type", "createdAt");

-- AddForeignKey
ALTER TABLE "ListingInteraction" ADD CONSTRAINT "ListingInteraction_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingInteraction" ADD CONSTRAINT "ListingInteraction_ownerCompanyId_fkey" FOREIGN KEY ("ownerCompanyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
