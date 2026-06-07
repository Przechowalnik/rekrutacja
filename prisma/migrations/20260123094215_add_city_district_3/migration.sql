/*
  Warnings:

  - A unique constraint covering the columns `[nameSearch]` on the table `City` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "City_nameSearch_key" ON "City"("nameSearch");
