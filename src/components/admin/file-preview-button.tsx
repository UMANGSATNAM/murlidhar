'use client'

import * as React from 'react'
import { Eye, X, Download, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface OrderFile {
  id: string
  fileName: string
  filePath: string
  fileSize: number
  fileType?: string | null
}

export function FilePreviewButton({ file }: { file: OrderFile }) {
  const [open, setOpen] = React.useState(false)
  const [zoom, setZoom] = React.useState(1)
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.fileName)
  const isPdf = /\.pdf$/i.test(file.fileName)

  React.useEffect(() => {
    if (!open) setZoom(1)
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-navy/30 px-3 py-1.5 text-xs font-bold text-navy transition hover:bg-navy hover:text-white"
        title="Preview file"
      >
        <Eye className="h-3.5 w-3.5" /> Preview
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl !p-0 overflow-hidden">
          <DialogTitle className="sr-only">Preview: {file.fileName}</DialogTitle>
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-border bg-navy px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-2">
              <Eye className="h-4 w-4 shrink-0 text-gold" />
              <span className="truncate text-sm font-semibold">{file.fileName}</span>
              <span className="shrink-0 text-xs text-white/60">
                ({(file.fileSize / 1024).toFixed(0)} KB)
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {isImage && (
                <>
                  <button
                    onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-gold hover:text-navy"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-xs text-white/70">{Math.round(zoom * 100)}%</span>
                  <button
                    onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-gold hover:text-navy"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </>
              )}
              <a
                href={file.filePath}
                download={file.fileName}
                className="inline-flex items-center gap-1 rounded-md bg-gold px-2.5 py-1 text-xs font-bold text-navy hover:bg-gold-soft"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </a>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-destructive"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[75vh] overflow-auto bg-secondary/30 p-4">
            {isImage ? (
              <div className="flex items-center justify-center">
                { }
                <img
                  src={file.filePath}
                  alt={file.fileName}
                  className="max-w-full transition-transform"
                  style={{ transform: `scale(${zoom})` }}
                />
              </div>
            ) : isPdf ? (
              <iframe
                src={file.filePath}
                title={file.fileName}
                className="h-[70vh] w-full rounded-lg border border-border bg-white"
              />
            ) : (
              <div className="p-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Preview not available for this file type. Please download to view.
                </p>
                <a
                  href={file.filePath}
                  download={file.fileName}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 text-sm font-bold text-navy hover:bg-gold-deep"
                >
                  <Download className="h-4 w-4" /> Download File
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
