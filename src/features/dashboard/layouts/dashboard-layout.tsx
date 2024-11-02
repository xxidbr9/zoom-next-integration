'use client'

import { ChangeEvent, useEffect, useState } from 'react'
import { Eye, Plus, Search, CalendarIcon, LogOut } from 'lucide-react'
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


const formSchema = z.object({
  topic: z.string().min(1, { message: "Topic is required" }),
  agenda: z.string().optional(),
  date: z.date({
    required_error: "Meeting date is required",
  }),
  duration: z.number().min(1, { message: "Duration must be at least 1 minute" }),
})


export default function Component() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isModalNewOpen, setIsModalNewOpen] = useState(false)
  // const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ['meeting'], queryFn: getAllMeetings, });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      agenda: "",
      duration: 30,
    },
  })
  useEffect(() => {
    setMeetings(data?.data || [])
  }, [data])
  const router = useRouter()
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
      const resp = await createMeetingLink({ agenda: values.agenda || "", duration: values.duration, start_time: values.date, topic: values.topic })
      toast.success('Meeting has been created')
      setIsModalNewOpen(false)
      refetch()
    } catch (error) {
    }
  }

  const handleNewMeeting = () => {
    // Implement new meeting functionality
    setIsModalNewOpen(true)
    console.log('New meeting button clicked')
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
          <Button onClick={handleNewMeeting}>
            <Plus className="mr-2 h-4 w-4" /> New Meeting
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Agenda</TableHead>
            <TableHead>Meeting Link</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>Duration (min)</TableHead>
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
              <TableCell>
                <HighlightedText text={meeting.agenda} highlight={searchTerm} />
              </TableCell>
              <TableCell>{meeting.zoom_url}</TableCell>
              <TableCell>{format(meeting.start_time, 'yyyy-MM-dd HH:mm')}</TableCell>
              <TableCell>{meeting.duration}</TableCell>
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

      <Dialog open={isModalNewOpen} onOpenChange={setIsModalNewOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Meeting Details</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter meeting topic" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="agenda"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agenda</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter meeting agenda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Create Meeting</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
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