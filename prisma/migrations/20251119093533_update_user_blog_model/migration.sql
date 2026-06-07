-- DropForeignKey
ALTER TABLE "public"."Blog" DROP CONSTRAINT "Blog_createdByUserId_fkey";

-- AlterTable
ALTER TABLE "Blog" ALTER COLUMN "createdByUserId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
