/*
  Warnings:

  - You are about to drop the column `expires_in` on the `zoom_access_token` table. All the data in the column will be lost.
  - Added the required column `expire_at` to the `zoom_access_token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "zoom_access_token" DROP COLUMN "expires_in",
ADD COLUMN     "expire_at" TIMESTAMP(3) NOT NULL;
