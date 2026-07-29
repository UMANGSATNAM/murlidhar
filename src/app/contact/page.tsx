'use client'

import * as React from 'react'
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, Loader2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { StorefrontShell } from '@/components/storefront/storefront-shell'
import { SectionHeader } from '@/components/storefront/section-bits'
import { toast as sonnerToast } from 'sonner'

export default function ContactPage() {
  const [form, setForm] = React.useState({ name: '', phone: '', email: '', message: '' })
  const [submitting, setSubmitting] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.message) {
      sonnerToast.error('Please fill name, phone and message')
      return
    }
    setSubmitting(true)
    // Best-effort — store as a remark-only "order" so admin can see enquiries
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          phone: form.phone,
          email: form.email,
          remarks: `[ENQUIRY] ${form.message}`,
          items: [{ productId: null, productName: 'General Enquiry', qty: 1, unitPrice: 0 }],
          paymentMethod: 'cod',
        }),
      })
      setSent(true)
      setForm({ name: '', phone: '', email: '', message: '' })
      sonnerToast.success('Message sent! We will call you back shortly.')
    } catch (err: any) {
      sonnerToast.error(err.message || 'Failed to send message')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <StorefrontShell>
      <section className="bg-gradient-to-b from-background to-secondary/20 py-14 text-foreground">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-gold" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">Get in Touch</span>
            <span className="h-px w-8 bg-gold" />
          </div>
          <h1 className="font-display text-4xl font-bold sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
            Contact <span className="text-gold-gradient">Murlidhar Offset</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">We're open 24 hours — call, WhatsApp, or visit us anytime.</p>
        </div>
              </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Contact info */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <a href="tel:9510737852" className="flex flex-col items-center gap-2 border-b border-r border-border p-6 text-center transition hover:bg-secondary/40 sm:border-b-0">
                  <Phone className="h-8 w-8 text-gold" />
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Call us</p>
                  <p className="font-display text-base font-bold text-navy">9510737852</p>
                  <p className="text-xs text-muted-foreground">079160 29127</p>
                </a>
                <a href="https://wa.me/919510737852" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 border-b border-border p-6 text-center transition hover:bg-secondary/40 sm:border-b-0">
                  <MessageCircle className="h-8 w-8 text-gold" />
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">WhatsApp</p>
                  <p className="font-display text-base font-bold text-navy">Chat with us</p>
                  <p className="text-xs text-muted-foreground">Quick replies</p>
                </a>
                <a href="mailto:murlidharoffset84@gmail.com" className="flex flex-col items-center gap-2 border-r border-border p-6 text-center transition hover:bg-secondary/40">
                  <Mail className="h-8 w-8 text-gold" />
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                  <p className="font-display text-sm font-bold text-navy break-all">murlidharoffset84@gmail.com</p>
                </a>
                <div className="flex flex-col items-center gap-2 p-6 text-center">
                  <Clock className="h-8 w-8 text-gold" />
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Hours</p>
                  <p className="font-display text-base font-bold text-navy">Open 24 hours</p>
                  <p className="text-xs text-muted-foreground">All days of the week</p>
                </div>
              </div>
            </Card>

            <Card className="flex items-start gap-3 p-5">
              <MapPin className="mt-1 h-6 w-6 shrink-0 text-gold" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Our Shop</p>
                <p className="font-display text-base font-bold text-navy">Shreeji Super Market, 7, Unjha, Gujarat 384170</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-teal text-teal" /> 5.0 Google Rating
                </p>
              </div>
            </Card>

            <div className="overflow-hidden rounded-xl border-2 border-gold/30 shadow-sm">
              <iframe
                title="Murlidhar Offset location"
                src="https://www.google.com/maps?q=Unjha,Gujarat,384170&output=embed"
                width="100%"
                height="280"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>

          {/* Contact form */}
          <Card className="card-premium overflow-hidden">
            <div className="bg-gradient-to-b from-background to-secondary/20 p-5 text-foreground">
              <h2 className="font-display text-xl font-bold">Send Us a Message</h2>
              <p className="text-sm text-muted-foreground">Fill in the form and we'll call you back as soon as possible.</p>
            </div>
            {sent ? (
              <div className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Send className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-display text-xl font-bold text-navy">Message Sent!</h3>
                <p className="text-sm text-muted-foreground">Thank you for reaching out. Our team will contact you shortly.</p>
                <Button onClick={() => setSent(false)} variant="outline" className="border-navy text-navy">Send Another Message</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                <div>
                  <Label htmlFor="c-name">Full Name *</Label>
                  <Input id="c-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 border-border" placeholder="Your name" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="c-phone">Phone *</Label>
                    <Input id="c-phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 border-border" placeholder="9510737852" />
                  </div>
                  <div>
                    <Label htmlFor="c-email">Email</Label>
                    <Input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 border-border" placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="c-message">Message *</Label>
                  <Textarea id="c-message" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1 resize-none border-border" rows={5} placeholder="Tell us what you need — visiting cards, wedding cards, banners, etc." />
                </div>
                <Button type="submit" size="lg" className="w-full bg-gold text-navy hover:bg-gold-deep hover:text-foreground" disabled={submitting}>
                  {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>) : (<>Send Message <Send className="ml-2 h-4 w-4" /></>)}
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">By submitting, you agree to be contacted by Murlidhar Offset regarding your enquiry.</p>
              </form>
            )}
          </Card>
        </div>
      </section>
    </StorefrontShell>
  )
}
