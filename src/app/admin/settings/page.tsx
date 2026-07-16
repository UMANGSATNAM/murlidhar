'use client'

import * as React from 'react'
import { Save, Loader2, Store, Mail, CreditCard, FileText } from 'lucide-react'
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
  const { admin, loading } = useAdmin()
  useAdminRedirect(admin, loading)
  const [saving, setSaving] = React.useState(false)
  const [fetching, setFetching] = React.useState(true)
  const [form, setForm] = React.useState<any>({})

  React.useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setForm(d || {}))
      .finally(() => setFetching(false))
  }, [])

  if (loading || fetching) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
  if (!admin) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      sonnerToast.success('Settings saved — live on storefront')
    } catch (err: any) { sonnerToast.error(err.message) } finally { setSaving(false) }
  }

  const update = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }))

  return (
    <AdminShell admin={admin}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Site Settings</h2>
          <p className="text-sm text-muted-foreground">All changes appear on the live storefront instantly.</p>
        </div>
        <Button onClick={handleSave} className="bg-gold text-navy hover:bg-gold-deep hover:text-cream" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Settings
        </Button>
      </div>

      <Tabs defaultValue="business">
        <TabsList className="mb-4">
          <TabsTrigger value="business"><Store className="mr-2 h-4 w-4" /> Business</TabsTrigger>
          <TabsTrigger value="email"><Mail className="mr-2 h-4 w-4" /> Email</TabsTrigger>
          <TabsTrigger value="payment"><CreditCard className="mr-2 h-4 w-4" /> Payment</TabsTrigger>
          <TabsTrigger value="seo"><FileText className="mr-2 h-4 w-4" /> SEO</TabsTrigger>
        </TabsList>

        {/* Business info */}
        <TabsContent value="business">
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-cream/60 px-5 py-3">
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
                <Label>Email</Label>
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
            </div>
          </Card>
        </TabsContent>

        {/* Email */}
        <TabsContent value="email">
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-cream/60 px-5 py-3">
              <h3 className="font-display text-base font-bold text-navy">Email & Notifications</h3>
              <p className="text-xs text-muted-foreground">Order confirmations and status updates are sent to customers automatically.</p>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <Label className="text-sm">Enable Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Send order confirmations & status updates</p>
                </div>
                <Switch checked={form.emailEnabled || false} onCheckedChange={(c) => update('emailEnabled', c)} />
              </div>
              <div>
                <Label>Sender Email</Label>
                <Input value={form.emailFrom || ''} onChange={(e) => update('emailFrom', e.target.value)} className="mt-1 border-border" placeholder="orders@murlidharoffset.com" />
                <p className="mt-1 text-xs text-muted-foreground">New order notifications are also sent to: {form.email}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Payment */}
        <TabsContent value="payment">
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-cream/60 px-5 py-3">
              <h3 className="font-display text-base font-bold text-navy">Payment Options</h3>
              <p className="text-xs text-muted-foreground">Choose which payment methods appear at checkout.</p>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <Label className="text-sm">Online Payment (Razorpay)</Label>
                  <p className="text-xs text-muted-foreground">UPI / Cards / Net Banking</p>
                </div>
                <Switch checked={form.onlineEnabled ?? true} onCheckedChange={(c) => update('onlineEnabled', c)} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <Label className="text-sm">Cash on Delivery</Label>
                  <p className="text-xs text-muted-foreground">Pay in cash on delivery</p>
                </div>
                <Switch checked={form.codEnabled ?? true} onCheckedChange={(c) => update('codEnabled', c)} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <Label className="text-sm">Pay at Shop</Label>
                  <p className="text-xs text-muted-foreground">Pickup & pay at our shop</p>
                </div>
                <Switch checked={form.payAtShopEnabled ?? true} onCheckedChange={(c) => update('payAtShopEnabled', c)} />
              </div>
              <div className="border-t border-border pt-4">
                <h4 className="mb-3 font-display text-sm font-bold text-navy">Razorpay Configuration</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Key ID</Label>
                    <Input value={form.razorpayKeyId || ''} onChange={(e) => update('razorpayKeyId', e.target.value)} className="mt-1 border-border" placeholder="rzp_test_..." />
                  </div>
                  <div>
                    <Label>Key Secret</Label>
                    <Input type="password" value={form.razorpayKeySecret || ''} onChange={(e) => update('razorpayKeySecret', e.target.value)} className="mt-1 border-border" placeholder="••••••••" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Mode</Label>
                    <select value={form.razorpayMode || 'test'} onChange={(e) => update('razorpayMode', e.target.value)} className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm">
                      <option value="test">Test Mode</option>
                      <option value="live">Live Mode</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-cream/60 px-5 py-3">
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
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} size="lg" className="bg-gold text-navy hover:bg-gold-deep hover:text-cream" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save All Settings
        </Button>
      </div>
    </AdminShell>
  )
}
