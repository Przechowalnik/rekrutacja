-- CreateIndex
CREATE INDEX "City_lat_lng_idx" ON "City"("lat", "lng");

-- CreateIndex
CREATE INDEX "City_lat_idx" ON "City"("lat");

-- CreateIndex
CREATE INDEX "City_lng_idx" ON "City"("lng");
