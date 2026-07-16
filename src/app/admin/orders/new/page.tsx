'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Save, Loader2, Plus, Trash2, Phone, User, Package, Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { AdminShell, useAdmin } from '@/components/admin/admin-shell'
import { useAdminRedirect } from '@/components/admin/use-admin-redirect'
import { formatINR, generateOrderNumber } from '@/lib/format'
import { toast as sonnerToast } from 'sonner'

interface Product {
  id: string; name: string; slug: string; basePrice: number
  variants?: { id: string; price: number; options: { option: { value: string } }[] }[]
}
interface OrderLine {
  productId: string
  productName: string
  variantId?: string
  variantLabel?: string
  qty: number
  unitPrice: number
}

export default function AdminQuickOrderPage() {
  const { admin, loading } = useAdmin()
  useAdminRedirect(admin, loading)
  const router = useRouter()

  const [products, setProducts] = React.useState<Product[]>([])
  const [fetching, setFetching] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  const [customer, setCustomer] = React.useState({ name: '', phone: '', email: '', address: '', city: '', state: 'Gujarat', pincode: '' })
  const [lines, setLines] = React.useState<OrderLine[]>([])
  const [remarks, setRemarks] = React.useState('')
  const [paymentMethod, setPaymentMethod] = React.useState('cod')

  React.useEffect(() => {
    fetch('/api/products?pageSize=100')
      .then((r) => r.json())
      .then((d) => setProducts(d.items || []))
      .finally(() => setFetching(false))
  }, [])

  if (loading || fetching) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
  if (!admin) return null

  const addLine = () => {
    if (products.length === 0) return
    const p = products[0]
    setLines([...lines, { productId: p.id, productName: p.name, qty: 1, unitPrice: p.basePrice }])
  }

  const updateLine = (idx: number, field: keyof OrderLine, value: any) => {
    const next = [...lines]
    ;(next[idx] as any)[field] = value
    setLines(next)
  }

  const selectProduct = (idx: number, productId: string) => {
    const p = products.find((pr) => pr.id === productId)
    if (!p) return
    updateLine(idx, 'productId', productId)
    updateLine(idx, 'productName', p.name)
    updateLine(idx, 'unitPrice', p.basePrice)
    updateLine(idx, 'variantId', undefined)
    updateLine(idx, 'variantLabel', undefined)
  }

  const removeLine = (idx: number) => setLines(lines.filter((_, i) => i !== idx))

  const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0)
  const total = subtotal

  const handleSave = async () => {
    if (!customer.name || !customer.phone || lines.length === 0) {
      sonnerToast.error('Customer name, phone, and at least 1 item required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...customer,
          remarks: `[ADMIN ORDER] ${remarks}`,
          items: lines.map((l) => ({
            productId: l.productId,
            productName: l.productName,
            variantId: l.variantId,
            variantLabel: l.variantLabel,
            qty: l.qty,
            unitPrice: l.unitPrice,
          })),
          paymentMethod,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      sonnerToast.success(`Order ${data.order.orderNumber} created!`)
      router.push(`/admin/orders/${data.order.id}`)
    } catch (err: any) {
      sonnerToast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminShell admin={admin}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-navy">
            <Link href="/admin/orders"><ArrowLeft className="mr-1 h-4 w-4" /> Orders</Link>
          </Button>
          <h2 className="font-display text-2xl font-bold text-navy">New Phone Order</h2>
        </div>
        <Button onClick={handleSave} className="bg-gold text-navy hover:bg-gold-deep hover:text-white" disabled={saving}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : <><Save className="mr-2 h-4 w-4" /> Create Order</>}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left — customer + items */}
        <div className="space-y-6">
          {/* Customer details */}
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                <User className="h-4 w-4 text-gold" /> Customer Details
              </h3>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <Label>Name *</Label>
                <Input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className="mt-1 border-border" />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className="mt-1 border-border" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="mt-1 border-border" />
              </div>
              <div>
                <Label>City</Label>
                <Input value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} className="mt-1 border-border" />
              </div>
              <div className="sm:col-span-2">
                <Label>Address</Label>
                <Textarea value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} rows={2} className="mt-1 resize-none border-border" />
              </div>
            </div>
          </Card>

          {/* Order items */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                <Package className="h-4 w-4 text-gold" /> Order Items
              </h3>
              <Button onClick={addLine} size="sm" variant="outline" className="border-navy text-navy">
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Item
              </Button>
            </div>
            <div className="p-5">
              {lines.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No items yet. Click "Add Item" to start.</p>
              ) : (
                <div className="space-y-3">
                  {lines.map((line, idx) => (
                    <div key={idx} className="rounded-lg border border-border bg-secondary/20 p-3">
                      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
                        <div>
                          <Label className="text-xs">Product</Label>
                          <Select value={line.productId} onValueChange={(v) => selectProduct(idx, v)}>
                            <SelectTrigger className="mt-1 border-border text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({formatINR(p.basePrice)})</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-20">
                          <Label className="text-xs">Qty</Label>
                          <Input type="number" min="1" value={line.qty} onChange={(e) => updateLine(idx, 'qty', parseInt(e.target.value) || 1)} className="mt-1 border-border text-sm" />
                        </div>
                        <div className="w-28">
                          <Label className="text-xs">Unit Price</Label>
                          <Input type="number" value={line.unitPrice} onChange={(e) => updateLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)} className="mt-1 border-border text-sm" />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="text-right">
                            <Label className="text-xs">Total</Label>
                            <p className="mt-1 font-display text-sm font-bold text-navy">{formatINR(line.qty * line.unitPrice)}</p>
                          </div>
                          <button onClick={() => removeLine(idx)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Remarks */}
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
              <h3 className="font-display text-base font-bold text-navy">Remarks</h3>
            </div>
            <div className="p-5">
              <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} className="resize-none border-border" placeholder="Internal notes about this phone order..." />
            </div>
          </Card>
        </div>

        {/* Right — summary */}
        <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
              <h3 className="font-display text-base font-bold text-navy">Order Summary</h3>
            </div>
            <div className="space-y-3 p-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span className="font-semibold text-navy">{lines.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Qty</span>
                <span className="font-semibold text-navy">{lines.reduce((s, l) => s + l.qty, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-navy">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-display text-base font-bold text-navy">Total</span>
                <span className="font-display text-xl font-bold text-navy">{formatINR(total)}</span>
              </div>
              <div>
                <Label className="text-xs">Payment Method</Label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                >
                  <option value="cod">Cash on Delivery</option>
                  <option value="online">Online Payment</option>
                  <option value="payatshop">Pay at Shop</option>
                </select>
              </div>
              <Button onClick={handleSave} className="w-full bg-gold text-navy hover:bg-gold-deep hover:text-white" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Create Order
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AdminShell>
  )
}
