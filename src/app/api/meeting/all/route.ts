import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all meetings from the database
    const meetings = await prisma.meeting.findMany();
    
    // Respond with the meetings data
    return NextResponse.json({ data: meetings }, { status: 200 });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 });
  }
}