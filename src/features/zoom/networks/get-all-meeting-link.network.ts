import { appAPI } from "@/lib/network";


export interface Meeting {
  id: number;
  topic: string;
  agenda: string;
  start_time: string; // or Date if you're handling Date objects
  duration: number;
  zoom_url: string;
  zoom_id: string;
  create_at: string; // or Date if you're handling Date objects
  _count: {
    meeting_recorder: number,
    meeting_transcript: number
  }
}

export async function getAllMeetings() {
  try {
    const resp = await appAPI.get("/api/meeting/all");
    const body = resp.data as { data: Meeting[] };
    return body;
  } catch (error) {
    console.error("Error fetching meetings:", error);
    throw new Error("Failed to fetch meetings");
  }
}