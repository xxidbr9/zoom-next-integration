import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto'
import { Video } from '@/features/zoom/models';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming request body
    const body = await req.json();

    // Log the incoming request body
    console.log("Incoming Webhook Request:", JSON.stringify(body, null, 2));
    let resp = {};
    // Webhook request event type is a challenge-response check
    if (body.event === 'endpoint.url_validation') {
      const hashForValidate = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET as string).update(body.payload.plainToken).digest('hex')

      resp = {
        "plainToken": body.payload.plainToken,
        "encryptedToken": hashForValidate
      }
    }

    if (body.event === "recording.completed") {
      await storeVideoLink(body);
    }
    // Return a 200 OK response to acknowledge receipt
    return NextResponse.json(resp, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);

    // Return a 400 Bad Request response if there's an error
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}

const storeVideoLink = async (videoReq: Video) => {
  const existingMeeting = await prisma.meeting.findFirst({
    where: {
      zoom_id: videoReq.payload.object.id.toString()
    }
  });

  if (!existingMeeting) return;

  const newVideos = []
  for (const record_file of videoReq.payload.object.recording_files) {
    if (["MP4", "M4A"].includes(record_file.file_extension))
      newVideos.push({
        meeting_id: existingMeeting.id,
        file_password: videoReq.payload.object.password,
        original_file_url: record_file.play_url
      });
  }

  await prisma.meeting_recorder.createMany({
    skipDuplicates: true,
    data: newVideos
  });

}
