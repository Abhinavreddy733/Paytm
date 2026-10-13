/*
  Warnings:

  - You are about to drop the column `receiverId` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `Transactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `receiverPhoneNumber` to the `Transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderPhoneNumber` to the `Transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_senderId_fkey";

-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "receiverId",
DROP COLUMN "senderId",
ADD COLUMN     "receiverPhoneNumber" INTEGER NOT NULL,
ADD COLUMN     "senderPhoneNumber" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_senderPhoneNumber_fkey" FOREIGN KEY ("senderPhoneNumber") REFERENCES "User"("phoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_receiverPhoneNumber_fkey" FOREIGN KEY ("receiverPhoneNumber") REFERENCES "User"("phoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
