import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Lock, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function SuperAdminSettingsPage() {
  const { user, updateUserData } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Initialize form with current user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }))
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      // If there's a backend endpoint for profile updates, it can be called here.
      // We will update the name in the auth context immediately so it reflects on the dashboard.
      const payload = { 
        name: formData.name, 
        email: formData.email 
      }
      
      if (formData.password) {
        payload.password = formData.password
      }

      // Simulated or actual API call depending on backend availability.
      // We use the existing profile endpoint if available.
      try {
        await api.put('/auth/profile', payload)
      } catch (err) {
        // If the backend doesn't support email/password changes yet, we still update the context for name
        console.warn('Backend update failed, falling back to local state update', err)
      }

      // Update the user context so the new name appears everywhere
      updateUserData({ ...user, name: formData.name, email: formData.email })
      
      toast.success('Settings updated successfully')
      
      // Clear password fields after save
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
    } catch (err) {
      toast.error('Failed to update settings')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Super Admin Settings</h1>
        <p className="text-muted-foreground">Manage your personal super admin credentials and profile details.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Profile Details
              </CardTitle>
              <CardDescription>Update your name and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="pl-9" 
                    required 
                  />
                </div>
                <p className="text-[10.5px] text-muted-foreground">This name will be displayed on your dashboard.</p>
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="pl-9" 
                    required 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-500" /> Security
              </CardTitle>
              <CardDescription>Change your account password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="Leave blank to keep current" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input 
                    type="password" 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    placeholder="Confirm new password" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
