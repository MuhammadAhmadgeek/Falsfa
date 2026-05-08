import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const QUICK_LOGIN = [
  { label: 'Super Admin', email: 'super@falsfa.com', color: 'bg-red-500/10 text-red-600 hover:bg-red-500/20' },
  { label: 'School Admin', email: 'admin@greenvalley.edu', color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20' },
  { label: 'Teacher', email: 'sarah@greenvalley.edu', color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' },
  { label: 'Student', email: 'ali@greenvalley.edu', color: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await login(data.email, data.password)
      navigate('/dashboard')
    } finally {
      setIsSubmitting(false)
    }
  }

  const quickLogin = async (email) => {
    setIsSubmitting(true)
    try {
      await login(email, 'demo123')
      navigate('/dashboard')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <Card className="w-full max-w-md relative z-10 bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">Welcome to Falsfa</CardTitle>
            <CardDescription className="text-blue-200/60">Multi-Tenant School Management System</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-100/80">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@school.edu"
                className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-blue-400"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-blue-100/80">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-blue-400 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 text-white">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign In
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-transparent px-2 text-white/40">Quick Demo Login</span></div>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            {QUICK_LOGIN.map(q => (
              <Button
                key={q.email}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => quickLogin(q.email)}
                className={`${q.color} text-xs font-medium transition-all`}
              >
                {q.label}
              </Button>
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
