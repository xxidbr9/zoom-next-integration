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
    if (["MP4"].includes(record_file.file_extension)) {
      const uploadedUrl = await uploadFileFromUrl({ download_token: videoReq.download_token, file_id: record_file.id, fileUrl: record_file.download_url });
      newVideos.push({
        meeting_id: existingMeeting.id,
        file_password: videoReq.payload.object.password,
        original_file_url: record_file.play_url,
        uploaded_file_url: uploadedUrl
      });
    }
  }

  await prisma.meeting_recorder.createMany({
    skipDuplicates: true,
    data: newVideos
  });

}


const uploadFileFromUrl = async (args: { fileUrl: string, download_token: string, file_id: string }): Promise<string | null> => {
  try {
    const myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      `Bearer ${args.download_token}`
    );
    const requestOptions: RequestInit = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    // Step 1: Download the file
    const response = await fetch(args.fileUrl, requestOptions);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    // Step 2: Get the file as a Blob
    const fileBlob = await response.blob();

    // Step 3: Prepare to upload to GCP
    const bucket_name = "paraform-company-logo-urls";
    const filename = encodeURIComponent(args.file_id + ".mp4");
    const uploadResponse = await fetch(`${process.env.UPLOAD_URL}/${bucket_name}?file_name=${filename}`);
    const { url, fields } = await uploadResponse.json();

    // Step 4: Create FormData for the upload
    const formData = new FormData();
    Object.entries({ ...fields, file: new File([fileBlob], filename) }).forEach(([key, value]) => {
      formData.append(key, value as any);
    });

    // Step 5: Upload the file
    const upload = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!upload.ok) {
      throw new Error(`Upload failed: ${upload.statusText}`);
    }

    // Step 6: Return the uploaded file URL
    return `https://storage.googleapis.com/${bucket_name}/${filename}`;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};