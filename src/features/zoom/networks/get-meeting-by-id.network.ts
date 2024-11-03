import { appAPI } from "@/lib/network";

export interface MeetingResp {
  data: Data
}

export interface Data {
  id: number
  topic: string
  agenda: string
  start_time: string
  duration: number
  create_at: string
  zoom_url: string
  zoom_id: string
  meeting_transcript: MeetingTranscript[]
  meeting_recorder: MeetingRecorder[]
}

export interface MeetingTranscript {
  id: number
  meeting_id: number
  create_at: string
  transcripts: string
  parsed_transcripts: string
  original_transcript_file_url: string
}

export interface MeetingRecorder {
  id: number
  meeting_id: number
  create_at: string
  file_password: string
  original_file_url: string
  uploaded_file_url: string
}


export async function getMeetingByID({ id }: { id: number | string }) {
  try {
    const resp = await appAPI.get(`/api/meeting/${id}`);
    const body = resp.data as MeetingResp;
    return body;
  } catch (error) {
    console.error("Error fetching meetings:", error);
    throw new Error("Failed to fetch meetings");
  }
}