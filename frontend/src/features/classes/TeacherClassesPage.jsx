import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, BookOpen, Users, ChevronRight, Eye, Hash, User, Phone, Mail, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function TeacherClassesPage() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [students, setStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [profileStudent, setProfileStudent] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/classes/my-classes')
        if (res.data.success) {
          setAssignments(res.data.assignments || [])
        }
      } catch (err) {
        toast.error('Failed to load your classes')
      } finally {
        setLoading(false)
      }
    }
    fetchClasses()
  }, [])

  const handleClassClick = async (assignment) => {
    setSelectedAssignment(assignment)
    setDialogOpen(true)
    setLoadingStudents(true)
    try {
      const res = await api.get(`/classes/${assignment.class}/students`, {
        params: { section: assignment.section }
      })
      if (res.data.success) {
        setStudents(res.data.data)
      }
    } catch (err) {
      toast.error(`Failed to load students for class ${assignment.class}`)
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleViewProfile = async (studentId) => {
    setProfileLoading(true)
    setProfileOpen(true)
    try {
      const res = await api.get(`/students/${studentId}`)
      if (res.data.success) {
        setProfileStudent(res.data.data)
      }
    } catch (err) {
      toast.error('Failed to load student profile')
      setProfileStudent(null)
    } finally {
      setProfileLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Classes</h1>
        <p className="text-muted-foreground">View and manage the classes you are assigned to teach.</p>
      </div>

      {assignments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-medium">No Classes Assigned</h2>
            <p className="text-muted-foreground mt-1 max-w-sm">
              You haven't been assigned to any classes yet. Please contact your school administrator.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-wrap gap-5">
          {assignments.map((assignment, index) => {
            return (
              <Card key={index} className="w-full sm:w-72 group hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer" onClick={() => handleClassClick(assignment)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Class {assignment.section}</p>
                      <h3 className="text-3xl font-bold">{assignment.class}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <BookOpen className="h-6 w-6" />
                    </div>
                  </div>
                  {assignment.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {assignment.subjects.map(s => (
                        <Badge key={s} variant="secondary" className="text-[10px] font-normal">{s}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 flex items-center justify-between text-sm text-primary font-medium">
                    <span className="flex items-center gap-2"><Users className="h-4 w-4" /> View Roster</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Class Roster Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedAssignment?.class} - Section {selectedAssignment?.section} — Student Roster</DialogTitle>
            <CardDescription>All students currently enrolled in this class.</CardDescription>
          </DialogHeader>
          
          {loadingStudents ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg flex justify-between items-center text-sm font-medium">
                <span>Total Students</span>
                <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full">{students.length}</span>
              </div>
              
              {students.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground text-sm">No students found in this class.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Roll</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="w-[60px] text-right">Profile</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student._id}>
                        <TableCell className="font-mono text-xs">{student.rollNo}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center font-bold text-[10px] text-primary">
                              {student.name.charAt(0)}
                            </div>
                            <span className="font-medium text-sm">{student.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => { e.stopPropagation(); handleViewProfile(student._id) }}
                          >
                            <Eye className="h-4 w-4 text-primary" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Student Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
            <DialogDescription>Overview of student details and enrollment.</DialogDescription>
          </DialogHeader>
          {profileLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : profileStudent ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 border-b pb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
                  {profileStudent.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{profileStudent.name}</h3>
                  <Badge variant={profileStudent.isActive ? 'success' : 'warning'} className="mt-1">
                    {profileStudent.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 text-sm mt-4">
                <div>
                  <p className="text-muted-foreground flex items-center gap-1"><Hash className="h-3 w-3" /> Roll Number</p>
                  <p className="font-medium">{profileStudent.rollNo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Class & Section</p>
                  <p className="font-medium">{profileStudent.class}{profileStudent.section ? `-${profileStudent.section}` : ''}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Parent Contact</p>
                  <p className="font-medium">{profileStudent.parentPhone || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Email</p>
                  <p className="font-medium">{profileStudent.email || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Enrollment Date</p>
                  <p className="font-medium">{profileStudent.admissionDate ? new Date(profileStudent.admissionDate).toLocaleDateString() : '-'}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground text-sm">Could not load student profile.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
