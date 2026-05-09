import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, Plus, Loader2, Edit, Trash2 } from 'lucide-react'

export default function TeacherList() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const fetchTeachers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/staff', { params: { role: 'teacher' } })
      setTeachers(res.data.data || [])
    } catch (err) {
      console.error('Failed to load teachers:', err)
      setErrorMsg('Failed to load teachers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Teachers & Staff
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage school personnel</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add Teacher
        </Button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base flex items-center justify-between">
            Staff Directory
            <Badge variant="secondary">{teachers.length} Members</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No teachers found. Click "Add Teacher" to add one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    teachers.map((teacher) => (
                      <TableRow key={teacher._id}>
                        <TableCell className="font-medium">{teacher.name}</TableCell>
                        <TableCell>{teacher.email}</TableCell>
                        <TableCell>{teacher.department || 'General'}</TableCell>
                        <TableCell className="capitalize">{teacher.role || 'Teacher'}</TableCell>
                        <TableCell>
                          {teacher.isActive ? (
                            <Badge variant="success" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 border-transparent">Active</Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100/80 border-transparent">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 mr-1 text-muted-foreground hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
