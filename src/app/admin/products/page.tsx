'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Package, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AdminShell, useAdmin } from '@/components/admin/admin-shell'
import { useAdminRedirect } from '@/components/admin/use-admin-redirect'
import { formatINR } from '@/lib/format'
import { toast as sonnerToast } from 'sonner'

interface Product {
  id: string; name: string; slug: string; basePrice: number; active: boolean; featured: boolean
  createdAt: string; category?: { name: string }; images: { url: string }[]
  _count?: { variants: number }
}

export default function AdminProductsPage() {
  const { admin, loading } = useAdmin()
  useAdminRedirect(admin, loading)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = React.useState<Product[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [q, setQ] = React.useState(searchParams.get('q') || '')
  const [listLoading, setListLoading] = React.useState(true)
  const [deleting, setDeleting] = React.useState<string | null>(null)

  const fetchProducts = React.useCallback(() => {
    setListLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    params.set('page', String(page))
    fetch(`/api/admin/products?${params}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.items || [])
        setTotal(d.total || 0)
        setTotalPages(d.totalPages || 1)
      })
      .finally(() => setListLoading(false))
  }, [q, page])

  React.useEffect(() => {
    if (admin) fetchProducts()
  }, [admin, fetchProducts])

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
  if (!admin) return null

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will also delete all its variants. This cannot be undone.`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/products/${id}?id=${id}`, { method: 'DELETE', credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      sonnerToast.success('Product deleted')
      fetchProducts()
    } catch (err: any) {
      sonnerToast.error(err.message || 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const toggleActive = async (p: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: p.id, active: !p.active }),
      })
      if (!res.ok) throw new Error('Failed')
      sonnerToast.success(`Product ${!p.active ? 'activated' : 'hidden'}`)
      fetchProducts()
    } catch (err: any) {
      sonnerToast.error(err.message)
    }
  }

  return (
    <AdminShell admin={admin}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Products</h2>
          <p className="text-sm text-muted-foreground">{total} products in your catalogue</p>
        </div>
        <Button asChild className="bg-gold text-navy hover:bg-gold-deep hover:text-cream">
          <Link href="/admin/products/new"><Plus className="mr-2 h-4 w-4" /> Add Product</Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1) }}
            placeholder="Search products..."
            className="pl-10 border-border bg-white"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {listLoading ? (
          <div className="p-10 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-gold" /></div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 font-display text-lg font-bold text-navy">No products found</p>
            <Button asChild className="mt-4 bg-navy text-cream hover:bg-navy-soft">
              <Link href="/admin/products/new"><Plus className="mr-2 h-4 w-4" /> Add Your First Product</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Base Price</th>
                  <th className="px-4 py-3 text-center">Variants</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                          {p.images[0]?.url ? (
                             
                            <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center"><Package className="h-4 w-4 text-muted-foreground/40" /></div>
                          )}
                        </div>
                        <div>
                          <Link href={`/admin/products/${p.id}`} className="font-semibold text-navy hover:text-teal">{p.name}</Link>
                          <p className="text-xs text-muted-foreground">/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{p.category?.name || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-navy">{formatINR(p.basePrice)}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{p._count?.variants ?? 0}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${p.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {p.active ? <><Eye className="h-3 w-3" /> Active</> : <><EyeOff className="h-3 w-3" /> Hidden</>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-navy hover:bg-secondary">
                          <Link href={`/admin/products/${p.id}`}><Edit className="h-4 w-4" /></Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={deleting === p.id}
                        >
                          {deleting === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="border-navy text-navy">
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="border-navy text-navy">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </AdminShell>
  )
}
