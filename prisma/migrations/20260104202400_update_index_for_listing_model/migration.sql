-- DropIndex
DROP INDEX "Listing_companyId_idx";

-- DropIndex
DROP INDEX "Listing_companyId_status_idx";

-- DropIndex
DROP INDEX "Listing_userId_idx";

-- DropIndex
DROP INDEX "Listing_userId_status_idx";

-- DropIndex
DROP INDEX "ListingLocation_listingId_idx";

-- CreateIndex
CREATE INDEX "Listing_status_category_createdAt_idx" ON "Listing"("status", "category", "createdAt");

-- CreateIndex
CREATE INDEX "Listing_status_category_expiresAt_idx" ON "Listing"("status", "category", "expiresAt");

-- CreateIndex
CREATE INDEX "Listing_status_category_availableTo_idx" ON "Listing"("status", "category", "availableTo");

-- CreateIndex
CREATE INDEX "Listing_status_category_type_createdAt_idx" ON "Listing"("status", "category", "type", "createdAt");

-- CreateIndex
CREATE INDEX "Listing_status_category_type_expiresAt_idx" ON "Listing"("status", "category", "type", "expiresAt");

-- CreateIndex
CREATE INDEX "Listing_userId_status_expiresAt_idx" ON "Listing"("userId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "Listing_companyId_status_expiresAt_idx" ON "Listing"("companyId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "ListingLocation_city_idx" ON "ListingLocation"("city");

-- CreateIndex
CREATE INDEX "ListingLocation_city_district_idx" ON "ListingLocation"("city", "district");

-- CreateIndex
CREATE INDEX "ListingLocation_lat_lng_idx" ON "ListingLocation"("lat", "lng");
