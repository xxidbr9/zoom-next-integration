'use client'

import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { Eye, Plus, Search, CalendarIcon, LogOut, CopyIcon, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  useQuery,
} from '@tanstack/react-query'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createMeetingLink, getAllMeetings, Meeting } from '@/features/zoom/networks'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'


const formSchema = z.object({
  topic: z.string().optional(),
  agenda: z.string().optional(),
  date: z.date().optional(),
  duration: z.number().optional(),
})


export default function Component() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isModalNewOpen, setIsModalNewOpen] = useState(false)
  const [isNewMeetingLoading, setIsNewMeetingLoading] = useState(false)

  // const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [newLink, setNewLink] = useState("http://localhost:3000");

  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ['meeting'], queryFn: getAllMeetings, });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
    },
  })
  useEffect(() => {
    setMeetings(data?.data || [])
  }, [data])
  const router = useRouter()

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied!", {
      position: "bottom-center"
    })
  }

  const handleGoToLink = (link: string) => {
    window.open(link, "_blank")
  }
  // Handling loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Handling error state
  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  // const handleDetailClick = (meeting) => {
  //   setSelectedMeeting(meeting)
  //   setIsModalOpen(true)
  // }

  // const handleEditClick = (meeting) => {
  //   // Implement edit functionality
  //   console.log('Edit clicked for meeting:', meeting)
  // }

  // const handleDeleteClick = (meeting) => {
  //   // Implement delete functionality
  //   console.log('Delete clicked for meeting:', meeting)
  // }



  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const resp = await createMeetingLink({ agenda: values.agenda, duration: values.duration, start_time: values.date, topic: values.topic })
      toast.success('Meeting has been created')
      setIsModalNewOpen(false)
      refetch()
    } catch (error) {
    }
  }



  const handleNewMeeting = async (open: boolean) => {
    if (open) {
      try {
        setIsNewMeetingLoading(true)
        const resp = await createMeetingLink()
        console.log({ resp });
        setNewLink(resp?.data.meeting.zoom_url as string)
        setIsNewMeetingLoading(false)
        setIsModalNewOpen(open)
        toast.success("New meeting created!")
        refetch()
      } catch (error) {
        toast.error("Can't create new meeting!")
      }
      // setIsModalNewOpen(open)

    } else {
      setIsModalNewOpen(open)
    }
    // Implement new meeting functionality
  }


  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase()
    setSearchTerm(term)

    if (term === '') {
      setMeetings([])
    } else {
      const filteredMeetings: Meeting[] = meetings.filter(meeting =>
        meeting.topic.toLowerCase().includes(term) ||
        meeting.agenda.toLowerCase().includes(term)
      )
      setMeetings(filteredMeetings)
    }
  }

  const handleViewFiles = (id: string) => {
    router.push(`/dashboard/meeting/${id}`)
  }

  return (
    <div className="container m-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by topic or agenda"
            value={searchTerm}
            onChange={handleSearch}
            className="pl-8 w-64"
          />
        </div>
        <div className='flex gap-x-2'>
          {/* <Button onClick={handleLogout} variant={"outline"}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button> */}
          {/* <Button onClick={handleNewMeeting}>
            <Plus className="mr-2 h-4 w-4" /> New Meeting
          </Button> */}
          <AlertDialog open={isModalNewOpen} onOpenChange={handleNewMeeting}>
            <AlertDialogTrigger asChild>
              <Button disabled={isNewMeetingLoading}>
                {isNewMeetingLoading ? (<LoadingSpinner />) : (<Plus className="mr-2 h-4 w-4" />)}
                New Meeting
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>New Meeting Created!</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className='flex flex-row gap-x-1'>
                    <Input defaultValue={newLink} readOnly />
                    <div className='flex gap-x-1'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant={"outline"} size={"icon"} onClick={() => handleCopy(newLink)}>
                            <CopyIcon />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy link</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant={"outline"} size={"icon"} onClick={() => handleGoToLink(newLink)}>
                            <ExternalLink />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Open link</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction>Close</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Topic</TableHead>
            {/* <TableHead>Agenda</TableHead> */}
            <TableHead>Meeting Link</TableHead>
            {/* <TableHead>Start Time</TableHead> */}
            {/* <TableHead>Duration (min)</TableHead> */}
            <TableHead>Zoom ID</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meetings.map((meeting) => (
            <TableRow key={meeting.id}>
              <TableCell>{meeting.id}</TableCell>
              <TableCell>
                <HighlightedText text={meeting.topic} highlight={searchTerm} />
              </TableCell>
              <TableCell className='flex gap-x-2 items-center'>
                <div className='flex gap-x-1'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant={"outline"} size={"icon"} onClick={() => handleCopy(meeting.zoom_url)}>
                        <CopyIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy link</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant={"outline"} size={"icon"} onClick={() => handleGoToLink(meeting.zoom_url)}>
                        <ExternalLink />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open link</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                {meeting.zoom_url}
              </TableCell>
              <TableCell>{meeting.zoom_id}</TableCell>
              <TableCell>{format(meeting.create_at, 'yyyy-MM-dd HH:mm')}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" disabled={meeting._count.meeting_recorder <= 0 && meeting._count.meeting_transcript <= 0} onClick={() => handleViewFiles(meeting.id.toString())}>
                    <Eye className="h-4 w-4" /> <span>View Files ({meeting._count.meeting_recorder + meeting._count.meeting_transcript})</span>
                  </Button>
                  {/* <Button variant="outline" size="icon" onClick={() => { }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => { }}>
                    <Trash2 className="h-4 w-4" />
                  </Button> */}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Highlighted text component
const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>
  }
  const regex = new RegExp(`(${highlight})`, 'gi')
  const parts = text.split(regex)
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}

export const LoadingSpinner = () => {
  return (

    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin")}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}