import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'

export function useStudents() {
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStudents = useCallback(async (search = '', classFilter = '', statusFilter = '') => {
    setIsLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (classFilter) params.class = classFilter
      const res = await api.get('/students', { params })
      let data = res.data.data || []

      // Map backend fields to frontend expected fields
      data = data.map(s => ({
        _id: s._id,
        fullName: s.name,
        rollNumber: s.rollNo,
        class: s.class,
        section: s.section || '',
        parentContact: s.parentPhone || s.phone || '',
        enrollmentDate: s.admissionDate || s.createdAt,
        status: s.isActive === false ? 'suspended' : (s.feeStatus === 'paid' ? 'active' : 'active'),
        email: s.email || '',
        tenantId: s.school?._id || s.school,
      }))

      // Client-side status filter
      if (statusFilter && statusFilter !== 'all') {
        data = data.filter(s => s.status === statusFilter)
      }

      setStudents(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      setStudents([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  return { data: students, isLoading, error, refetch: fetchStudents }
}

export function useCreateStudent() {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (data, { onSuccess } = {}) => {
    setIsLoading(true)
    try {
      // Map frontend fields to backend fields
      const payload = {
        name: data.fullName,
        rollNo: data.rollNumber,
        class: data.class,
        section: data.section,
        parentPhone: data.parentContact,
        admissionDate: data.enrollmentDate,
        email: data.email,
        isActive: data.status !== 'suspended',
      }
      await api.post('/students', payload)
      onSuccess?.()
    } catch (err) {
      console.error('Create student failed:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading }
}

export function useUpdateStudent() {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async ({ id, data }, { onSuccess, onError } = {}) => {
    setIsLoading(true)
    try {
      await api.put(`/students/${id}`, data)
      onSuccess?.()
    } catch (err) {
      console.error('Update student failed:', err)
      onError?.(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading }
}
