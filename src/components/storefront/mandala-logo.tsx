// SVG mandala + flute logo for Murlidhar Offset — used as inline component
// so it renders crisp at any size and we can theme the colors via currentColor.
import * as React from 'react'

export function MandalaLogo({ className = '', size = 48 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      {/* Outer navy disc */}
      <circle cx="50" cy="50" r="48" fill="#0f1b33" />
      <circle cx="50" cy="50" r="47" fill="none" stroke="#0d9488" strokeWidth="0.8" />

      {/* Mandala petals — 16 fold */}
      <g stroke="#0d9488" strokeWidth="0.6" fill="none" opacity="0.85">
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i * 360) / 16
          return (
            <g key={i} transform={`rotate(${a} 50 50)`}>
              <path d="M50 14 C54 24, 54 30, 50 36 C46 30, 46 24, 50 14 Z" />
              <circle cx="50" cy="20" r="0.8" fill="#0d9488" stroke="none" />
            </g>
          )
        })}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i * 360) / 16 + 11.25
          return (
            <line
              key={i}
              x1="50"
              y1="36"
              x2="50"
              y2="40"
              transform={`rotate(${a} 50 50)`}
              opacity="0.5"
            />
          )
        })}
      </g>

      {/* Inner concentric rings */}
      <g fill="none" stroke="#0d9488" opacity="0.7">
        <circle cx="50" cy="50" r="32" strokeWidth="0.5" strokeDasharray="1 2" />
        <circle cx="50" cy="50" r="26" strokeWidth="0.6" />
        <circle cx="50" cy="50" r="20" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
      </g>

      {/* Center — Krishna flute (bansuri) vertical */}
      <g>
        {/* Flute body */}
        <rect x="48" y="38" width="4" height="24" rx="2" fill="#0d9488" />
        {/* Mouth hole */}
        <ellipse cx="50" cy="42" rx="1.2" ry="0.8" fill="#0f1b33" />
        {/* Finger holes */}
        <circle cx="50" cy="48" r="0.7" fill="#0f1b33" />
        <circle cx="50" cy="52" r="0.7" fill="#0f1b33" />
        <circle cx="50" cy="56" r="0.7" fill="#0f1b33" />
        {/* End caps */}
        <circle cx="50" cy="38" r="1.6" fill="#2dd4bf" />
        <circle cx="50" cy="62" r="1.6" fill="#2dd4bf" />
      </g>

      {/* Tiny gold dot accents around */}
      <g fill="#0d9488">
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * 360) / 8
          const r = 44
          const x = 50 + r * Math.cos((a * Math.PI) / 180)
          const y = 50 + r * Math.sin((a * Math.PI) / 180)
          return <circle key={i} cx={x} cy={y} r="0.9" />
        })}
      </g>
    </svg>
  )
}

export function LogoWordmark({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <MandalaLogo size={compact ? 36 : 44} />
      <div className="flex flex-col leading-none">
        <span
          className="font-display text-lg font-bold tracking-tight text-navy"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Murlidhar
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold-deep">
          Offset · Unjha
        </span>
      </div>
    </div>
  )
}
