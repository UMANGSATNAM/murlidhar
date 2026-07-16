'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Loader2, Phone, Mail, MapPin, FileText, Download, Save,
  Package, MessageSquare, User, Calendar, IndianRupee,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AdminShell, useAdmin } from '@/components/admin/admin-shell'
import { useAdminRedirect } from '@/components/admin/use-admin-redirect'
import { InvoiceDownloadButton } from '@/components/storefront/invoice-button'
import { StatusBadge } from '@/app/admin/dashboard/page'
import { formatINR } from '@/lib/format'
import { toast as sonnerToast } from 'sonner'

const ORDER_STATUSES = ['pending', 'production', 'ready', 'dispatched', 'delivered', 'cancelled']
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded']

interface OrderItem {
  id: string; productName: string; variantInfo?: string | null; qty: number; unitPrice: number; total: number
}
interface OrderFile {
  id: string; fileName: string; filePath: string; fileSize: number; fileType?: string | null
}
interface Order {
  id: string; orderNumber: string; customerName: string; phone: string; email?: string
  address?: string; city?: string; state?: string; pincode?: string; remarks?: string
  subtotal: number; shipping: number; total: number
  paymentMethod: string; paymentStatus: string; paymentRef?: string | null
  orderStatus: string; statusNote?: string | null
  createdAt: string; updatedAt: string
  items: OrderItem[]; files: OrderFile[]
}

export default function AdminOrderDetailPage() {
  const { admin, loading } = useAdmin()
  useAdminRedirect(admin, loading)
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [order, setOrder] = React.useState<Order | null>(null)
  const [fetching, setFetching] = React.useState(true)
  const [orderStatus, setOrderStatus] = React.useState('')
  const [paymentStatus, setPaymentStatus] = React.useState('')
  const [statusNote, setStatusNote] = React.useState('')
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (!admin || !params.id) return
    fetch(`/api/orders/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setOrder(d.order)
        setOrderStatus(d.order.orderStatus)
        setPaymentStatus(d.order.paymentStatus)
        setStatusNote(d.order.statusNote || '')
      })
      .finally(() => setFetching(false))
  }, [admin, params.id])

  if (loading || fetching) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
  if (!admin) return null
  if (!order) return (
    <AdminShell admin={admin}>
      <div className="p-10 text-center">
        <p className="font-display text-xl font-bold text-navy">Order not found</p>
        <Button asChild className="mt-4 bg-navy text-cream hover:bg-navy-soft"><Link href="/admin/orders">Back to Orders</Link></Button>
      </div>
    </AdminShell>
  )

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: order.id, orderStatus, paymentStatus, statusNote }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      sonnerToast.success('Order updated & email sent to customer')
      setOrder(data.order)
    } catch (err: any) {
      sonnerToast.error(err.message || 'Update failed')
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
          <h2 className="font-display text-2xl font-bold text-navy">{order.orderNumber}</h2>
          <StatusBadge status={order.orderStatus} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <InvoiceDownloadButton
            order={{
              orderNumber: order.orderNumber,
              customerName: order.customerName,
              phone: order.phone,
              email: order.email,
              address: order.address,
              city: order.city,
              state: order.state,
              pincode: order.pincode,
              remarks: order.remarks,
              items: order.items.map((it: any) => ({
                productName: it.productName,
                variantInfo: it.variantInfo,
                qty: it.qty,
                unitPrice: it.unitPrice,
                total: it.total,
              })),
              subtotal: order.subtotal,
              shipping: order.shipping,
              total: order.total,
              paymentMethod: order.paymentMethod,
              paymentStatus: order.paymentStatus,
              orderStatus: order.orderStatus,
              createdAt: order.createdAt,
            }}
            variant="outline"
            label="Invoice"
            className="border-navy text-navy"
          />
          <Button onClick={handleSave} className="bg-gold text-navy hover:bg-gold-deep hover:text-cream" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save & Email Customer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left — items, files, remarks */}
        <div className="space-y-6">
          {/* Items */}
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-cream/60 px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                <Package className="h-4 w-4 text-gold" /> Items ({order.items.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-cream/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">Variant</th>
                    <th className="px-4 py-2 text-center">Qty</th>
                    <th className="px-4 py-2 text-right">Unit</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((it) => (
                    <tr key={it.id}>
                      <td className="px-4 py-3 font-medium text-navy">{it.productName}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{it.variantInfo || '—'}</td>
                      <td className="px-4 py-3 text-center">{it.qty}</td>
                      <td className="px-4 py-3 text-right">{formatINR(it.unitPrice)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-navy">{formatINR(it.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-cream/40">
                    <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium">Subtotal</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatINR(order.subtotal)}</td>
                  </tr>
                  <tr className="bg-cream/40">
                    <td colSpan={4} className="px-4 py-2 text-right text-sm font-medium">Shipping</td>
                    <td className="px-4 py-2 text-right">{formatINR(order.shipping)}</td>
                  </tr>
                  <tr className="bg-navy text-cream">
                    <td colSpan={4} className="px-4 py-3 text-right font-bold">Total</td>
                    <td className="px-4 py-3 text-right font-display text-lg font-bold">{formatINR(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* Uploaded files */}
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-cream/60 px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                <FileText className="h-4 w-4 text-gold" /> Uploaded Design Files ({order.files.length})
              </h3>
            </div>
            <div className="p-5">
              {order.files.length === 0 ? (
                <p className="text-sm text-muted-foreground">No files uploaded with this order.</p>
              ) : (
                <ul className="space-y-2">
                  {order.files.map((f) => (
                    <li key={f.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-cream/40 p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-navy text-cream">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-navy">{f.fileName}</p>
                          <p className="text-xs text-muted-foreground">{(f.fileSize / 1024).toFixed(0)} KB · {f.fileType || 'file'}</p>
                        </div>
                      </div>
                      <a
                        href={f.filePath}
                        download={f.fileName}
                        className="inline-flex items-center gap-1.5 rounded-md bg-gold px-3 py-1.5 text-xs font-bold text-navy hover:bg-gold-deep hover:text-cream"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {/* Customer remarks */}
          {order.remarks && (
            <Card className="overflow-hidden">
              <div className="border-b border-border bg-cream/60 px-5 py-3">
                <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                  <MessageSquare className="h-4 w-4 text-gold" /> Customer Remarks
                </h3>
              </div>
              <div className="p-5">
                <p className="whitespace-pre-line rounded-md bg-cream/40 p-4 text-sm text-foreground/80">{order.remarks}</p>
              </div>
            </Card>
          )}
        </div>

        {/* Right — customer info + status controls */}
        <div className="space-y-6">
          {/* Customer */}
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-cream/60 px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                <User className="h-4 w-4 text-gold" /> Customer
              </h3>
            </div>
            <div className="space-y-3 p-5 text-sm">
              <p className="font-semibold text-navy">{order.customerName}</p>
              <a href={`tel:${order.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-navy">
                <Phone className="h-4 w-4 text-gold" /> {order.phone}
              </a>
              {order.email && (
                <a href={`mailto:${order.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-navy">
                  <Mail className="h-4 w-4 text-gold" /> {order.email}
                </a>
              )}
              {order.address && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>{order.address}{order.city ? `, ${order.city}` : ''}{order.state ? `, ${order.state}` : ''}{order.pincode ? ` - ${order.pincode}` : ''}</span>
                </div>
              )}
              <div className="flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-gold" />
                Ordered {new Date(order.createdAt).toLocaleString('en-IN')}
              </div>
            </div>
          </Card>

          {/* Payment */}
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-cream/60 px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                <IndianRupee className="h-4 w-4 text-gold" /> Payment
              </h3>
            </div>
            <div className="space-y-3 p-5">
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Method</Label>
                <p className="font-semibold text-navy uppercase">{order.paymentMethod}</p>
              </div>
              <div>
                <Label htmlFor="paymentStatus" className="text-xs uppercase tracking-wide text-muted-foreground">Payment Status</Label>
                <select
                  id="paymentStatus"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none"
                >
                  {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {order.paymentRef && (
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Gateway Ref</Label>
                  <p className="font-mono text-xs text-navy">{order.paymentRef}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Order status update */}
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-cream/60 px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                <Package className="h-4 w-4 text-gold" /> Update Order Status
              </h3>
              <p className="text-xs text-muted-foreground">Customer will receive an email notification.</p>
            </div>
            <div className="space-y-3 p-5">
              <div>
                <Label htmlFor="orderStatus" className="text-xs uppercase tracking-wide text-muted-foreground">Order Status</Label>
                <select
                  id="orderStatus"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none"
                >
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="note" className="text-xs uppercase tracking-wide text-muted-foreground">Note to Customer (optional)</Label>
                <Textarea
                  id="note"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={3}
                  className="mt-1 resize-none border-border"
                  placeholder="e.g. Your order is ready for pickup."
                />
              </div>
              <Button onClick={handleSave} className="w-full bg-gold text-navy hover:bg-gold-deep hover:text-cream" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save & Send Email
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AdminShell>
  )
}
