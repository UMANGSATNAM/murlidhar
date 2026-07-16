// Decorative mandala divider — thin gold pattern strip.
import * as React from 'react'

export function MandalaDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`mandala-divider ${className}`} aria-hidden="true" />
  )
}

// Section header with gold accent above title
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  center = true,
  light = false,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  center?: boolean
  light?: boolean
}) {
  return (
    <div className={`${center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}`}>
      {eyebrow && (
        <div className={`mb-3 flex items-center gap-2 ${center ? 'justify-center' : ''}`}>
          <span className="h-px w-8 bg-gold" />
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold-deep">{eyebrow}</span>
          <span className="h-px w-8 bg-gold" />
        </div>
      )}
      <h2
        className={`font-display text-3xl font-bold tracking-tight sm:text-4xl ${
          light ? 'text-cream' : 'text-navy'
        }`}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-base leading-relaxed ${light ? 'text-cream/70' : 'text-muted-foreground'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
