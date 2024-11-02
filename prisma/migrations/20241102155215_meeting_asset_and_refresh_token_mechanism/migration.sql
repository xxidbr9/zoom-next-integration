-- CreateTable
CREATE TABLE "meeting_transcript" (
    "id" SERIAL NOT NULL,
    "meeting_id" INTEGER NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transcripts" TEXT,
    "original_transcript_file_url" TEXT,

    CONSTRAINT "meeting_transcript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_recorder" (
    "id" SERIAL NOT NULL,
    "meeting_id" INTEGER NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_transcript_file_url" TEXT,

    CONSTRAINT "meeting_recorder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zoom_access_token" (
    "id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,

    CONSTRAINT "zoom_access_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "zoom_access_token_id_key" ON "zoom_access_token"("id");

-- AddForeignKey
ALTER TABLE "meeting_transcript" ADD CONSTRAINT "meeting_transcript_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_recorder" ADD CONSTRAINT "meeting_recorder_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
