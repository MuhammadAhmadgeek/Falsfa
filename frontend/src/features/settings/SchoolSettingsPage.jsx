import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building, Phone, Mail, Globe, MapPin, Calendar, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useTenant } from '@/context/TenantContext'

export default function SchoolSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { schoolConfig, refreshTenantData } = useTenant()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    currentSession: '',
    address: { street: '', city: '', state: '', zip: '', country: 'Pakistan' }
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/schools/settings/my')
        if (res.data.success) {
          const s = res.data.data
          setFormData({
            name: s.name || '',
            email: s.email || '',
            phone: s.phone || '',
            website: s.website || '',
            currentSession: s.currentSession || '',
            address: s.address || { street: '', city: '', state: '', zip: '', country: 'Pakistan' }
          })
        }
      } catch (err) {
        toast.error('Failed to load school settings')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('address.')) {
      const key = name.split('.')[1]
      setFormData(prev => ({ ...prev, address: { ...prev.address, [key]: value } }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.put('/schools/settings/my', formData)
      toast.success('School settings updated successfully')
      refreshTenantData() // update context
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">School Settings</h1>
        <p className="text-muted-foreground">Manage your school profile, contact details, and academic session.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* General Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" /> General Information
              </CardTitle>
              <CardDescription>Basic details about your institution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>School Name</Label>
                  <Input name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Current Academic Session</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input name="currentSession" value={formData.currentSession} onChange={handleChange} className="pl-9" placeholder="e.g. 2024-2025" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-500" /> Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="email" name="email" value={formData.email} onChange={handleChange} className="pl-9" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input name="phone" value={formData.phone} onChange={handleChange} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input name="website" value={formData.website} onChange={handleChange} className="pl-9" placeholder="https://..." />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" /> Physical Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input name="address.street" value={formData.address.street} onChange={handleChange} />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input name="address.city" value={formData.address.city} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>State/Province</Label>
                  <Input name="address.state" value={formData.address.state} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>ZIP/Postal Code</Label>
                  <Input name="address.zip" value={formData.address.zip} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto shadow-lg">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Configuration
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
