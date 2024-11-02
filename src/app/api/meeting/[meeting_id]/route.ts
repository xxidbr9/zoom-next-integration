import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

// Dynamic route handler for fetching a meeting by its ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ meeting_id: string }> }
) {
  const meetingID = (await params).meeting_id
  const meetingId = parseInt(meetingID, 10);

  if (isNaN(meetingId)) {
    return NextResponse.json({ error: "Invalid meeting ID" }, { status: 400 });
  }

  try {
    // Fetch the meeting by ID, including meeting_recorders and meeting_transcripts
    const meeting = await prisma.meeting.findUnique({
      where: {
        id: meetingId,
      },
      include: {
        meeting_transcript: true,
        meeting_recorder: true,
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Respond with the meeting data
    return NextResponse.json({ data: meeting }, { status: 200 });
  } catch (error) {
    console.error("Error fetching meeting by ID:", error);
    return NextResponse.json({ error: "Failed to fetch meeting" }, { status: 500 });
  }
}
