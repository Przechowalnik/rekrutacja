/*
  Warnings:

  - The values [BANQUET_HALL] on the enum `ListingUnitType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ListingUnitType_new" AS ENUM ('WAREHOUSE', 'RETAIL', 'SERVICE', 'PRODUCTION', 'OFFICE', 'CONFERENCE_ROOM');
ALTER TABLE "Listing" ALTER COLUMN "unitType" TYPE "ListingUnitType_new" USING ("unitType"::text::"ListingUnitType_new");
ALTER TYPE "ListingUnitType" RENAME TO "ListingUnitType_old";
ALTER TYPE "ListingUnitType_new" RENAME TO "ListingUnitType";
DROP TYPE "public"."ListingUnitType_old";
COMMIT;
