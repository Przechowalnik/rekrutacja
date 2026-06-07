-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "nearestCityId" TEXT;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_nearestCityId_fkey" FOREIGN KEY ("nearestCityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
