import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { studentSchema, CLASSES, SECTIONS } from './studentSchema'
import { useCreateStudent, useUpdateStudent } from './useStudents'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Loader2, UserPlus, Pencil } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from 'sonner'

export default function StudentForm({ open, onClose, onSuccess, initialData }) {
  const { mutate: createStudent, isLoading: isCreating } = useCreateStudent()
  const { mutate: updateStudent, isLoading: isUpdating } = useUpdateStudent()
  const isLoading = isCreating || isUpdating

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: { status: 'active', enrollmentDate: new Date().toISOString().split('T')[0] },
  })

  useEffect(() => {
    if (initialData && open) {
      setValue('fullName', initialData.fullName || '')
      setValue('rollNumber', String(initialData.rollNumber) || '')
      setValue('class', initialData.class || '')
      setValue('section', initialData.section || '')
      setValue('status', initialData.status || 'active')
      setValue('parentContact', initialData.parentContact || '')
      setValue('enrollmentDate', initialData.enrollmentDate ? initialData.enrollmentDate.split('T')[0] : '')
      setValue('email', initialData.email || '')
    } else if (!initialData && open) {
      reset({ status: 'active', enrollmentDate: new Date().toISOString().split('T')[0] })
    }
  }, [initialData, open, setValue, reset])

  const onSubmit = (data) => {
    const handleSuccess = () => {
      toast.success(initialData ? 'Student updated successfully' : 'Student added successfully')
      reset()
      onClose()
      if (onSuccess) onSuccess()
    }

    if (initialData) {
      updateStudent(
        { id: initialData._id, data: { name: data.fullName, rollNo: data.rollNumber, parentPhone: data.parentContact, admissionDate: data.enrollmentDate, isActive: data.status !== 'suspended', class: data.class, section: data.section, email: data.email } },
        { onSuccess: handleSuccess, onError: (e) => toast.error(e.response?.data?.message || 'Update failed') }
      )
    } else {
      createStudent(data, { onSuccess: handleSuccess, onError: (e) => toast.error(e.response?.data?.message || 'Creation failed') })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {initialData ? <Pencil className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
            {initialData ? 'Edit Student' : 'Add New Student'}
          </DialogTitle>
          <DialogDescription>Fill in the student details below. All fields marked with * are required.</DialogDescription>
        </DialogHeader>

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

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (initialData ? <Pencil className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />)}
              {initialData ? 'Save Changes' : 'Add Student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
