/*
  Warnings:

  - A unique constraint covering the columns `[userId,value]` on the table `UserIp` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserIp_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "UserIp_userId_value_key" ON "UserIp"("userId", "value");
