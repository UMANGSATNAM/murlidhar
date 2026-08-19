'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Loader2, Phone, Mail, MapPin, FileText, Download, Save,
  Package, MessageSquare, User, Calendar, IndianRupee, Lock, Award,
  Clock, StickyNote, CheckCircle2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AdminShell, useAdmin } from '@/components/admin/admin-shell'
import { useAdminRedirect } from '@/components/admin/use-admin-redirect'
import { InvoiceDownloadButton } from '@/components/storefront/invoice-button'
import { FilePreviewButton } from '@/components/admin/file-preview-button'
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
  adminNote?: string | null
}
interface StatusHistoryEntry { status: string; note?: string; timestamp: string }
interface Order {
  id: string; orderNumber: string; customerName: string; phone: string; email?: string
  address?: string; city?: string; state?: string; pincode?: string; remarks?: string
  subtotal: number; shipping: number; total: number
  paymentMethod: string; paymentStatus: string; paymentRef?: string | null
  orderStatus: string; statusNote?: string | null; internalNotes?: string | null
  loyaltyPoints?: number; statusHistory?: string | null
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
  const [internalNotes, setInternalNotes] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [savingNotes, setSavingNotes] = React.useState(false)

  React.useEffect(() => {
    if (!admin || !params.id) return
    fetch(`/api/orders/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setOrder(d.order)
        setOrderStatus(d.order.orderStatus)
        setPaymentStatus(d.order.paymentStatus)
        setStatusNote(d.order.statusNote || '')
        setInternalNotes(d.order.internalNotes || '')
      })
      .finally(() => setFetching(false))
  }, [admin, params.id])

  if (loading || fetching) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
  if (!admin) return null
  if (!order) return (
    <AdminShell admin={admin}>
      <div className="p-10 text-center">
        <p className="font-display text-xl font-bold text-navy">Order not found</p>
        <Button asChild className="mt-4 bg-background text-foreground hover:bg-secondary/30"><Link href="/admin/orders">Back to Orders</Link></Button>
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
          <Button onClick={handleSave} className="bg-gold text-navy hover:bg-gold-deep hover:text-foreground" disabled={saving}>
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
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                <Package className="h-4 w-4 text-gold" /> Items ({order.items.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/30 text-xs uppercase tracking-wide text-muted-foreground">
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
                  <tr className="border-t-2 border-border bg-secondary/30">
                    <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium">Subtotal</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatINR(order.subtotal)}</td>
                  </tr>
                  <tr className="bg-secondary/30">
                    <td colSpan={4} className="px-4 py-2 text-right text-sm font-medium">Shipping</td>
                    <td className="px-4 py-2 text-right">{formatINR(order.shipping)}</td>
                  </tr>
                  <tr className="bg-background text-foreground">
                    <td colSpan={4} className="px-4 py-3 text-right font-bold">Total</td>
                    <td className="px-4 py-3 text-right font-display text-lg font-bold">{formatINR(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* Uploaded files */}
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-secondary/40 px-5 py-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                <FileText className="h-4 w-4 text-gold" /> Customer Uploaded Artwork & Images ({order.files.length})
              </h3>
              {order.files.length > 0 && (
                <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-xs font-bold text-navy">
                  {order.files.length} Real File{order.files.length > 1 ? 's' : ''} Attached
                </span>
              )}
            </div>
            <div className="p-5">
              {order.files.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No files were uploaded with this order.
                </div>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-1">
                  {order.files.map((f) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.fileName)
                    const isPdf = /\.pdf$/i.test(f.fileName)
                    return (
                      <li key={f.id} className="rounded-lg border border-border bg-secondary/20 p-4 shadow-sm transition hover:border-gold/50">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            {isImage ? (
                              <a
                                href={f.filePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-gold/40 bg-black/5 hover:opacity-90 transition group"
                                title="Click to view full image in new tab"
                              >
                                <img
                                  src={f.filePath}
                                  alt={f.fileName}
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                  <Eye className="h-4 w-4 text-white" />
                                </div>
                              </a>
                            ) : (
                              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-background text-foreground border border-border">
                                <FileText className="h-7 w-7 text-gold" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-navy">{f.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                File Size: <span className="font-semibold text-navy">{(f.fileSize / 1024).toFixed(1)} KB</span> · Type: <span className="uppercase font-semibold text-gold-deep">{f.fileType || (isImage ? 'IMAGE' : isPdf ? 'PDF' : 'ARTWORK')}</span>
                              </p>
                              <a
                                href={f.filePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-blue-600 hover:underline font-medium inline-block mt-0.5"
                              >
                                Open URL: {f.filePath}
                              </a>
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-2 w-full sm:w-auto justify-end">
                            {(isImage || isPdf) && (
                              <FilePreviewButton file={f} />
                            )}
                            <a
                              href={f.filePath}
                              download={f.fileName}
                              className="inline-flex items-center gap-1.5 rounded-md bg-gold px-3.5 py-1.5 text-xs font-bold text-navy hover:bg-gold-deep hover:text-white transition shadow-sm"
                            >
                              <Download className="h-3.5 w-3.5" /> Download
                            </a>
                          </div>
                        </div>
                        {/* Admin annotation per file */}
                        <div className="mt-3 pt-3 border-t border-border/60">
                          <FileAnnotation fileId={f.id} initialNote={f.adminNote} orderId={order.id} />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </Card>

          {/* Customer remarks */}
          {order.remarks && (
            <Card className="overflow-hidden">
              <div className="border-b border-border bg-secondary/40 px-5 py-3">
                <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                  <MessageSquare className="h-4 w-4 text-gold" /> Customer Remarks
                </h3>
              </div>
              <div className="p-5">
                <p className="whitespace-pre-line rounded-md bg-secondary/30 p-4 text-sm text-foreground/80">{order.remarks}</p>
              </div>
            </Card>
          )}

          {/* Internal notes (admin only) */}
          <Card className="overflow-hidden border-amber-300">
            <div className="border-b border-amber-200 bg-amber-50 px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                <Lock className="h-4 w-4 text-amber-600" /> Internal Notes
                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">ADMIN ONLY</span>
              </h3>
              <p className="mt-0.5 text-xs text-amber-700">Private notes for staff. NOT visible to customer.</p>
            </div>
            <div className="p-5">
              <Textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={4}
                className="resize-y border-border text-sm"
                placeholder="Add private notes about this order — e.g. 'Customer wants rush delivery', 'Special paper requested', 'Called customer on 16th to confirm'..."
              />
              <Button
                onClick={async () => {
                  setSavingNotes(true)
                  try {
                    const res = await fetch(`/api/orders/${order.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ id: order.id, internalNotes }),
                    })
                    if (!res.ok) throw new Error('Failed')
                    sonnerToast.success('Internal notes saved')
                  } catch (err: any) {
                    sonnerToast.error(err.message)
                  } finally {
                    setSavingNotes(false)
                  }
                }}
                className="mt-3 bg-amber-500 text-white hover:bg-amber-600"
                disabled={savingNotes}
              >
                {savingNotes ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Internal Notes
              </Button>
            </div>
          </Card>

          {/* Loyalty points earned (if any) */}
          {order.loyaltyPoints && order.loyaltyPoints > 0 ? (
            <Card className="overflow-hidden border-gold/30 bg-gold/5">
              <div className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/20">
                  <Award className="h-5 w-5 text-gold-deep" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Loyalty Points Earned</p>
                  <p className="font-display text-lg font-bold text-gold-deep">+{order.loyaltyPoints} points</p>
                  <p className="text-xs text-muted-foreground">Auto-awarded when order marked delivered (1 pt per ₹10)</p>
                </div>
              </div>
            </Card>
          ) : null}

          {/* Status Timeline */}
          <StatusTimeline statusHistory={order.statusHistory} createdAt={order.createdAt} />
        </div>

        {/* Right — customer info + status controls */}
        <div className="space-y-6">
          {/* Customer */}
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
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
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
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
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
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
              <Button onClick={handleSave} className="w-full bg-gold text-navy hover:bg-gold-deep hover:text-foreground" disabled={saving}>
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

// ─── Status Timeline Component ────────────────────────────────────────────────
const STATUS_ICONS: Record<string, string> = {
  pending: 'clock',
  production: 'package',
  ready: 'check',
  dispatched: 'truck',
  delivered: 'check-check',
  cancelled: 'x',
}
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-300',
  production: 'bg-blue-100 text-blue-700 border-blue-300',
  ready: 'bg-purple-100 text-purple-700 border-purple-300',
  dispatched: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  delivered: 'bg-green-100 text-green-700 border-green-300',
  cancelled: 'bg-red-100 text-red-700 border-red-300',
}

function StatusTimeline({ statusHistory, createdAt }: { statusHistory?: string | null; createdAt: string }) {
  let history: StatusHistoryEntry[] = []
  try {
    history = statusHistory ? JSON.parse(statusHistory) : []
  } catch {}

  // Always show the initial "Order Placed" entry
  const entries: { status: string; note?: string; timestamp: string }[] = [
    { status: 'pending', note: 'Order placed', timestamp: createdAt },
    ...history,
  ]

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-secondary/40 px-5 py-3">
        <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
          <Clock className="h-4 w-4 text-gold" /> Status Timeline
        </h3>
      </div>
      <div className="p-5">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-4">
            {entries.map((entry, i) => {
              const colorClass = STATUS_COLORS[entry.status] || 'bg-secondary text-muted-foreground border-border'
              const isLast = i === entries.length - 1
              return (
                <div key={i} className="relative flex items-start gap-3">
                  <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${colorClass} ${isLast ? 'ring-2 ring-gold/30' : ''}`}>
                    <span className="text-xs font-bold">{i + 1}</span>
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${colorClass}`}>
                        {entry.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {entry.note && <p className="mt-1 text-xs text-foreground/70">{entry.note}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}

// ─── File Annotation Component ────────────────────────────────────────────────
function FileAnnotation({ fileId, initialNote, orderId }: { fileId: string; initialNote?: string | null; orderId: string }) {
  const [note, setNote] = React.useState(initialNote || '')
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: orderId, fileNotes: [{ fileId, note }] }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      sonnerToast.error('Failed to save note')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <Input
        value={note}
        onChange={(e) => { setNote(e.target.value); setSaved(false) }}
        placeholder="Add admin note for this file (e.g. ' artwork approved', 'needs redesign')..."
        className="h-8 flex-1 text-xs border-border bg-white"
      />
      <Button
        onClick={save}
        size="sm"
        variant="outline"
        className="h-8 shrink-0 border-navy text-navy text-xs"
        disabled={saving}
      >
        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : saved ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : <StickyNote className="h-3 w-3" />}
        {saved ? 'Saved' : 'Note'}
      </Button>
    </div>
  )
}
