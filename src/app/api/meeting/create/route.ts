import { auth } from "@/features/auth/services";
import { CreatedMeetingResponse } from "@/features/zoom/models";
import { zoomAPI } from "@/lib/server-network";
import { prisma } from "@/lib/prisma";
import { AxiosError, AxiosResponse } from "axios";
import fs from 'fs'
import { NextRequest, NextResponse } from 'next/server';
import path from "path";


export async function POST(req: NextRequest) {
  try {
    const json = await req.json();

    // Validate required fields
    // const { topic, start_time, agenda, duration } = json.data;
    // if (!topic || !start_time || !agenda || typeof duration !== 'number') {
    //   return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    // }

    // Call createMeeting to make the Zoom API request
    const response = await createMeeting();
    const meetingData = response.data as CreatedMeetingResponse;
    // Store the meeting data in Prisma
    try {

      const newMeeting = await prisma.meeting.create({
        data: {
          zoom_id: meetingData.id.toString(),
          topic: meetingData.topic,
          // agenda: meetingData.agenda,
          // duration: meetingData.duration,
          // start_time: meetingData.start_time,
          zoom_url: meetingData.join_url,
        },
      });
      return NextResponse.json({ data: { meeting: newMeeting, zoom_meeting: meetingData } }, { status: 200 });
    } catch (error) {
      console.log({ error });
      throw new Error(error as any)
    }
    // Return the created meeting response

  } catch (error) {
    console.error("Error creating meeting:", error);
    const err = error as AxiosError
    return NextResponse.json({ message: "Failed to create meeting", error }, { status: err.status || 500 });
  }
}

const createMeeting = async (data?: { topic: string, start_time: string, agenda: string, duration: number }) => {
  const session = await auth()
  const token = session?.accessToken

  // const { agenda, duration, start_time, topic } = data
  const response = await zoomAPI.post('/users/me/meetings', {
    topic: "Generated meeting",
    // start_time,
    // duration,
    password: "1234",
    timezone: "UTC",
    type: 3,
    agenda: "",
    settings: {
      host_video: false,
      participant_video: true,
      join_before_host: true,
      mute_upon_entry: true,
      watermark: false,
      waiting_room: false,
      use_pmi: false,
      approval_type: 2,
      jbh_time: 0,
      audio: 'both',
      auto_recording: 'none',
      registrants_confirmation_email: false,
      registration_type: 3
    }
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    },

  });
  return response as AxiosResponse<CreatedMeetingResponse>
}