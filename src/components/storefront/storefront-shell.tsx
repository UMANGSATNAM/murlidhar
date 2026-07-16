// Shared storefront shell: wraps children with header + main + sticky footer.
import * as React from 'react'
import { Header } from './header'
import { Footer } from './footer'
import { FloatingWhatsApp } from './floating-whatsapp'

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  )
}

export function StarRating({
  rating,
  count,
  size = 14,
  showCount = true,
}: {
  rating: number
  count?: number
  size?: number
  showCount?: boolean
}) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const isFull = i < full
          const isHalf = i === full && half
          return (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              width={size}
              height={size}
              viewBox="0 0 24 24"
              className={isFull || isHalf ? 'text-gold' : 'text-muted-foreground/30'}
              fill="currentColor"
            >
              {isHalf ? (
                <>
                  <defs>
                    <linearGradient id={`half-${i}-${rating}`}>
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <path
                    fill={`url(#half-${i}-${rating})`}
                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                  />
                </>
              ) : (
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              )}
            </svg>
          )
        })}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-muted-foreground">
          {rating.toFixed(1)} ({count})
        </span>
      )}
    </div>
  )
}
