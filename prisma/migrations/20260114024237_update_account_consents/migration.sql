/*
  Warnings:

  - You are about to drop the column `marketingAt` on the `Consent` table. All the data in the column will be lost.
  - You are about to drop the column `shareAt` on the `Consent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Consent" DROP COLUMN "marketingAt",
DROP COLUMN "shareAt";
