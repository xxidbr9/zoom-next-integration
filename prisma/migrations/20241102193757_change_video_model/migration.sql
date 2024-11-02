/*
  Warnings:

  - You are about to drop the column `original_transcript_file_url` on the `meeting_recorder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "meeting_recorder" DROP COLUMN "original_transcript_file_url",
ADD COLUMN     "file_password" TEXT,
ADD COLUMN     "original_file_url" TEXT;
