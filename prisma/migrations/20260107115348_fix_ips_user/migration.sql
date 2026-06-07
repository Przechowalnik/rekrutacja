/*
  Warnings:

  - You are about to drop the column `loginIps` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "loginIps";

-- CreateTable
CREATE TABLE "UserIp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserIp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserIp_userId_key" ON "UserIp"("userId");

-- CreateIndex
CREATE INDEX "UserIp_userId_idx" ON "UserIp"("userId");

-- CreateIndex
CREATE INDEX "UserIp_expiresAt_idx" ON "UserIp"("expiresAt");

-- AddForeignKey
ALTER TABLE "UserIp" ADD CONSTRAINT "UserIp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
