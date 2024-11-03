import { appAPI } from "@/lib/network";
import { CreatedMeetingResponse } from "../models";
import { AxiosResponse } from "axios";

type Response = {
  meeting: {
    topic: string | null;
    agenda: string | null;
    duration: number | null;
    start_time: Date | null;
    id: number;
    create_at: Date;
    zoom_url: string;
    zoom_id: string;
  };
  zoom_meeting: CreatedMeetingResponse;
};
export async function createMeetingLink(data?: { topic?: string, start_time?: string | Date, agenda?: string, duration?: number }) {
  try {
    const resp = await appAPI.post("/api/meeting/create", {
      data
    })
    const body = resp.data as AxiosResponse<Response>;
    return body;
  } catch (error) {
    console.error('Error', error);
  }
}