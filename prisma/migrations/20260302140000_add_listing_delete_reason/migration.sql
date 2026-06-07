-- CreateEnum
CREATE TYPE "ListingDeleteReason" AS ENUM ('SOLD', 'RENTED', 'NO_LONGER_AVAILABLE', 'CHANGED_MIND', 'DUPLICATE', 'OTHER');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "deleteReason" "ListingDeleteReason";
