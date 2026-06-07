-- CreateIndex
CREATE INDEX "Listing_status_expiresAt_availableTo_idx" ON "Listing"("status", "expiresAt", "availableTo");

-- CreateIndex
CREATE INDEX "Listing_companyId_createdAt_idx" ON "Listing"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "Listing_userId_createdAt_idx" ON "Listing"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ListingImage_listingId_isDefault_idx" ON "ListingImage"("listingId", "isDefault");

-- CreateIndex
CREATE INDEX "ListingInteraction_type_createdAt_idx" ON "ListingInteraction"("type", "createdAt");

-- CreateIndex
CREATE INDEX "ListingPayment_status_createdAt_idx" ON "ListingPayment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ListingPayment_listingId_status_createdAt_idx" ON "ListingPayment"("listingId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "PointsHistory_pointsId_createdAt_idx" ON "PointsHistory"("pointsId", "createdAt");

-- CreateIndex
CREATE INDEX "User_companyId_blockedAt_idx" ON "User"("companyId", "blockedAt");
