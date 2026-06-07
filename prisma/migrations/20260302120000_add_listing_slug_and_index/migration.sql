-- Add listingIndex as a serial (auto-assigns sequential values to existing rows)
ALTER TABLE "Listing" ADD COLUMN "listingIndex" SERIAL;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_listingIndex_key" UNIQUE ("listingIndex");

-- Add slug as nullable text initially
ALTER TABLE "Listing" ADD COLUMN "slug" TEXT;

-- Populate slug for existing listings:
-- Converts title to lowercase ASCII slug (Polish chars removed, spaces->dashes) + listingIndex suffix for uniqueness
UPDATE "Listing" SET "slug" =
  CASE
    WHEN trim(both '-' from regexp_replace(lower(trim("title")), '[^a-z0-9]+', '-', 'g')) = ''
    THEN 'ogloszenie-' || CAST("listingIndex" AS TEXT)
    ELSE trim(both '-' from regexp_replace(lower(trim("title")), '[^a-z0-9]+', '-', 'g')) || '-' || CAST("listingIndex" AS TEXT)
  END;

-- Make slug required and unique
ALTER TABLE "Listing" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_slug_key" UNIQUE ("slug");
