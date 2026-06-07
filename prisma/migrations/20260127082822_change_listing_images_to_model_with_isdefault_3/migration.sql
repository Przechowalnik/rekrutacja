/*
  Warnings:

  - Made the column `listingId` on table `ListingImage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ListingImage" ALTER COLUMN "listingId" SET NOT NULL;
