import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GraduationCap, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Invalid credentials')
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
            Welcome back to{' '}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Falsfa
            </span>
          </h2>
          <p className="text-white/40 text-lg leading-relaxed mb-10">
            Multi-Tenant School Management System. Sign in to access your dashboard, manage students, and more.
          </p>
          <div className="space-y-4">
            {['Role-based dashboards', 'Real-time data access', 'Multi-school management'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-white/50">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/10">
                <GraduationCap className="h-5 w-5 text-black" />
              </div>
              <span className="text-lg font-bold">Falsfa</span>
            </Link>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-2xl">
            <div className="mb-8">
              <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-4">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to home
              </Link>
              <h1 className="text-2xl font-bold mb-2">Sign in</h1>
              <p className="text-sm text-white/40">Enter your credentials to access your dashboard</p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/60 text-xs">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@school.edu"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-blue-400/50 h-11 rounded-xl"
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/60 text-xs">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-blue-400/50 h-11 rounded-xl pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/20 text-white">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In
              </Button>
            </form>



            <div className="mt-6 text-center">
              <p className="text-sm text-white/30">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Register your school
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
