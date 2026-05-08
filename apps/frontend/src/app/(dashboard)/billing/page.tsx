'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { CreditCard, Check, Loader2, ExternalLink, Zap, Star } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const PLAN_BADGE: Record<string, { color: string; border: string; bg: string; highlight?: boolean }> = {
  STARTER:    { color: 'text-blue-400',   border: 'border-blue-500/30',   bg: 'bg-blue-500/5' },
  GROWTH:     { color: 'text-brand-400',  border: 'border-brand-500/50',  bg: 'bg-brand-500/5', highlight: true },
  PRO:        { color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/5' },
  ENTERPRISE: { color: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/5' },
}

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const { data: plans = [] } = useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: () => api.get('/billing/plans').then(r => r.data),
  })

  const { data: subscription } = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () => api.get('/billing/subscription').then(r => r.data),
  })

  const checkoutMutation = useMutation({
    mutationFn: (plan: string) => api.post('/billing/checkout', { plan }).then(r => r.data),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Stripe not configured. Please set STRIPE_SECRET_KEY.')
      }
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Checkout failed'),
  })

  const currentPlan = subscription?.plan ?? 'TRIAL'

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div>
        <h1 className="page-title">Billing</h1>
        <p className="page-subtitle">Manage your subscription and usage</p>
      </div>

      {/* Current plan banner */}
      {subscription && (
        <div className="bg-brand-500/[0.08] border border-brand-500/25 rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">Current Plan</p>
              <p className="text-2xl font-bold text-brand-300">
                {subscription.planDetails?.name ?? currentPlan}
              </p>
              {subscription.trialEndsAt && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Trial ends on{' '}
                  <span className="text-foreground font-medium">
                    {new Date(subscription.trialEndsAt).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-medium mb-1">Concurrent Calls</p>
              <p className="text-4xl font-bold tabular-nums">{subscription.maxConcurrentCalls}</p>
            </div>
          </div>
        </div>
      )}

      {/* Plans grid */}
      <div>
        <h2 className="text-base font-semibold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.filter((p: any) => p.id !== 'TRIAL').map((plan: any) => {
            const isCurrent = plan.id === currentPlan
            const style = PLAN_BADGE[plan.id] ?? { color: 'text-muted-foreground', border: 'border-border', bg: '' }

            return (
              <div
                key={plan.id}
                className={cn(
                  'bg-card border rounded-2xl p-5 relative flex flex-col transition-all duration-200',
                  style.highlight
                    ? 'border-brand-500/60 shadow-glow-brand'
                    : `${style.border} hover:border-brand-500/30`,
                  style.bg,
                )}
              >
                {style.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 px-3 py-0.5 gradient-brand rounded-full text-white text-[10px] font-semibold shadow-glow-brand">
                      <Star className="h-2.5 w-2.5" /> Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className={cn('font-bold text-base', style.color)}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    {plan.price === 0 ? (
                      <span className="text-2xl font-bold text-muted-foreground">Custom</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground text-sm">/month</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-5 flex-1">
                  {plan.features.map((f: string) => (
                    <div key={f} className="flex items-start gap-2 text-xs">
                      <Check className="h-3.5 w-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </div>
                  ))}
                </div>

                {/* Limits grid */}
                <div className="grid grid-cols-2 gap-1.5 mb-5">
                  {[
                    { label: 'Concurrent', value: plan.maxConcurrent },
                    { label: 'Campaigns', value: plan.maxCampaigns === -1 ? '∞' : plan.maxCampaigns },
                    { label: 'Contacts', value: plan.maxContacts === -1 ? '∞' : (plan.maxContacts >= 1000 ? `${plan.maxContacts / 1000}K` : plan.maxContacts) },
                    { label: 'SIP Accts', value: plan.maxSipAccounts === -1 ? '∞' : plan.maxSipAccounts },
                  ].map(s => (
                    <div key={s.label} className="bg-muted/20 rounded-lg px-2 py-1.5 text-center border border-border/50">
                      <p className="text-xs font-bold">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {isCurrent ? (
                  <div className="w-full py-2.5 text-center text-xs text-muted-foreground border border-border rounded-xl">
                    ✓ Current Plan
                  </div>
                ) : plan.id === 'ENTERPRISE' ? (
                  <a
                    href="mailto:sales@voxora.io"
                    className={cn(
                      'flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-medium transition-all',
                      'border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10',
                    )}
                  >
                    Contact Sales <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedPlan(plan.id)
                      checkoutMutation.mutate(plan.id)
                    }}
                    disabled={checkoutMutation.isPending}
                    className={cn(
                      'w-full py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2',
                      style.highlight
                        ? 'btn-primary'
                        : 'border border-border hover:bg-accent',
                    )}
                  >
                    {checkoutMutation.isPending && selectedPlan === plan.id && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    <Zap className="h-3.5 w-3.5" />
                    Upgrade to {plan.name}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Billing info */}
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-sm">Billing Information</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Billing is managed through Stripe. All plans include unlimited API access.
          Invoices are sent monthly to your registered email address.
        </p>

        {subscription?.invoices?.length > 0 && (
          <div className="mt-5 space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Recent Invoices
            </h4>
            {subscription.invoices.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-accent/30 transition-colors">
                <span className="text-sm text-muted-foreground">
                  {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <span className="font-semibold">${(inv.amount / 100).toFixed(2)}</span>
                <span className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full border',
                  inv.status === 'PAID'
                    ? 'text-green-400 bg-green-400/10 border-green-400/20'
                    : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
                )}>
                  {inv.status}
                </span>
                {inv.pdf && (
                  <a
                    href={inv.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:text-brand-300 text-xs transition-colors"
                  >
                    PDF
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
