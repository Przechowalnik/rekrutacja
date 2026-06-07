-- CreateEnum
CREATE TYPE "ListingContainerType" AS ENUM ('MARINE', 'WAREHOUSE', 'OFFICE_SOCIAL', 'SANITARY', 'REFRIGERATED', 'MODULAR_RESIDENTIAL');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "containerType" "ListingContainerType";
