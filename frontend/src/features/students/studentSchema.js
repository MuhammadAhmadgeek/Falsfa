import { z } from 'zod'

export const studentSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Name too long'),
  rollNumber: z.string().min(1, 'Roll number is required').max(20, 'Roll number too long'),
  class: z.string().min(1, 'Class is required'),
  section: z.string().optional(),
  parentContact: z
    .string()
    .min(10, 'Contact must be at least 10 digits')
    .regex(/^[\+]?[0-9\-\s]+$/, 'Invalid phone number format'),
  enrollmentDate: z.string().min(1, 'Enrollment date is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  status: z.enum(['active', 'suspended', 'graduated']).default('active'),
})

export const CLASSES = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
]

export const SECTIONS = ['A', 'B', 'C', 'D']
