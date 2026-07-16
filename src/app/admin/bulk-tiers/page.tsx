'use client'

import * as React from 'react'
import { Plus, Trash2, Loader2, Percent, Package, Save, X, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { AdminShell, useAdmin } from '@/components/admin/admin-shell'
import { useAdminRedirect } from '@/components/admin/use-admin-redirect'
import { toast as sonnerToast } from 'sonner'

interface Tier {
  id: string
  minQty: number
  discountPct: number
  active: boolean
}

export default function AdminBulkTiersPage() {
  const { admin, loading } = useAdmin()
  useAdminRedirect(admin, loading)
  const [tiers, setTiers] = React.useState<Tier[]>([])
  const [fetching, setFetching] = React.useState(true)
  const [adding, setAdding] = React.useState(false)
  const [newTier, setNewTier] = React.useState({ minQty: '', discountPct: '' })

  const fetchTiers = () => {
    fetch('/api/admin/bulk-tiers', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setTiers(d.items || []))
      .finally(() => setFetching(false))
  }
  React.useEffect(() => { if (admin) fetchTiers() }, [admin])

  if (loading || fetching) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
  if (!admin) return null

  const handleAdd = async () => {
    const minQty = parseInt(newTier.minQty)
    const discountPct = parseFloat(newTier.discountPct)
    if (!minQty || !discountPct) {
      sonnerToast.error('Please fill in both fields')
      return
    }
    setAdding(true)
    try {
      const res = await fetch('/api/admin/bulk-tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ minQty, discountPct, active: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      sonnerToast.success(`Tier added: ${minQty}+ units → ${discountPct}% off`)
      setNewTier({ minQty: '', discountPct: '' })
      fetchTiers()
    } catch (err: any) {
      sonnerToast.error(err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleUpdate = async (tier: Tier, field: 'minQty' | 'discountPct' | 'active', value: any) => {
    const updated = { ...tier, [field]: value }
    try {
      const res = await fetch('/api/admin/bulk-tiers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: tier.id, ...updated }),
      })
      if (!res.ok) throw new Error('Failed')
      setTiers((prev) => prev.map((t) => (t.id === tier.id ? updated : t)))
    } catch (err: any) {
      sonnerToast.error(err.message)
    }
  }

  const handleDelete = async (tier: Tier) => {
    if (!confirm(`Delete this tier (${tier.minQty}+ units → ${tier.discountPct}% off)?`)) return
    const res = await fetch(`/api/admin/bulk-tiers?id=${tier.id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) { sonnerToast.success('Tier deleted'); fetchTiers() } else sonnerToast.error('Delete failed')
  }

  return (
    <AdminShell admin={admin}>
      <div className="mb-5">
        <h2 className="font-display text-2xl font-bold text-navy">Bulk Order Discounts</h2>
        <p className="text-sm text-muted-foreground">
          Set automatic quantity-based discounts. When a customer's total quantity crosses a tier, the discount applies automatically at checkout.
        </p>
      </div>

      {/* Info banner */}
      <Card className="mb-6 overflow-hidden border-gold/30 bg-gold/5">
        <div className="flex items-start gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/20">
            <TrendingDown className="h-5 w-5 text-gold-deep" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-navy">How it works</p>
            <p className="mt-1 text-xs text-muted-foreground">
              When a customer checks out, the total quantity of all items in their cart is summed up.
              If it crosses a tier's minimum, the corresponding discount % is applied to the entire order subtotal.
              Higher tiers override lower ones (e.g. 100 units triggers the 100-tier discount, not the 10-tier).
            </p>
          </div>
        </div>
      </Card>

      {/* Add new tier */}
      <Card className="mb-6 overflow-hidden">
        <div className="border-b border-border bg-secondary/40 px-5 py-3">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
            <Plus className="h-4 w-4 text-gold" /> Add New Tier
          </h3>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label htmlFor="minQty" className="text-xs">Min. Quantity</Label>
              <Input
                id="minQty"
                type="number"
                value={newTier.minQty}
                onChange={(e) => setNewTier({ ...newTier, minQty: e.target.value })}
                className="mt-1 w-32 border-border"
                placeholder="e.g. 50"
              />
            </div>
            <div>
              <Label htmlFor="discount" className="text-xs">Discount %</Label>
              <Input
                id="discount"
                type="number"
                step="0.5"
                value={newTier.discountPct}
                onChange={(e) => setNewTier({ ...newTier, discountPct: e.target.value })}
                className="mt-1 w-32 border-border"
                placeholder="e.g. 15"
              />
            </div>
            <Button onClick={handleAdd} className="bg-gold text-navy hover:bg-gold-deep hover:text-white" disabled={adding}>
              {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Tier
            </Button>
          </div>
        </div>
      </Card>

      {/* Existing tiers */}
      <Card className="overflow-hidden">
        <div className="border-b border-border bg-secondary/40 px-5 py-3">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
            <Package className="h-4 w-4 text-gold" /> Active Tiers ({tiers.length})
          </h3>
        </div>
        {tiers.length === 0 ? (
          <div className="p-10 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 font-display text-lg font-bold text-navy">No tiers yet</p>
            <p className="text-sm text-muted-foreground">Add your first bulk discount tier above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Min. Quantity</th>
                  <th className="px-4 py-3 text-left">Discount %</th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tiers.map((t) => (
                  <tr key={t.id} className="hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        value={t.minQty}
                        onChange={(e) => handleUpdate(t, 'minQty', parseInt(e.target.value) || 0)}
                        className="h-8 w-24 border-border"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.5"
                          value={t.discountPct}
                          onChange={(e) => handleUpdate(t, 'discountPct', parseFloat(e.target.value) || 0)}
                          className="h-8 w-24 border-border"
                        />
                        <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch checked={t.active} onCheckedChange={(c) => handleUpdate(t, 'active', c)} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(t)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminShell>
  )
}
