'use client'

import * as React from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import Image from 'next/image'

interface LightboxImage {
  url: string
  alt?: string
}

export function ImageLightbox({
  images,
  startIndex = 0,
  open,
  onClose,
}: {
  images: LightboxImage[]
  startIndex?: number
  open: boolean
  onClose: () => void
}) {
  const [idx, setIdx] = React.useState(startIndex)
  const [zoom, setZoom] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIdx(startIndex)
      setZoom(1)
      setRotation(0)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, startIndex])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + images.length) % images.length)
      else if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % images.length)
      else if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(4, z + 0.5))
      else if (e.key === '-') setZoom((z) => Math.max(1, z - 0.5))
      else if (e.key.toLowerCase() === 'r') setRotation((r) => (r + 90) % 360)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, images.length, onClose])

  if (!open || images.length === 0) return null

  const current = images[idx]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-deep/95 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
        <span className="text-sm font-medium text-muted-foreground">
          {idx + 1} / {images.length}
          {current.alt && <span className="ml-3 text-muted-foreground">· {current.alt}</span>}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
            disabled={zoom <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-foreground transition hover:bg-gold hover:text-navy disabled:opacity-40 disabled:hover:bg-cream/10 disabled:hover:text-foreground"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <span className="min-w-12 text-center text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(4, z + 0.5))}
            disabled={zoom >= 4}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-foreground transition hover:bg-gold hover:text-navy disabled:opacity-40"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-foreground transition hover:bg-gold hover:text-navy"
            aria-label="Rotate"
          >
            <RotateCw className="h-5 w-5" />
          </button>
          <button
            onClick={() => { setZoom(1); setRotation(0) }}
            className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-foreground transition hover:bg-gold hover:text-navy"
            aria-label="Reset"
          >
            <span className="text-xs font-bold">1:1</span>
          </button>
          <button
            onClick={onClose}
            className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/80 text-white transition hover:bg-destructive"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div
        className="relative flex h-[85vh] w-[90vw] items-center justify-center overflow-hidden"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        { }
        <Image
          src={current.url}
          alt={current.alt || ''}
          fill
          sizes="90vw"
          className="object-contain transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
          }}
          draggable={false}
        />
      </div>

      {/* Prev / next */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => { setIdx((i) => (i - 1 + images.length) % images.length); setZoom(1); setRotation(0) }}
            className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-foreground transition hover:bg-gold hover:text-navy"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => { setIdx((i) => (i + 1) % images.length); setZoom(1); setRotation(0) }}
            className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-foreground transition hover:bg-gold hover:text-navy"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Thumbnails strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-background/60 p-2 backdrop-blur">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => { setIdx(i); setZoom(1); setRotation(0) }}
              className={`relative h-12 w-12 overflow-hidden rounded-md border-2 transition ${
                i === idx ? 'border-gold shadow-gold' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              { }
              <Image src={img.url} alt={img.alt || ''} fill sizes="48px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Hint */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-background/40 px-3 py-1 text-[10px] text-muted-foreground backdrop-blur">
        Use ← → keys to navigate · +/− to zoom · R to rotate · Esc to close
      </div>
    </div>
  )
}
