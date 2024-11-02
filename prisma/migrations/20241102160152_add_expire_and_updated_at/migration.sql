/*
  Warnings:

  - Added the required column `expires_in` to the `zoom_access_token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `update_at` to the `zoom_access_token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "zoom_access_token" ADD COLUMN     "expires_in" INTEGER NOT NULL,
ADD COLUMN     "update_at" TIMESTAMP(3) NOT NULL;
