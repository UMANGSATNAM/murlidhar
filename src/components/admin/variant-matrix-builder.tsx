'use client'

// Variant Matrix Builder — lets admin define attributes (e.g. "Card Type", "Quantity")
// and their options, then create a variant for every combination with its own price.
import * as React from 'react'
import { Plus, Trash2, X, GripVertical, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export interface AttrDraft { name: string; options: string[] }
export interface VariantDraft { options: Record<string, string>; price: number; sku?: string; stock?: number }

export function VariantMatrixBuilder({
  attributes,
  setAttributes,
  variants,
  setVariants,
}: {
  attributes: AttrDraft[]
  setAttributes: (a: AttrDraft[]) => void
  variants: VariantDraft[]
  setVariants: (v: VariantDraft[]) => void
}) {
  const addAttribute = () => {
    setAttributes([...attributes, { name: '', options: [''] }])
  }
  const updateAttr = (idx: number, field: 'name', value: string) => {
    const next = [...attributes]
    next[idx] = { ...next[idx], [field]: value }
    setAttributes(next)
  }
  const updateOption = (ai: number, oi: number, value: string) => {
    const next = [...attributes]
    next[ai].options[oi] = value
    setAttributes(next)
  }
  const addOption = (ai: number) => {
    const next = [...attributes]
    next[ai].options.push('')
    setAttributes(next)
  }
  const removeOption = (ai: number, oi: number) => {
    const next = [...attributes]
    next[ai].options.splice(oi, 1)
    setAttributes(next)
  }
  const removeAttr = (ai: number) => {
    const next = [...attributes]
    next.splice(ai, 1)
    setAttributes(next)
  }

  // Regenerate variants grid when attributes change (preserve existing prices by signature)
  React.useEffect(() => {
    if (attributes.length === 0 || attributes.some((a) => !a.name || a.options.some((o) => !o))) {
      // Need complete attributes before generating grid
      if (attributes.length === 0) setVariants([])
      return
    }
    // Build cartesian product
    const validAttrs = attributes.filter((a) => a.name && a.options.every((o) => o))
    if (validAttrs.length === 0) return
    const combos: Record<string, string>[] = [{}]
    for (const attr of validAttrs) {
      const newCombos: Record<string, string>[] = []
      for (const combo of combos) {
        for (const opt of attr.options) {
          newCombos.push({ ...combo, [attr.name]: opt })
        }
      }
      combos.splice(0, combos.length, ...newCombos)
    }
    // Preserve existing prices where signature matches
    const prevMap = new Map<string, VariantDraft>()
    variants.forEach((v) => {
      const sig = Object.entries(v.options).sort().map(([k, val]) => `${k}=${val}`).join('|')
      prevMap.set(sig, v)
    })
    const next: VariantDraft[] = combos.map((c) => {
      const sig = Object.entries(c).sort().map(([k, val]) => `${k}=${val}`).join('|')
      const prev = prevMap.get(sig)
      return { options: { ...c }, price: prev?.price ?? 0, sku: prev?.sku, stock: prev?.stock ?? 9999 }
    })
    setVariants(next)
     
  }, [attributes])

  const updateVariantPrice = (idx: number, price: number) => {
    const next = [...variants]
    next[idx] = { ...next[idx], price }
    setVariants(next)
  }

  const updateVariantStock = (idx: number, stock: number) => {
    const next = [...variants]
    next[idx] = { ...next[idx], stock }
    setVariants(next)
  }

  const bulkApplyPrice = (formula: string) => {
    // formula examples: "100" (all same), "base+100" (first option price + 100)
    if (!variants.length) return
    const base = parseFloat(formula)
    if (isNaN(base)) return
    setVariants(variants.map((v) => ({ ...v, price: base })))
  }

  return (
    <div className="space-y-5">
      {/* Attributes */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <Label className="text-sm font-bold text-navy">Variant Attributes</Label>
          <Button type="button" size="sm" variant="outline" onClick={addAttribute} className="border-navy text-navy">
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Attribute
          </Button>
        </div>

        {attributes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-cream/40 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No variant attributes. This product will have a single price.
              Add attributes like "Paper Type" or "Quantity" to create variants.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {attributes.map((attr, ai) => (
              <Card key={ai} className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={attr.name}
                    onChange={(e) => updateAttr(ai, 'name', e.target.value)}
                    placeholder="Attribute name (e.g. Card Type, Quantity)"
                    className="flex-1 border-border font-semibold"
                  />
                  <Button type="button" size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => removeAttr(ai)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {attr.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1">
                      <Input
                        value={opt}
                        onChange={(e) => updateOption(ai, oi, e.target.value)}
                        placeholder={`Option ${oi + 1}`}
                        className="h-7 w-32 border-0 px-1 text-sm focus-visible:ring-0"
                      />
                      <button type="button" onClick={() => removeOption(ai, oi)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <Button type="button" size="sm" variant="ghost" onClick={() => addOption(ai)} className="h-7 text-xs text-gold-deep">
                    <Plus className="mr-1 h-3 w-3" /> Add Option
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Variants matrix */}
      {attributes.length > 0 && attributes.every((a) => a.name && a.options.every((o) => o)) && (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <Label className="text-sm font-bold text-navy">
              Variant Price Matrix ({variants.length} {variants.length === 1 ? 'variant' : 'variants'})
            </Label>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Bulk set all prices to:</span>
              <Input
                type="number"
                placeholder="₹"
                className="h-8 w-24 border-border text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    bulkApplyPrice((e.target as HTMLInputElement).value)
                  }
                }}
              />
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto scroll-elegant rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-cream/95 backdrop-blur">
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  {attributes.map((a, i) => (
                    <th key={i} className="px-3 py-2 text-left">{a.name}</th>
                  ))}
                  <th className="px-3 py-2 text-right">Price (₹)</th>
                  <th className="px-3 py-2 text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {variants.map((v, i) => (
                  <tr key={i} className="hover:bg-cream/40">
                    {attributes.map((a, ai) => (
                      <td key={ai} className="px-3 py-2 text-foreground/80">{v.options[a.name] || '—'}</td>
                    ))}
                    <td className="px-3 py-2 text-right">
                      <Input
                        type="number"
                        value={v.price || ''}
                        onChange={(e) => updateVariantPrice(i, parseFloat(e.target.value) || 0)}
                        className="ml-auto h-8 w-28 border-border text-right text-sm"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Input
                        type="number"
                        value={v.stock ?? 9999}
                        onChange={(e) => updateVariantStock(i, parseInt(e.target.value) || 0)}
                        className={`ml-auto h-8 w-24 border-border text-right text-sm ${(v.stock ?? 9999) === 0 ? 'border-red-400 bg-red-50' : (v.stock ?? 9999) < 10 ? 'border-amber-400 bg-amber-50' : ''}`}
                        placeholder="9999"
                      />
                      {(v.stock ?? 9999) === 0 && <span className="ml-1 text-[10px] font-bold text-red-600">OUT</span>}
                      {(v.stock ?? 9999) > 0 && (v.stock ?? 9999) < 10 && <span className="ml-1 text-[10px] font-bold text-amber-600">LOW</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Base price (shown on shop card) auto-updates to the lowest variant price.
          </p>
        </div>
      )}
    </div>
  )
}
