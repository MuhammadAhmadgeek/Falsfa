import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GraduationCap, School, UserCircle, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

const STUDENT_RANGES = ['1 – 50', '51 – 150', '151 – 300', '301 – 500', '500+']

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login: authLogin } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [step, setStep] = useState(1) // 1 = school info, 2 = admin account

  const [form, setForm] = useState({
    schoolName: '',
    city: '',
    approximateStudents: '',
    adminName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrorMsg('')
  }

  const validateStep1 = () => {
    if (!form.schoolName.trim()) return 'School name is required'
    if (!form.city.trim()) return 'City is required'
    if (!form.approximateStudents) return 'Please select approximate students'
    return null
  }

  const validateStep2 = () => {
    if (!form.adminName.trim()) return 'Full name is required'
    if (!form.email.trim()) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address'
    if (!form.password) return 'Password is required'
    if (form.password.length < 8) return 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) return 'Passwords do not match'
    return null
  }

  const handleNext = () => {
    const err = validateStep1()
    if (err) { setErrorMsg(err); return }
    setStep(2)
    setErrorMsg('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validateStep2()
    if (err) { setErrorMsg(err); return }

    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const res = await api.post('/auth/register-school', {
        schoolName: form.schoolName,
        city: form.city,
        approximateStudents: form.approximateStudents,
        adminName: form.adminName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      })

      if (res.data.success) {
        // Auto-login with returned token
        const { token, user } = res.data
        const authData = { user, token }
        localStorage.setItem('falsfa_auth', JSON.stringify(authData))
        // Reload to pick up auth state
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/8 blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-20 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0a1a_70%)]" />

      {/* Left panel - branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 max-w-md">
          <Link to="/" className="flex items-center gap-2.5 mb-12 group">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/10">
              <GraduationCap className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl font-bold">Falsfa</span>
          </Link>
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Join the future of{' '}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              school management
            </span>
          </h2>
          <p className="text-white/40 text-lg leading-relaxed mb-10">
            Get started in minutes. Manage your entire school from one powerful dashboard.
          </p>
          <div className="space-y-4">
            {['Free to start, upgrade anytime', 'No credit card required', 'Full support during setup'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-white/50">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - registration form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/10">
                <GraduationCap className="h-5 w-5 text-black" />
              </div>
              <span className="text-lg font-bold">Falsfa</span>
            </Link>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Register Your School</h1>
              <p className="text-sm text-white/40">Create your account and get started</p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-3 mb-8">
              <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-white/10'}`} />
              <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : 'bg-white/10'}`} />
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Step 1: School Information */}
              <div className={`transition-all duration-500 ${step === 1 ? 'block' : 'hidden'}`}>
                <div className="flex items-center gap-2 mb-5">
                  <School className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">School Information</span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs">School Name</Label>
                    <Input
                      value={form.schoolName}
                      onChange={(e) => updateField('schoolName', e.target.value)}
                      placeholder="e.g., Al-Huda Academy"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-blue-400/50 h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs">City</Label>
                    <Input
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="e.g., Lahore"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-blue-400/50 h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs">Approximate Students</Label>
                    <Select value={form.approximateStudents} onValueChange={(v) => updateField('approximateStudents', v)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 rounded-xl [&>span]:text-white/40">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a2e] border-white/10">
                        {STUDENT_RANGES.map((r) => (
                          <SelectItem key={r} value={r} className="text-white/80 focus:bg-white/10 focus:text-white">{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/20 text-white mt-2"
                  >
                    Next
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                </div>
              </div>

              {/* Step 2: Admin Account */}
              <div className={`transition-all duration-500 ${step === 2 ? 'block' : 'hidden'}`}>
                <button
                  type="button"
                  onClick={() => { setStep(1); setErrorMsg('') }}
                  className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 mb-5 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <div className="flex items-center gap-2 mb-5">
                  <UserCircle className="h-4 w-4 text-violet-400" />
                  <span className="text-sm font-medium text-violet-400">Admin Account</span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs">Your Full Name</Label>
                    <Input
                      value={form.adminName}
                      onChange={(e) => updateField('adminName', e.target.value)}
                      placeholder="Full name"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-blue-400/50 h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs">Email Address</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="your@email.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-blue-400/50 h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs">Phone Number</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="03XX-XXXXXXX"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-blue-400/50 h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs">Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-blue-400/50 h-11 rounded-xl pr-10"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        type={showConfirm ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                        placeholder="Repeat password"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-blue-400/50 h-11 rounded-xl pr-10"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/20 text-white mt-2"
                  >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Account & Register School
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-white/30">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
      `}</style>
    </div>
  )
}
