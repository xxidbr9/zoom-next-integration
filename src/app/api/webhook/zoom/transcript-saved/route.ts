import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto'
import { Transcript } from '@/features/zoom/models';
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
    if (body.event === "recording.transcript_completed") {
      await downloadAndStoreVTT(body);
    }
    // Return a 200 OK response to acknowledge receipt
    return NextResponse.json(resp, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);

    // Return a 400 Bad Request response if there's an error
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}


async function downloadAndStoreVTT(transcript: Transcript) {
  const existingMeeting = await prisma.meeting.findFirst({
    where: {
      zoom_id: transcript.payload.object.id.toString()
    }
  })

  if (!existingMeeting) return;

  const myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    `Bearer ${transcript.download_token}`
  );


  const requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  const newTranscripts = []
  for (const record_file of transcript.payload.object.recording_files) {
    if (record_file.file_type !== "TRANSCRIPT") continue;

    const resp = await fetch(
      record_file.download_url,
      requestOptions
    )
    const transcriptText = await resp.text()

    newTranscripts.push({
      meeting_id: existingMeeting.id,
      original_transcript_file_url: record_file.download_url,
      transcripts: transcriptText
    })
  }


  await prisma.meeting_transcript.createMany({
    skipDuplicates: true,
    data: newTranscripts
  });

}

