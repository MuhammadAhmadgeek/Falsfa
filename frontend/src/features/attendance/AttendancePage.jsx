import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CalendarDays, Save, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function AttendancePage() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Fetch teacher's classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/classes/my-classes')
        if (res.data.success) {
          setClasses(res.data.data)
        }
      } catch (err) {
        toast.error('Failed to load your classes')
      }
    }
    fetchClasses()
  }, [])

  // Fetch students when a class is selected
  useEffect(() => {
    if (!selectedClass) return
    const fetchStudents = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/classes/${selectedClass}/students`)
        if (res.data.success) {
          setStudents(res.data.data)
          // Initialize all to present
          const initAtt = {}
          res.data.data.forEach(s => {
            initAtt[s._id] = 'present'
          })
          setAttendance(initAtt)
        }
      } catch (err) {
        toast.error('Failed to load students')
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [selectedClass])

  const toggleStatus = (studentId) => {
    setAttendance(prev => {
      const current = prev[studentId]
      const nextStatus = current === 'present' ? 'absent' : current === 'absent' ? 'late' : 'present'
      return { ...prev, [studentId]: nextStatus }
    })
  }

  const markAll = (status) => {
    const nextAtt = {}
    students.forEach(s => nextAtt[s._id] = status)
    setAttendance(nextAtt)
  }

  const handleSubmit = async () => {
    if (!selectedClass || students.length === 0) return
    setSubmitting(true)

    const records = students.map(s => ({
      student: s._id,
      status: attendance[s._id] || 'present',
      remarks: ''
    }))

    try {
      await api.post('/attendance', {
        class: selectedClass,
        date,
        records
      })
      toast.success('Attendance marked successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit attendance')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Class Attendance</h1>
        <p className="text-muted-foreground">Mark daily attendance for your assigned classes.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2 flex-1">
              <Label>Select Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex-1">
              <Label>Attendance Date</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {selectedClass && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4 border-b">
            <div>
              <CardTitle className="text-lg">Student List</CardTitle>
              <CardDescription>Click on status badges to toggle between Present, Absent, and Late.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => markAll('present')} className="text-emerald-600">Mark All Present</Button>
              <Button variant="outline" size="sm" onClick={() => markAll('absent')} className="text-rose-600">Mark All Absent</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No students found in this class.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Roll No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="text-right">Attendance Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map(student => {
                    const status = attendance[student._id]
                    return (
                      <TableRow key={student._id}>
                        <TableCell className="font-mono text-xs">{student.rollNo}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => toggleStatus(student._id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                              status === 'present' ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25' :
                              status === 'absent' ? 'bg-rose-500/15 text-rose-700 hover:bg-rose-500/25' :
                              'bg-amber-500/15 text-amber-700 hover:bg-amber-500/25'
                            }`}
                          >
                            {status === 'present' && <CheckCircle2 className="h-3.5 w-3.5" />}
                            {status === 'absent' && <XCircle className="h-3.5 w-3.5" />}
                            {status === 'late' && <Clock className="h-3.5 w-3.5" />}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <div className="p-4 border-t flex justify-end bg-muted/20">
            <Button onClick={handleSubmit} disabled={submitting || students.length === 0} className="w-full sm:w-auto">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Submit Attendance
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
