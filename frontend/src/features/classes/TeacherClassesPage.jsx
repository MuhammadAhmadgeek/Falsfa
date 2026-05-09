import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, BookOpen, Users, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedClass, setSelectedClass] = useState(null)
  const [students, setStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/classes/my-classes')
        if (res.data.success) {
          setClasses(res.data.data)
        }
      } catch (err) {
        toast.error('Failed to load your classes')
      } finally {
        setLoading(false)
      }
    }
    fetchClasses()
  }, [])

  const handleClassClick = async (className) => {
    setSelectedClass(className)
    setSheetOpen(true)
    setLoadingStudents(true)
    try {
      const res = await api.get(`/classes/${className}/students`)
      if (res.data.success) {
        setStudents(res.data.data)
      }
    } catch (err) {
      toast.error(`Failed to load students for class ${className}`)
    } finally {
      setLoadingStudents(false)
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

      {classes.length === 0 ? (
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Card key={cls} className="group hover:shadow-md transition-all hover:border-primary/50 cursor-pointer" onClick={() => handleClassClick(cls)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Class</p>
                    <h3 className="text-3xl font-bold">{cls}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <BookOpen className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between text-sm text-primary font-medium">
                  <span className="flex items-center gap-2"><Users className="h-4 w-4" /> View Roster</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Class Roster Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl">Class {selectedClass} Roster</SheetTitle>
            <CardDescription>All students currently enrolled in this class.</CardDescription>
          </SheetHeader>
          
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
