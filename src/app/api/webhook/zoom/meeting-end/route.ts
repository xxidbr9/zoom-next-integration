import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming request body
    const body = await req.json();

    // Log the incoming request body
    console.log("Incoming Webhook Request:", body);

    // Return a 200 OK response to acknowledge receipt
    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);

    // Return a 400 Bad Request response if there's an error
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
