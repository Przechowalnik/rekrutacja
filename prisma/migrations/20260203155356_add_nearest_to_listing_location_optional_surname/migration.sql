/*
  Warnings:

  - You are about to drop the column `nearestCityId` on the `Listing` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_nearestCityId_fkey";

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "nearestCityId",
ADD COLUMN     "cityId" TEXT;

-- AlterTable
ALTER TABLE "ListingLocation" ADD COLUMN     "nearestCityId" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastName" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ListingLocation" ADD CONSTRAINT "ListingLocation_nearestCityId_fkey" FOREIGN KEY ("nearestCityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
