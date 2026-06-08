-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "showEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showPhone" BOOLEAN NOT NULL DEFAULT true;
