'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { Save, Loader2, Store, Mail, CreditCard, FileText, HelpCircle, Plus, Trash2, Shield, Lock, Eye, EyeOff } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminShell, useAdmin } from '@/components/admin/admin-shell'
import { useAdminRedirect } from '@/components/admin/use-admin-redirect'
import { toast as sonnerToast } from 'sonner'

export default function AdminSettingsPage() {
  return (
    <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>}>
      <AdminSettingsInner />
    </React.Suspense>
  )
}

function AdminSettingsInner() {
  const { admin, loading } = useAdmin()
  useAdminRedirect(admin, loading)
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'business'
  const [saving, setSaving] = React.useState(false)
  const [fetching, setFetching] = React.useState(true)
  const [form, setForm] = React.useState<any>({})

  // Email & Payment testing states
  const [testEmail, setTestEmail] = React.useState('')
  const [testingEmail, setTestingEmail] = React.useState(false)
  const [showSmtpPass, setShowSmtpPass] = React.useState(false)
  const [showRzpSecret, setShowRzpSecret] = React.useState(false)
  const [testingRzp, setTestingRzp] = React.useState(false)

  React.useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then(async (r) => {
        try {
          return await r.json()
        } catch {
          return null
        }
      })
      .then((d) => {
        if (d) {
          setForm(d || {})
          if (d?.adminNotifyEmail || d?.email) {
            setTestEmail(d.adminNotifyEmail || d.email)
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching settings:', err)
      })
      .finally(() => setFetching(false))
  }, [])

  if (loading || fetching) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
  if (!admin) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      let data: any = {}
      try {
        data = await res.json()
      } catch {
        throw new Error(`Server error (${res.status}). Please check database connection.`)
      }
      if (!res.ok) throw new Error(data.error || 'Failed to save settings')
      sonnerToast.success('Settings saved — live on storefront')
    } catch (err: any) {
      sonnerToast.error(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const update = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }))

  const applySmtpPreset = (preset: 'gmail' | 'hostinger' | 'outlook' | 'brevo') => {
    if (preset === 'gmail') {
      update('smtpHost', 'smtp.gmail.com')
      update('smtpPort', 587)
      update('smtpSecure', false)
      sonnerToast.info('Applied Gmail SMTP preset (Port 587). Use a 16-character Google App Password!')
    } else if (preset === 'hostinger') {
      update('smtpHost', 'smtp.hostinger.com')
      update('smtpPort', 465)
      update('smtpSecure', true)
      sonnerToast.info('Applied Hostinger SMTP preset (Port 465 SSL)')
    } else if (preset === 'outlook') {
      update('smtpHost', 'smtp.office365.com')
      update('smtpPort', 587)
      update('smtpSecure', false)
      sonnerToast.info('Applied Outlook/Office 365 SMTP preset (Port 587)')
    } else if (preset === 'brevo') {
      update('smtpHost', 'smtp-relay.brevo.com')
      update('smtpPort', 587)
      update('smtpSecure', false)
      sonnerToast.info('Applied Brevo (Sendinblue) SMTP preset')
    }
  }

  const handleTestEmail = async () => {
    const target = testEmail || form.adminNotifyEmail || form.email
    if (!target) {
      sonnerToast.error('Please enter a target email to send the test message to')
      return
    }
    setTestingEmail(true)
    try {
      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          toEmail: target,
          smtpHost: form.smtpHost,
          smtpPort: form.smtpPort ? parseInt(form.smtpPort, 10) : 587,
          smtpUser: form.smtpUser,
          smtpPass: form.smtpPass,
          smtpSecure: form.smtpSecure,
          emailFrom: form.emailFrom,
        }),
      })
      let data: any = {}
      try {
        data = await res.json()
      } catch {
        throw new Error(`Server error (${res.status}) while processing test email.`)
      }
      if (!res.ok) throw new Error(data.error || 'Failed to send test email')
      sonnerToast.success(data.message || 'Test email sent successfully! Please check your inbox.')
    } catch (err: any) {
      sonnerToast.error(err.message || 'Email test failed')
    } finally {
      setTestingEmail(false)
    }
  }

  const handleTestRazorpay = async () => {
    if (!form.razorpayKeyId || !form.razorpayKeySecret) {
      sonnerToast.error('Please enter Razorpay Key ID and Key Secret first')
      return
    }
    setTestingRzp(true)
    try {
      const res = await fetch('/api/admin/razorpay/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          razorpayKeyId: form.razorpayKeyId,
          razorpayKeySecret: form.razorpayKeySecret,
        }),
      })
      let data: any = {}
      try {
        data = await res.json()
      } catch {
        throw new Error(`Server error (${res.status}) while testing Razorpay keys.`)
      }
      if (!res.ok) throw new Error(data.error || 'Razorpay connection test failed')
      sonnerToast.success(data.message || 'Razorpay credentials verified successfully!')
    } catch (err: any) {
      sonnerToast.error(err.message || 'Razorpay test failed')
    } finally {
      setTestingRzp(false)
    }
  }

  return (
    <AdminShell admin={admin}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Site Settings</h2>
          <p className="text-sm text-muted-foreground">All changes appear on the live storefront instantly.</p>
        </div>
        <Button onClick={handleSave} className="bg-gold text-navy hover:bg-gold-deep hover:text-foreground" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Settings
        </Button>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="business"><Store className="mr-2 h-4 w-4" /> Business</TabsTrigger>
          <TabsTrigger value="email"><Mail className="mr-2 h-4 w-4" /> Email & SMTP</TabsTrigger>
          <TabsTrigger value="payment"><CreditCard className="mr-2 h-4 w-4" /> Payment (Razorpay)</TabsTrigger>
          <TabsTrigger value="faq"><HelpCircle className="mr-2 h-4 w-4" /> FAQ</TabsTrigger>
          <TabsTrigger value="seo"><FileText className="mr-2 h-4 w-4" /> SEO</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4" /> Security</TabsTrigger>
        </TabsList>

        {/* Business info */}
        <TabsContent value="business">
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
              <h3 className="font-display text-base font-bold text-navy">Business Information</h3>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <Label>Business Name</Label>
                <Input value={form.businessName || ''} onChange={(e) => update('businessName', e.target.value)} className="mt-1 border-border" />
              </div>
              <div>
                <Label>Tagline</Label>
                <Input value={form.tagline || ''} onChange={(e) => update('tagline', e.target.value)} className="mt-1 border-border" />
              </div>
              <div>
                <Label>Phone (primary)</Label>
                <Input value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} className="mt-1 border-border" />
              </div>
              <div>
                <Label>Phone (alternate)</Label>
                <Input value={form.altPhone || ''} onChange={(e) => update('altPhone', e.target.value)} className="mt-1 border-border" />
              </div>
              <div className="sm:col-span-2">
                <Label>Public Shop Email</Label>
                <Input value={form.email || ''} onChange={(e) => update('email', e.target.value)} className="mt-1 border-border" />
              </div>
              <div className="sm:col-span-2">
                <Label>Address</Label>
                <Textarea value={form.address || ''} onChange={(e) => update('address', e.target.value)} rows={2} className="mt-1 resize-none border-border" />
              </div>
              <div>
                <Label>Hours</Label>
                <Input value={form.hours || ''} onChange={(e) => update('hours', e.target.value)} className="mt-1 border-border" />
              </div>
              <div>
                <Label>WhatsApp Number</Label>
                <Input value={form.whatsapp || ''} onChange={(e) => update('whatsapp', e.target.value)} className="mt-1 border-border" placeholder="919510737852" />
              </div>
              <div>
                <Label>Instagram URL</Label>
                <Input value={form.instagram || ''} onChange={(e) => update('instagram', e.target.value)} className="mt-1 border-border" />
              </div>
              <div>
                <Label>Facebook URL</Label>
                <Input value={form.facebook || ''} onChange={(e) => update('facebook', e.target.value)} className="mt-1 border-border" />
              </div>
              <div className="sm:col-span-2">
                <Label>Google Map Embed URL</Label>
                <Input value={form.mapEmbedUrl || ''} onChange={(e) => update('mapEmbedUrl', e.target.value)} className="mt-1 border-border" />
              </div>
              <div className="sm:col-span-2">
                <Label>About Text</Label>
                <Textarea value={form.aboutText || ''} onChange={(e) => update('aboutText', e.target.value)} rows={6} className="mt-1 resize-none border-border" />
              </div>
              <div className="sm:col-span-2 border-t border-border pt-4">
                <Label>Announcement Bar</Label>
                <p className="mb-2 text-xs text-muted-foreground">A promotional banner shown above the site header. Leave empty to hide.</p>
                <AnnouncementBarEditor
                  value={form.announcementBar || ''}
                  onChange={(v) => update('announcementBar', v)}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Email */}
        <TabsContent value="email">
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
              <h3 className="font-display text-base font-bold text-navy">Real Email Notifications (SMTP)</h3>
              <p className="text-xs text-muted-foreground">
                Automatic customer order confirmations and instant admin order alerts sent through your real email provider.
              </p>
            </div>
            <div className="space-y-5 p-5">
              {/* Enable toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-4">
                <div>
                  <Label className="text-base font-semibold text-navy">Enable Real Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Sends live order confirmation emails to customers and new order notifications to your admin inbox.
                  </p>
                </div>
                <Switch checked={form.emailEnabled ?? true} onCheckedChange={(c) => update('emailEnabled', c)} />
              </div>

              {/* Admin Notification Email & From Display */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Admin Alert Email (Where YOU receive new orders) *</Label>
                  <Input
                    value={form.adminNotifyEmail || ''}
                    onChange={(e) => update('adminNotifyEmail', e.target.value)}
                    className="mt-1 border-border font-medium"
                    placeholder="e.g. murlidharoffset84@gmail.com"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Instant alerts will be delivered to this email every time a customer places an order.
                  </p>
                </div>
                <div>
                  <Label>Sender Name & Email (From Header)</Label>
                  <Input
                    value={form.emailFrom || ''}
                    onChange={(e) => update('emailFrom', e.target.value)}
                    className="mt-1 border-border"
                    placeholder='e.g. Murlidhar Offset <murlidharoffset84@gmail.com>'
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">The display name customers see when they receive emails.</p>
                </div>
              </div>

              {/* SMTP Settings Box */}
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <h4 className="font-display text-sm font-bold text-navy">SMTP Server Configuration</h4>
                    <p className="text-xs text-muted-foreground">Enter your email provider's outgoing SMTP credentials.</p>
                  </div>
                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-xs font-semibold text-muted-foreground">Quick Presets:</span>
                    <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => applySmtpPreset('gmail')}>
                      Gmail
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => applySmtpPreset('hostinger')}>
                      Hostinger
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => applySmtpPreset('outlook')}>
                      Outlook
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => applySmtpPreset('brevo')}>
                      Brevo
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>SMTP Host</Label>
                    <Input
                      value={form.smtpHost || ''}
                      onChange={(e) => update('smtpHost', e.target.value)}
                      className="mt-1 border-border"
                      placeholder="e.g. smtp.gmail.com or smtp.hostinger.com"
                    />
                  </div>
                  <div>
                    <Label>SMTP Port</Label>
                    <Input
                      type="number"
                      value={form.smtpPort ?? 587}
                      onChange={(e) => update('smtpPort', parseInt(e.target.value, 10) || 587)}
                      className="mt-1 border-border"
                      placeholder="587 or 465"
                    />
                  </div>
                  <div>
                    <Label>SMTP Username / Email</Label>
                    <Input
                      value={form.smtpUser || ''}
                      onChange={(e) => update('smtpUser', e.target.value)}
                      className="mt-1 border-border"
                      placeholder="e.g. murlidharoffset84@gmail.com"
                    />
                  </div>
                  <div>
                    <Label>SMTP Password / App Password</Label>
                    <div className="relative mt-1">
                      <Input
                        type={showSmtpPass ? 'text' : 'password'}
                        value={form.smtpPass || ''}
                        onChange={(e) => update('smtpPass', e.target.value)}
                        className="pr-10 border-border"
                        placeholder="••••••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPass((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy"
                        aria-label={showSmtpPass ? 'Hide' : 'Show'}
                      >
                        {showSmtpPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-border bg-secondary/30 p-3 sm:col-span-2">
                    <div>
                      <Label className="text-sm">Use SSL (Secure Connection)</Label>
                      <p className="text-[11px] text-muted-foreground">Enable for Port 465 (SSL). Keep disabled for Port 587 (TLS/STARTTLS).</p>
                    </div>
                    <Switch checked={form.smtpSecure || false} onCheckedChange={(c) => update('smtpSecure', c)} />
                  </div>
                </div>

                {/* Helpful Gmail Note */}
                <div className="mt-4 rounded-md border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-800">
                  <p className="font-semibold text-blue-900">💡 Tip for Gmail Users:</p>
                  <p className="mt-1 leading-relaxed">
                    Google requires a <strong>16-character App Password</strong> rather than your standard Gmail password.
                    Go to <strong>Google Account → Security → 2-Step Verification → App Passwords</strong>, create a password for "Mail", and paste the 16 letters into the SMTP Password field above.
                  </p>
                </div>
              </div>

              {/* Test Email Section */}
              <div className="rounded-lg border border-gold/40 bg-gold/5 p-4">
                <h4 className="font-display text-sm font-bold text-navy">✉️ Test Real Email Delivery</h4>
                <p className="text-xs text-muted-foreground">
                  Send a live test email right now to verify that your SMTP credentials and delivery connection work properly.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter email address to send test to"
                    className="flex-1 border-border bg-white"
                  />
                  <Button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={testingEmail}
                    className="bg-navy text-gold hover:bg-navy/90 shrink-0"
                  >
                    {testingEmail ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing Connection...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" /> Send Test Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Payment */}
        <TabsContent value="payment">
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
              <h3 className="font-display text-base font-bold text-navy">Payment Options & Razorpay Gateway</h3>
              <p className="text-xs text-muted-foreground">Choose payment methods and configure live Razorpay credentials.</p>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <Label className="text-sm font-semibold text-navy">Online Payment (Razorpay)</Label>
                  <p className="text-xs text-muted-foreground">UPI, QR Code, Credit/Debit Cards, Net Banking, Wallets</p>
                </div>
                <Switch checked={form.onlineEnabled ?? true} onCheckedChange={(c) => update('onlineEnabled', c)} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <Label className="text-sm font-semibold text-navy">Cash on Delivery</Label>
                  <p className="text-xs text-muted-foreground">Pay in cash when print order is delivered</p>
                </div>
                <Switch checked={form.codEnabled ?? true} onCheckedChange={(c) => update('codEnabled', c)} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <Label className="text-sm font-semibold text-navy">Pay at Shop</Label>
                  <p className="text-xs text-muted-foreground">Pick up and pay at our Unjha printing press</p>
                </div>
                <Switch checked={form.payAtShopEnabled ?? true} onCheckedChange={(c) => update('payAtShopEnabled', c)} />
              </div>

              {/* Razorpay Config */}
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
                  <div>
                    <h4 className="font-display text-sm font-bold text-navy">Razorpay API Credentials</h4>
                    <p className="text-xs text-muted-foreground">From Razorpay Dashboard → Settings → API Keys</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestRazorpay}
                    disabled={testingRzp || !form.razorpayKeyId || !form.razorpayKeySecret}
                    className="border-navy text-navy text-xs"
                  >
                    {testingRzp ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-1.5 h-3.5 w-3.5" /> Test Razorpay Keys
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Key ID *</Label>
                    <Input
                      value={form.razorpayKeyId || ''}
                      onChange={(e) => update('razorpayKeyId', e.target.value)}
                      className="mt-1 border-border font-mono text-sm"
                      placeholder="rzp_test_... or rzp_live_..."
                    />
                  </div>
                  <div>
                    <Label>Key Secret *</Label>
                    <div className="relative mt-1">
                      <Input
                        type={showRzpSecret ? 'text' : 'password'}
                        value={form.razorpayKeySecret || ''}
                        onChange={(e) => update('razorpayKeySecret', e.target.value)}
                        className="pr-10 border-border font-mono text-sm"
                        placeholder="••••••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRzpSecret((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy"
                        aria-label={showRzpSecret ? 'Hide' : 'Show'}
                      >
                        {showRzpSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Mode</Label>
                    <select
                      value={form.razorpayMode || 'test'}
                      onChange={(e) => update('razorpayMode', e.target.value)}
                      className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                    >
                      <option value="test">Test Mode (for testing without real money)</option>
                      <option value="live">Live Mode (for accepting real customer payments)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq">
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
              <h3 className="font-display text-base font-bold text-navy">Frequently Asked Questions</h3>
              <p className="text-xs text-muted-foreground">Manage the Q&A shown on the public FAQ page. Changes go live instantly.</p>
            </div>
            <div className="space-y-4 p-5">
              <FaqEditor
                value={form.faq || '[]'}
                onChange={(v) => update('faq', v)}
              />
            </div>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
              <h3 className="font-display text-base font-bold text-navy">SEO Settings</h3>
              <p className="text-xs text-muted-foreground">Optimise how your site appears in search results.</p>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <Label>Meta Title</Label>
                <Input value={form.metaTitle || ''} onChange={(e) => update('metaTitle', e.target.value)} className="mt-1 border-border" />
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea value={form.metaDescription || ''} onChange={(e) => update('metaDescription', e.target.value)} rows={3} className="mt-1 resize-none border-border" />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <ChangePasswordCard />
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} size="lg" className="bg-gold text-navy hover:bg-gold-deep hover:text-foreground" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save All Settings
        </Button>
      </div>
    </AdminShell>
  )
}

// ─── FAQ Editor (inline) ──────────────────────────────────────────────────────
function FaqEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [items, setItems] = React.useState<{ q: string; a: string }[]>([])

  React.useEffect(() => {
    try {
      setItems(JSON.parse(value) || [])
    } catch {
      setItems([])
    }
  }, [value])

  const update = (idx: number, field: 'q' | 'a', val: string) => {
    const next = [...items]
    next[idx] = { ...next[idx], [field]: val }
    setItems(next)
    onChange(JSON.stringify(next))
  }

  const add = () => {
    const next = [...items, { q: '', a: '' }]
    setItems(next)
    onChange(JSON.stringify(next))
  }

  const remove = (idx: number) => {
    const next = items.filter((_, i) => i !== idx)
    setItems(next)
    onChange(JSON.stringify(next))
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No FAQs yet. Click "Add Question" to create your first one.</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-border bg-secondary/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background text-xs font-bold text-teal">{i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <Input
            value={item.q}
            onChange={(e) => update(i, 'q', e.target.value)}
            placeholder="Question"
            className="mb-2 border-border font-semibold"
          />
          <Textarea
            value={item.a}
            onChange={(e) => update(i, 'a', e.target.value)}
            placeholder="Answer"
            rows={2}
            className="resize-none border-border text-sm"
          />
        </div>
      ))}
      <Button type="button" onClick={add} variant="outline" className="border-navy text-navy">
        <Plus className="mr-2 h-4 w-4" /> Add Question
      </Button>
    </div>
  )
}

// ─── Announcement Bar Editor (inline) ────────────────────────────────────────
function AnnouncementBarEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [data, setData] = React.useState<{ text: string; link?: string; active: boolean }>({
    text: '', link: '', active: false,
  })

  React.useEffect(() => {
    try {
      const parsed = JSON.parse(value)
      setData({ text: parsed.text || '', link: parsed.link || '', active: parsed.active ?? false })
    } catch {
      setData({ text: '', link: '', active: false })
    }
  }, [value])

  const update = (field: 'text' | 'link' | 'active', val: string | boolean) => {
    const next = { ...data, [field]: val }
    setData(next)
    onChange(JSON.stringify(next))
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-3">
      <div>
        <Label className="text-xs">Announcement Text</Label>
        <Input
          value={data.text}
          onChange={(e) => update('text', e.target.value)}
          placeholder="e.g. Free delivery on orders above ₹2,000!"
          className="mt-1 border-border"
        />
      </div>
      <div>
        <Label className="text-xs">Link (optional)</Label>
        <Input
          value={data.link || ''}
          onChange={(e) => update('link', e.target.value)}
          placeholder="/shop or /faq"
          className="mt-1 border-border"
        />
      </div>
      <div className="flex items-center justify-between rounded-md border border-border bg-white p-2">
        <Label className="text-xs">Active (show on storefront)</Label>
        <Switch checked={data.active} onCheckedChange={(c) => update('active', c)} />
      </div>
      {data.active && data.text && (
        <div className="rounded-md bg-gold-gradient px-3 py-2 text-center text-xs font-semibold text-navy">
          Preview: {data.text}
        </div>
      )}
    </div>
  )
}

// ─── Change Password Card ─────────────────────────────────────────────────────
function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [showCurrent, setShowCurrent] = React.useState(false)
  const [showNew, setShowNew] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      sonnerToast.error('Please fill in current and new password')
      return
    }
    if (newPassword.length < 4) {
      sonnerToast.error('New password must be at least 4 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      sonnerToast.error('New password and confirm password do not match')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to change password')
      sonnerToast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      sonnerToast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-secondary/40 px-5 py-3">
        <h3 className="font-display text-base font-bold text-navy">Change Admin Password</h3>
        <p className="text-xs text-muted-foreground">Update your admin panel login password. You will need your current password to proceed.</p>
      </div>
      <div className="space-y-4 p-5">
        {/* Current Password */}
        <div>
          <Label htmlFor="cp-current">Current Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="cp-current"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="pl-10 pr-10 border-border"
              placeholder="Enter current password"
            />
            <button type="button" onClick={() => setShowCurrent((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy" aria-label={showCurrent ? 'Hide' : 'Show'}>
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <Label htmlFor="cp-new">New Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="cp-new"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-10 pr-10 border-border"
              placeholder="Enter new password"
            />
            <button type="button" onClick={() => setShowNew((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy" aria-label={showNew ? 'Hide' : 'Show'}>
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {newPassword.length > 0 && newPassword.length < 4 && (
            <p className="mt-1 text-xs text-destructive">Password must be at least 4 characters</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <Label htmlFor="cp-confirm">Confirm New Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="cp-confirm"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pr-10 border-border"
              placeholder="Re-enter new password"
            />
            <button type="button" onClick={() => setShowConfirm((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy" aria-label={showConfirm ? 'Hide' : 'Show'}>
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <p className="mt-1 text-xs text-destructive">Passwords do not match</p>
          )}
        </div>

        <Button
          onClick={handleChangePassword}
          className="bg-gold text-navy hover:bg-gold-deep hover:text-foreground"
          disabled={saving || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 4}
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
          Update Password
        </Button>
      </div>
    </Card>
  )
}
