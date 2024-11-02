'use client'


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMeetingByID } from '@/features/zoom/networks'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function Component() {
  const params = useParams()

  const id = params.id as string
  const { data: meeting, isLoading, isError, error, refetch } = useQuery({ queryKey: ['meeting_detail', id], queryFn: () => getMeetingByID({ id }), enabled: !!id });

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error</div>
  if (!meeting) return <div>No meeting data found</div>

  return (
    <div className="container mx-auto py-10">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink >{meeting.data.topic}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>Meeting Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">ID</TableCell>
                <TableCell>{meeting.data.id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Topic</TableCell>
                <TableCell>{meeting.data.topic}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Agenda</TableCell>
                <TableCell>{meeting.data.agenda}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Start Time</TableCell>
                <TableCell>{meeting.data.start_time}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Duration</TableCell>
                <TableCell>{meeting.data.duration} minutes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Created At</TableCell>
                <TableCell>{meeting.data.create_at}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Zoom URL</TableCell>
                <TableCell>{meeting.data.zoom_url}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Zoom ID</TableCell>
                <TableCell>{meeting.data.zoom_id}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {meeting.data.meeting_transcript.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Meeting Transcripts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Transcript</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meeting.data.meeting_transcript.map((transcript) => (
                  <TableRow key={transcript.id}>
                    <TableCell>{transcript.id}</TableCell>
                    <TableCell>{transcript.create_at}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="link">
                            {transcript.transcripts.substring(0, 50)}...
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Full Transcript</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4 whitespace-pre-wrap">
                            {transcript.transcripts}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {meeting.data.meeting_recorder.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Meeting Recordings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>File URL</TableHead>
                  <TableHead>File Password</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meeting.data.meeting_recorder.map((recording) => (
                  <TableRow key={recording.id}>
                    <TableCell>{recording.id}</TableCell>
                    <TableCell>{recording.create_at}</TableCell>
                    <TableCell>{recording.original_file_url}</TableCell>
                    <TableCell>{recording.file_password}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}