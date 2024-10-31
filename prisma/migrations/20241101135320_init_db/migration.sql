-- CreateTable
CREATE TABLE "test_input" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "test_input_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting" (
    "id" SERIAL NOT NULL,
    "topic" TEXT NOT NULL,
    "agenda" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "zoom_url" TEXT NOT NULL,
    "zoom_id" BIGINT NOT NULL,

    CONSTRAINT "meeting_pkey" PRIMARY KEY ("id")
);
