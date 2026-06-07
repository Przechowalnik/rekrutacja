/*
  Warnings:

  - You are about to drop the column `contactInteractionIps` on the `Listing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "contactInteractionIps",
ADD COLUMN     "contactInteractions" INTEGER NOT NULL DEFAULT 0;
