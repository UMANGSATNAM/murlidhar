'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { MandalaLogo } from '@/components/storefront/mandala-logo'
import { toast as sonnerToast } from 'sonner'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState('admin@murlidharoffset.com')
  const [password, setPassword] = React.useState('')
  const [showPwd, setShowPwd] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    // Already logged in? Redirect to dashboard.
    fetch('/api/auth/admin/me').then((r) => r.json()).then((d) => {
      if (d.admin) router.push('/admin/dashboard')
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const text = await res.text()
      let data: any = {}
      try {
        data = text ? JSON.parse(text) : {}
      } catch {
        throw new Error('Server returned empty or non-JSON response')
      }
      if (!res.ok) throw new Error(data.error || 'Login failed')
      sonnerToast.success('Welcome back!')
      router.push('/admin/dashboard')
      router.refresh()
    } catch (err: any) {
      sonnerToast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute inset-0 " />
      </div>
      <Card className="relative w-full max-w-md overflow-hidden rounded-2xl">
        <div className="bg-gradient-to-b from-background to-secondary/20 p-8 text-center text-foreground">
          <div className="mx-auto mb-4 flex justify-center"><MandalaLogo size={72} /></div>
          <h1 className="font-display text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Murlidhar Offset
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-teal">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-8">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 border-border"
                placeholder="admin@murlidharoffset.com"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPwd ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 border-border"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy"
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full bg-gold text-navy hover:bg-gold-deep hover:text-foreground" disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
            ) : (
              <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}
