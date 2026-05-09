import { useState, useCallback, useEffect } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarDays, Save, CheckCircle2, Loader2, Users, AlertCircle } from 'lucide-react'
import { useTenant } from '@/context/TenantContext'
import { toast } from 'sonner'

export default function AttendanceEntry() {
  const [teacherClasses, setTeacherClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [entries, setEntries] = useState([])
  const [showGrid, setShowGrid] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  const { schoolConfig, userRole } = useTenant()

  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true)
      try {
        if (userRole === 'teacher') {
          const res = await api.get('/classes/my-classes')
          if (res.data.success) {
            setTeacherClasses(res.data.assignments || [])
          }
        }
      } catch (err) {
        console.error('Failed to load teacher classes:', err)
        toast.error('Failed to load your assigned classes.')
      } finally {
        setLoadingClasses(false)
      }
    }
    fetchClasses()
  }, [userRole])

  // Derive unique classes to show in the dropdown
  const availableClasses = userRole === 'teacher' 
    ? [...new Set(teacherClasses.map(a => a.class))]
    : [...new Set(['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10', ...(schoolConfig?.customClasses || [])])]

  // Derive sections based on selected class
  const availableSections = userRole === 'teacher' && selectedClass
    ? [...new Set(teacherClasses.filter(a => a.class === selectedClass).map(a => a.section))]
    : [...new Set(['A', 'B', 'C', ...(schoolConfig?.customSections || [])])]

  const loadStudents = async () => {
    if (!selectedClass || !selectedSection || !date) return
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await api.get(`/classes/${selectedClass}/students`, {
        params: { section: selectedSection }
      })
      const students = res.data.data || []
      const data = students.map(s => ({
        student: s._id,
        studentName: s.name,
        rollNumber: s.rollNo,
        photo: s.photo,
        status: 'present',
        note: ''
      }))
      setEntries(data)
      setShowGrid(true)
      setSaved(false)
      if(data.length === 0) {
        toast.info("No students found in this class section.")
      }
    } catch (err) {
      console.error('Failed to load students:', err)
      setErrorMsg('Failed to fetch students. Please try again later.')
      toast.error('Failed to load students')
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = useCallback((index, newStatus) => {
    setEntries(prev => {
      const next = [...prev]
      next[index].status = newStatus
      return next
    })
    setSaved(false)
  }, [])

  const updateNote = useCallback((index, note) => {
    setEntries(prev => {
      const next = [...prev]
      next[index].note = note
      return next
    })
    setSaved(false)
  }, [])

  const handleSave = async () => {
    if (entries.length === 0) return
    setSaving(true)
    setErrorMsg('')
    try {
      await api.post('/attendance', {
        class: selectedClass,
        section: selectedSection,
        date,
        records: entries.map(e => ({ student: e.student, status: e.status, note: e.note }))
      })
      setSaved(true)
      toast.success('Attendance saved successfully!')
    } catch (err) {
      console.error('Save failed:', err)
      setErrorMsg(err.response?.data?.message || 'Failed to save attendance.')
      toast.error('Failed to save attendance.')
    } finally {
      setSaving(false)
    }
  }

  const markAll = (status) => {
    setEntries(prev => prev.map(e => ({ ...e, status })))
    setSaved(false)
  }

  const presentCount = entries.filter(e => e.status === 'present').length
  const absentCount = entries.filter(e => e.status === 'absent').length
  const lateCount = entries.filter(e => e.status === 'late').length

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300'
      case 'absent': return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300'
      case 'late': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300'
      case 'excused': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <CalendarDays className="h-7 w-7" />
            </div>
            Daily Attendance
          </h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-xl">
            Select your assigned class and section to mark attendance for today. Changes are saved instantly to the school database.
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-muted/60 overflow-hidden">
        <div className="bg-muted/30 px-6 py-4 border-b flex items-center gap-2 text-sm font-medium">
          <Users className="h-4 w-4 text-muted-foreground" /> Filter Selection
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Class</label>
              <Select value={selectedClass} onValueChange={(val) => { setSelectedClass(val); setSelectedSection(''); setShowGrid(false); }}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={loadingClasses ? "Loading classes..." : "Select Class"} />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  {availableClasses.length === 0 && !loadingClasses && <SelectItem value="none" disabled>No classes assigned</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Section</label>
              <Select value={selectedSection} onValueChange={(val) => { setSelectedSection(val); setShowGrid(false); }} disabled={!selectedClass}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {availableSections.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</label>
              <Input type="date" className="h-11 cursor-pointer" value={date} onChange={(e) => { setDate(e.target.value); setShowGrid(false); }} />
            </div>
            <Button 
              size="lg" 
              className="h-11 w-full relative overflow-hidden group" 
              onClick={loadStudents} 
              disabled={!selectedClass || !selectedSection || !date || loading}
            >
              <span className="relative z-10 flex items-center">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />}
                {loading ? 'Fetching...' : 'Load Students'}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {showGrid && entries.length === 0 && !loading && (
        <Card className="border-dashed shadow-sm">
          <CardContent className="p-12 text-center flex flex-col items-center justify-center">
            <div className="bg-muted p-4 rounded-full mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No Students Found</h3>
            <p className="text-muted-foreground mt-1 text-sm max-w-md">There are no students enrolled in {selectedClass} - Section {selectedSection}. Please verify your selection or contact administration.</p>
          </CardContent>
        </Card>
      )}

      {showGrid && entries.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium rounded-full shadow-sm">
                Total: {entries.length}
              </Badge>
              <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 px-3 py-1.5 text-sm font-medium rounded-full shadow-sm border-emerald-200 dark:border-emerald-800">
                Present: {presentCount}
              </Badge>
              <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 px-3 py-1.5 text-sm font-medium rounded-full shadow-sm border-rose-200 dark:border-rose-800">
                Absent: {absentCount}
              </Badge>
              {lateCount > 0 && (
                 <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 px-3 py-1.5 text-sm font-medium rounded-full shadow-sm border-amber-200 dark:border-amber-800">
                   Late: {lateCount}
                 </Badge>
              )}
            </div>
            {saved && (
              <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 px-3 py-1.5 text-sm font-medium rounded-full shadow-sm animate-in zoom-in duration-300 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Successfully Saved
              </Badge>
            )}
          </div>

          <Card className="shadow-md border-muted/60 overflow-hidden">
            <CardHeader className="bg-muted/20 border-b px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  Attendance Sheet
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedClass} • Section {selectedSection} • {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="flex gap-2 bg-muted p-1 rounded-lg">
                   <Button variant="ghost" size="sm" onClick={() => markAll('present')} className="h-8 px-3 text-xs font-semibold hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-500/20">All Present</Button>
                   <Button variant="ghost" size="sm" onClick={() => markAll('absent')} className="h-8 px-3 text-xs font-semibold hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-500/20">All Absent</Button>
                </div>
                <Button onClick={handleSave} disabled={saving} className="shadow-sm w-full sm:w-auto">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {saving ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40 sticky top-0 z-10 backdrop-blur-sm">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-16 text-center font-semibold">S.No</TableHead>
                      <TableHead className="font-semibold">Student Detail</TableHead>
                      <TableHead className="w-48 font-semibold">Status</TableHead>
                      <TableHead className="font-semibold hidden md:table-cell">Remarks (Optional)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry, i) => (
                      <TableRow key={entry.student} className={`hover:bg-muted/30 transition-colors ${entry.status === 'absent' ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''}`}>
                        <TableCell className="text-center font-medium text-muted-foreground">{i + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border shadow-sm">
                              <AvatarImage src={entry.photo} alt={entry.studentName} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {entry.studentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm leading-none">{entry.studentName}</p>
                              <p className="text-xs text-muted-foreground mt-1 font-mono">Roll: {entry.rollNumber}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select value={entry.status} onValueChange={(val) => updateStatus(i, val)}>
                            <SelectTrigger className={`h-9 font-medium shadow-sm transition-colors ${getStatusColor(entry.status)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                              <SelectItem value="excused">Excused</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                           <Input 
                             value={entry.note} 
                             onChange={(e) => updateNote(i, e.target.value)} 
                             className="h-9 bg-transparent focus-visible:bg-background shadow-none border-transparent hover:border-border focus-visible:border-ring transition-all" 
                             placeholder="Add a note..." 
                           />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
