'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, CheckCircle2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

const schema = z.object({ email: z.string().email('Please enter a valid email') })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', data)
      setSentEmail(data.email)
      setSent(true)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="glass-card-strong rounded-2xl p-8 border border-white/[0.06] shadow-modal text-center">
          <div className="flex justify-center mb-5">
            <div className="h-16 w-16 rounded-2xl bg-green-500/15 border border-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Check your inbox</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We sent a password reset link to{' '}
            <span className="text-foreground font-medium">{sentEmail}</span>.
            It will expire in 1 hour.
          </p>

          <div className="mt-6 p-3 bg-muted/30 rounded-xl text-xs text-muted-foreground">
            Didn&apos;t receive it? Check your spam folder or{' '}
            <button
              onClick={() => setSent(false)}
              className="text-brand-400 hover:text-brand-300 transition-colors"
            >
              try again
            </button>
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Reset your password</h2>
        <p className="text-muted-foreground text-sm mt-1.5">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <div className="glass-card-strong rounded-2xl p-6 border border-white/[0.06] shadow-modal">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/90" htmlFor="email">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                {...register('email')}
                id="email"
                type="email"
                placeholder="you@company.com"
                className="input-field pl-10"
                autoFocus
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>
      </div>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
    </div>
  )
}
