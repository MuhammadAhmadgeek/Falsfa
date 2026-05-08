import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { studentSchema, CLASSES, SECTIONS } from './studentSchema'
import { useCreateStudent } from './useStudents'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Loader2, UserPlus } from 'lucide-react'

export default function StudentForm({ open, onClose }) {
  const { mutate, isLoading } = useCreateStudent()
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: { status: 'active', enrollmentDate: new Date().toISOString().split('T')[0] },
  })

  const onSubmit = (data) => {
    mutate(data, {
      onSuccess: () => {
        reset()
        onClose()
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add New Student
          </SheetTitle>
          <SheetDescription>Fill in the student details below. All fields marked with * are required.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input id="fullName" placeholder="e.g. Ali Hassan" {...register('fullName')} />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number *</Label>
              <Input id="rollNumber" placeholder="e.g. RN-2024-001" {...register('rollNumber')} />
              {errors.rollNumber && <p className="text-xs text-destructive">{errors.rollNumber.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Class *</Label>
              <Select onValueChange={(v) => setValue('class', v)}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.class && <p className="text-xs text-destructive">{errors.class.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Section</Label>
              <Select onValueChange={(v) => setValue('section', v)}>
                <SelectTrigger><SelectValue placeholder="Section" /></SelectTrigger>
                <SelectContent>
                  {SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select defaultValue="active" onValueChange={(v) => setValue('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentContact">Parent Contact *</Label>
            <Input id="parentContact" placeholder="e.g. +92-300-1234567" {...register('parentContact')} />
            {errors.parentContact && <p className="text-xs text-destructive">{errors.parentContact.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="enrollmentDate">Enrollment Date *</Label>
            <Input id="enrollmentDate" type="date" {...register('enrollmentDate')} />
            {errors.enrollmentDate && <p className="text-xs text-destructive">{errors.enrollmentDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input id="email" type="email" placeholder="student@school.edu" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <SheetFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Add Student
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
