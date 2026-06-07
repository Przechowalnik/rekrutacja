/*
  Warnings:

  - The values [ON_REQUEST_ACCESS] on the enum `ListingAccess` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ListingAccess_new" AS ENUM ('ACCESS_24H', 'LIMITED_HOURS');
ALTER TABLE "Listing" ALTER COLUMN "access" TYPE "ListingAccess_new" USING ("access"::text::"ListingAccess_new");
ALTER TYPE "ListingAccess" RENAME TO "ListingAccess_old";
ALTER TYPE "ListingAccess_new" RENAME TO "ListingAccess";
DROP TYPE "public"."ListingAccess_old";
COMMIT;

-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "condition" DROP NOT NULL;
