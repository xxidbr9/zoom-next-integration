import { serverAPI } from "@/lib/network";

export async function createMeetingLink(data: { topic: string, start_time: string | Date, agenda: string, duration: number }) {
  try {
    const resp = await serverAPI.post("/api/meeting/create", {
      data
    })
    const body = resp.data;
    return body;
  } catch (error) {
    console.error('Error', error);
  }
}