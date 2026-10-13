/*
  Warnings:

  - Added the required column `accountPin` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountPin" INTEGER NOT NULL;
