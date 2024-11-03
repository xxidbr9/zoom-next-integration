-- AlterTable
ALTER TABLE "meeting_recorder" ADD COLUMN     "uploaded_file_url" TEXT;

-- AlterTable
ALTER TABLE "meeting_transcript" ADD COLUMN     "parsed_transcripts" TEXT;
