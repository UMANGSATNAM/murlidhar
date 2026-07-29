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
        <div className={`mb-4 flex items-center gap-2 ${center ? 'justify-center' : ''}`}>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] shadow-sm animate-fade-slide-up ${
            light
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>{eyebrow}</span>
        </div>
      )}
      <h2
        className={`font-display text-3xl font-bold tracking-tight sm:text-4xl relative inline-block pb-3 ${
          light ? 'text-white' : 'text-navy'
        }`}
      >
        {title}
        {center && (
          <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-[3px] rounded-full ${
            light ? 'bg-amber-400' : 'bg-gradient-to-r from-amber-400 to-amber-600'
          }`} aria-hidden="true" />
        )}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-base leading-relaxed ${
          light ? 'text-white/70' : 'text-muted-foreground'
        }`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

