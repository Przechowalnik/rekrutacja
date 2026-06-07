/*
  Warnings:

  - Changed the type of `city` on the `ListingLocation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ListingLocation" DROP COLUMN "city",
ADD COLUMN     "city" TEXT NOT NULL,
ALTER COLUMN "district" DROP NOT NULL;

-- DropEnum
DROP TYPE "Cities";

-- CreateIndex
CREATE INDEX "ListingLocation_city_idx" ON "ListingLocation"("city");

-- CreateIndex
CREATE INDEX "ListingLocation_city_district_idx" ON "ListingLocation"("city", "district");
