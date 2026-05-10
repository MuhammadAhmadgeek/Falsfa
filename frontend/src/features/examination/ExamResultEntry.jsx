import { useState, useCallback, useEffect } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ClipboardList, Save, AlertCircle, CheckCircle2, Loader2, Calendar } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useTenant } from '@/context/TenantContext'
import { useAuth } from '@/context/AuthContext'

const CLASSES = ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10']
const SECTIONS = ['A', 'B', 'C']
const SUBJECTS = ['Mathematics', 'English', 'Science', 'Urdu', 'Islamiat', 'Computer']

const GRADING_SCALE = [
  { grade: 'A+', min: 90 },
  { grade: 'A', min: 80 },
  { grade: 'B', min: 70 },
  { grade: 'C', min: 60 },
  { grade: 'D', min: 50 },
  { grade: 'F', min: 0 },
]

function calcGrade(percentage) {
  for (const g of GRADING_SCALE) {
    if (percentage >= g.min) return g.grade
  }
  return 'F'
}

const GRADE_COLORS = {
  'A+': 'bg-emerald-500/15 text-emerald-700',
  'A': 'bg-green-500/15 text-green-700',
  'B': 'bg-blue-500/15 text-blue-700',
  'C': 'bg-amber-500/15 text-amber-700',
  'D': 'bg-orange-500/15 text-orange-700',
  'F': 'bg-red-500/15 text-red-700',
}

export default function ExamResultEntry() {
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [examType, setExamType] = useState('')
  const [subject, setSubject] = useState('')
  const [maxMarks, setMaxMarks] = useState(100)
  const [examDate, setExamDate] = useState(() => new Date().toISOString().split('T')[0])
  const [entries, setEntries] = useState([])
  const [showGrid, setShowGrid] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { schoolConfig } = useTenant()
  const { user } = useAuth()
  const isTeacher = user?.role === 'teacher'

  const [teacherAssignments, setTeacherAssignments] = useState([])

  useEffect(() => {
    if (isTeacher) {
      api.get('/classes/my-classes').then(res => {
        if (res.data.success) {
          setTeacherAssignments(res.data.assignments || [])
        }
      }).catch(() => {})
    }
  }, [isTeacher])

  const combinedClasses = [...new Set([...CLASSES, ...(schoolConfig?.customClasses || [])])]
  const combinedSections = [...new Set([...SECTIONS, ...(schoolConfig?.customSections || [])])]
  const combinedSubjects = [...new Set([...SUBJECTS, ...(schoolConfig?.customSubjects || [])])]

  // For teachers: only show their assigned classes and subjects
  const availableClasses = isTeacher
    ? [...new Set(teacherAssignments.map(a => a.class))]
    : combinedClasses

  const availableSubjects = isTeacher
    ? [...new Set(
        teacherAssignments
          .filter(a => !selectedClass || a.class === selectedClass)
          .flatMap(a => a.subjects)
      )]
    : combinedSubjects

  const loadGrid = async () => {
    if (!selectedClass || !selectedSection || !examType || !subject) return
    setLoading(true)
    try {
      const res = await api.get('/exams/students', {
        params: { class: selectedClass, section: selectedSection, examType, subject }
      })
      const students = res.data.data || []
      const data = students.map(s => ({
        studentId: s._id,
        studentName: s.name,
        rollNumber: s.rollNo,
        marksObtained: s.marksObtained !== undefined ? s.marksObtained : '',
        maxMarks,
        percentage: s.percentage || 0,
        grade: s.grade || '',
        error: '',
      }))
      setEntries(data)
      setShowGrid(true)
      setSaved(false)
    } catch (err) {
      console.error('Failed to load students:', err)
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  const updateMarks = useCallback((index, value) => {
    setEntries(prev => {
      const next = [...prev]
      const raw = value === '' ? '' : Number(value)
      const marks = raw === '' ? '' : raw
      let error = ''
      let percentage = 0
      let grade = ''

      if (marks !== '' && marks > maxMarks) {
        error = `Max: ${maxMarks}`
      }
      if (marks !== '' && !error) {
        percentage = Math.round((marks / maxMarks) * 100 * 100) / 100
        grade = calcGrade(percentage)
      }

      next[index] = { ...next[index], marksObtained: marks, percentage, grade, error }
      return next
    })
    setSaved(false)
  }, [maxMarks])

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      document.getElementById(`marks-${index + 1}`)?.focus()
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      document.getElementById(`marks-${index + 1}`)?.focus()
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      document.getElementById(`marks-${index - 1}`)?.focus()
    }
  }

  const handleSave = async () => {
    const hasErrors = entries.some(e => e.error)
    if (hasErrors) return

    const filledEntries = entries.filter(e => e.marksObtained !== '')
    if (filledEntries.length === 0) return

    setSaving(true)
    try {
      await api.post('/exams/results', {
        results: filledEntries.map(e => ({ studentId: e.studentId, marksObtained: e.marksObtained })),
        examType,
        subject: subject.toLowerCase(),
        class: selectedClass,
        section: selectedSection,
        maxMarks,
        date: examDate || undefined,
      })
      setSaved(true)
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  const filledCount = entries.filter(e => e.marksObtained !== '').length
  const avgPercentage = filledCount > 0
    ? Math.round(entries.filter(e => e.marksObtained !== '').reduce((sum, e) => sum + e.percentage, 0) / filledCount)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" /> Examination Result Entry
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Enter marks in a spreadsheet-like grid for quick data entry</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Select value={selectedClass} onValueChange={(val) => { setSelectedClass(val); setSubject('') }}>
              <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>{availableClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger><SelectValue placeholder="Section" /></SelectTrigger>
              <SelectContent>{combinedSections.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={examType} onValueChange={setExamType}>
              <SelectTrigger><SelectValue placeholder="Exam Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="midterm">Midterm</SelectItem>
                <SelectItem value="final">Final</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
              <SelectContent>
                {availableSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex flex-col gap-1">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  className="w-full pl-9 pr-3 h-10 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  title="Exam Date"
                />
              </div>
            </div>
            <Button onClick={loadGrid} disabled={!selectedClass || !selectedSection || !examType || !subject || loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Load Students
            </Button>
          </div>
        </CardContent>
      </Card>

      {showGrid && entries.length === 0 && !loading && (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No students found for this class/section.</CardContent></Card>
      )}

      {showGrid && entries.length > 0 && (
        <>
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant="outline" className="text-sm py-1 px-3">Max Marks: {maxMarks}</Badge>
            <Badge variant="outline" className="text-sm py-1 px-3">Filled: {filledCount}/{entries.length}</Badge>
            <Badge variant="outline" className="text-sm py-1 px-3">Avg: {avgPercentage}%</Badge>
            {saved && <Badge variant="success" className="text-sm py-1 px-3"><CheckCircle2 className="mr-1 h-3 w-3" /> Saved</Badge>}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {selectedClass} - Section {selectedSection} | {examType.charAt(0).toUpperCase() + examType.slice(1)} | {subject}
                </CardTitle>
                <Button onClick={handleSave} disabled={entries.some(e => !!e.error) || saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save All Marks
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead className="w-24">Roll No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="w-32 text-center">Marks</TableHead>
                      <TableHead className="w-20 text-center">Max</TableHead>
                      <TableHead className="w-24 text-center">%</TableHead>
                      <TableHead className="w-20 text-center">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry, i) => (
                      <TableRow key={entry.studentId} className={entry.error ? 'bg-red-50/50' : ''}>
                        <TableCell className="text-center text-muted-foreground text-xs">{i + 1}</TableCell>
                        <TableCell className="font-mono text-xs">{entry.rollNumber}</TableCell>
                        <TableCell className="font-medium text-sm">{entry.studentName}</TableCell>
                        <TableCell className="text-center">
                          <div className="relative">
                            <Input
                              id={`marks-${i}`}
                              type="number"
                              min={0}
                              max={maxMarks}
                              value={entry.marksObtained}
                              onChange={(e) => updateMarks(i, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, i)}
                              className={`w-20 mx-auto text-center h-8 ${entry.error ? 'border-red-500' : ''}`}
                              placeholder="—"
                            />
                            {entry.error && (
                              <div className="flex items-center justify-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3 text-red-500" />
                                <span className="text-[10px] text-red-500">{entry.error}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground text-sm">{entry.maxMarks}</TableCell>
                        <TableCell className="text-center">
                          {entry.marksObtained !== '' && !entry.error && <span className="font-semibold text-sm">{entry.percentage}%</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.grade && !entry.error && (
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${GRADE_COLORS[entry.grade] || ''}`}>
                              {entry.grade}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Grading Scale</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {GRADING_SCALE.map(g => (
                  <span key={g.grade} className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${GRADE_COLORS[g.grade]}`}>
                    {g.grade}: ≥{g.min}%
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
