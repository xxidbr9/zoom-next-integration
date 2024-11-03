'use client'


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMeetingByID } from '@/features/zoom/networks'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CopyIcon, ExternalLink, EyeIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { useState } from "react"

export default function Component() {
  const params = useParams()

  const id = params.id as string
  const { data: meeting, isLoading, isError, error, refetch } = useQuery({ queryKey: ['meeting_detail', id], queryFn: () => getMeetingByID({ id }), enabled: !!id });

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied!", {
      position: "bottom-center"
    })
  }

  const handleGoToLink = (link: string) => {
    window.open(link, "_blank")
  }

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
                            {transcript.parsed_transcripts?.substring(0, 50)}...
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Full Transcript</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4 whitespace-pre-wrap">
                            {transcript.parsed_transcripts}
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
                  <TableHead>Zoom File URL</TableHead>
                  <TableHead>Zoom File Password</TableHead>
                  <TableHead>Public Video</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meeting.data.meeting_recorder.map((recording) => (
                  <TableRow key={recording.id}>
                    <TableCell>{recording.id}</TableCell>
                    <TableCell>{recording.create_at}</TableCell>
                    <TableCell className="flex items-center gap-x-2">
                      <div className='flex gap-x-1'>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant={"outline"} size={"icon"} onClick={() => handleCopy(recording.original_file_url)}>
                              <CopyIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy link</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant={"outline"} size={"icon"} onClick={() => handleGoToLink(recording.original_file_url)}>
                              <ExternalLink />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Open link</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      {recording.original_file_url.substring(0, 50)}...
                    </TableCell>
                    <TableCell>{recording.file_password}</TableCell>
                    <TableCell>
                      <ModalPopUp recording={recording}/>
                    </TableCell>
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

interface Recording {
  uploaded_file_url: string
}

function ModalPopUp({ recording }: { recording: Recording }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        disabled={!recording.uploaded_file_url}
        variant="outline"
        onClick={() => setIsOpen(true)}
      >
        <EyeIcon className="w-4 h-4 mr-2" />
        Watch
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Video Playback</DialogTitle>
          </DialogHeader>
          <div className="aspect-video">
            <video
              src={recording.uploaded_file_url}
              controls
              className="w-full h-full"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}