/*
  Warnings:

  - You are about to drop the column `contactInteractions` on the `Listing` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ListingInteractionType" AS ENUM ('CONTACT', 'VIEW');

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "contactInteractions";

-- CreateTable
CREATE TABLE "ListingInteraction" (
    "id" TEXT NOT NULL,
    "listingId" TEXT,
    "userId" TEXT,
    "companyId" TEXT NOT NULL,
    "type" "ListingInteractionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ListingInteraction_listingId_idx" ON "ListingInteraction"("listingId");

-- CreateIndex
CREATE INDEX "ListingInteraction_listingId_companyId_idx" ON "ListingInteraction"("listingId", "companyId");

-- AddForeignKey
ALTER TABLE "ListingInteraction" ADD CONSTRAINT "ListingInteraction_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingInteraction" ADD CONSTRAINT "ListingInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingInteraction" ADD CONSTRAINT "ListingInteraction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
