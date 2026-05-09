'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  organizationName: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function getPasswordStrength(password: string) {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' }
  if (score <= 2) return { score, label: 'Fair', color: 'bg-yellow-500' }
  if (score <= 3) return { score, label: 'Good', color: 'bg-blue-500' }
  return { score, label: 'Strong', color: 'bg-green-500' }
}

const PERKS = [
  '3-day free trial — no credit card',
  'Direct SIP, any provider',
  'Real-time AMD detection',
  'Unlimited contacts on Pro',
]

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const router = useRouter()
  const setAuth = useAuthStore(s => s.setAuth)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/register', data)
      setAuth(res.data.accessToken, res.data.refreshToken, res.data.user)
      toast.success('Account created! Welcome to Voxora.')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const strength = getPasswordStrength(passwordValue)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
        <p className="text-muted-foreground text-sm mt-1.5">
          Start your 3-day free trial — no credit card required
        </p>
      </div>

      {/* Perks */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {PERKS.map(perk => (
          <div key={perk} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
            <span>{perk}</span>
          </div>
        ))}
      </div>

      {/* Form card */}
      <div className="glass-card-strong rounded-2xl p-6 border border-white/[0.06] shadow-modal">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/90">First Name</label>
              <input
                {...register('firstName')}
                placeholder="John"
                className="input-field"
                autoFocus
              />
              {errors.firstName && (
                <p className="text-red-400 text-xs">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/90">Last Name</label>
              <input
                {...register('lastName')}
                placeholder="Doe"
                className="input-field"
              />
              {errors.lastName && (
                <p className="text-red-400 text-xs">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/90">Work Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@company.com"
              className="input-field"
            />
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email.message}</p>
            )}
          </div>

          {/* Company */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/90">
              Company Name{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              {...register('organizationName')}
              placeholder="Acme Corp"
              className="input-field"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/90">Password</label>
            <div className="relative">
              <input
                {...register('password', {
                  onChange: e => setPasswordValue(e.target.value),
                })}
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 characters"
                className="input-field pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password strength meter */}
            {passwordValue && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.score ? strength.color : 'bg-muted/50'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Strength:{' '}
                  <span className={
                    strength.label === 'Strong' ? 'text-green-400' :
                    strength.label === 'Good' ? 'text-blue-400' :
                    strength.label === 'Fair' ? 'text-yellow-400' : 'text-red-400'
                  }>
                    {strength.label}
                  </span>
                </p>
              </div>
            )}

            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="text-center text-muted-foreground text-xs">
            By signing up you agree to our{' '}
            <Link href="/terms" className="text-brand-400 hover:underline">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-brand-400 hover:underline">Privacy Policy</Link>
          </p>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-muted-foreground text-sm mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
