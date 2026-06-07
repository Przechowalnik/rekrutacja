/*
  Warnings:

  - Changed the type of `type` on the `Report` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('ILLEGAL_CONTENT', 'SCAM_FRAUD', 'MISLEADING_INFO', 'SPAM', 'OFFENSIVE_CONTENT', 'WRONG_CATEGORY', 'OTHER');

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "type",
ADD COLUMN     "type" "ReportType" NOT NULL;

-- DropEnum
DROP TYPE "public"."ListingReportType";
