export interface Transcript {
  event: string
  payload: Payload
  event_ts: number
  download_token: string
}

interface Payload {
  account_id: string
  object: Object
}

interface Object {
  uuid: string
  id: number
  account_id: string
  host_id: string
  topic: string
  type: number
  start_time: string
  timezone: string
  host_email: string
  duration: number
  total_size: number
  recording_count: number
  share_url: string
  recording_files: RecordingFile[]
  password: string
  recording_play_passcode: string
}

interface RecordingFile {
  id: string
  meeting_id: string
  recording_start: string
  recording_end: string
  file_type: string
  file_extension: string
  file_size: number
  play_url: string
  download_url: string
  status: string
  recording_type: string
}
