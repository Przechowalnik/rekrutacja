/*
  Warnings:

  - The values [STORAGE] on the enum `ListingPlotType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ListingPlotType_new" AS ENUM ('FOREST', 'SERVICE', 'AGRICULTURAL', 'BUILDING', 'INVESTMENT', 'RECREATIONAL');
ALTER TABLE "Listing" ALTER COLUMN "plotType" TYPE "ListingPlotType_new" USING ("plotType"::text::"ListingPlotType_new");
ALTER TYPE "ListingPlotType" RENAME TO "ListingPlotType_old";
ALTER TYPE "ListingPlotType_new" RENAME TO "ListingPlotType";
DROP TYPE "public"."ListingPlotType_old";
COMMIT;
