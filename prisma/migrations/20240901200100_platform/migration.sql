/*
  Warnings:

  - Added the required column `platform` to the `HighScore` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PLATFORM" AS ENUM ('MOBILE', 'DESKTOP');

-- AlterTable
ALTER TABLE "HighScore" ADD COLUMN     "platform" "PLATFORM" NOT NULL;
