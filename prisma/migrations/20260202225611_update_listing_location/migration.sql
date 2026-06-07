/*
  Warnings:

  - You are about to drop the column `city` on the `ListingLocation` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `ListingLocation` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ListingLocation_city_district_idx";

-- DropIndex
DROP INDEX "ListingLocation_city_idx";

-- AlterTable
ALTER TABLE "ListingLocation" DROP COLUMN "city",
DROP COLUMN "district",
ADD COLUMN     "cityCustom" TEXT,
ADD COLUMN     "cityId" TEXT,
ADD COLUMN     "districtId" TEXT;

-- CreateIndex
CREATE INDEX "ListingLocation_cityId_idx" ON "ListingLocation"("cityId");

-- CreateIndex
CREATE INDEX "ListingLocation_districtId_idx" ON "ListingLocation"("districtId");

-- CreateIndex
CREATE INDEX "ListingLocation_cityId_districtId_idx" ON "ListingLocation"("cityId", "districtId");

-- AddForeignKey
ALTER TABLE "ListingLocation" ADD CONSTRAINT "ListingLocation_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingLocation" ADD CONSTRAINT "ListingLocation_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;
