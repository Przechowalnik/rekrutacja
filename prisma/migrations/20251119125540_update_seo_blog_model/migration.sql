/*
  Warnings:

  - Added the required column `descriptionSeo` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleSeo` to the `Blog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "descriptionSeo" TEXT NOT NULL,
ADD COLUMN     "titleSeo" TEXT NOT NULL;
