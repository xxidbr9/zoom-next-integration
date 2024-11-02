import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming request body
    const body = await req.json();

    // Log the incoming request body
    console.log("Incoming Webhook Request:", body);
    let resp;
    // Webhook request event type is a challenge-response check
    if (body.event === 'endpoint.url_validation') {
      const hashForValidate = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET as string).update(body.payload.plainToken).digest('hex')

      resp = {
        "plainToken": body.payload.plainToken,
        "encryptedToken": hashForValidate
      }
    }
    // Return a 200 OK response to acknowledge receipt
    return NextResponse.json(resp, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);

    // Return a 400 Bad Request response if there's an error
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
