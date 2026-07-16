'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart, Image as ImageIcon,
  FileText, Star, Settings, LogOut, Menu, ExternalLink, Bell, ChevronRight, MessageSquareQuote, Mail, TrendingDown, Award, Tag,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { MandalaLogo } from '@/components/storefront/mandala-logo'

interface AdminInfo { id: string; email: string; name?: string; role: string }

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/bundles', label: 'Bundles', icon: Tag },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquareQuote },
  { href: '/admin/subscribers', label: 'Subscribers', icon: Mail },
  { href: '/admin/bulk-tiers', label: 'Bulk Discounts', icon: TrendingDown },
  { href: '/admin/loyalty', label: 'Loyalty Program', icon: Award },
  { href: '/admin/banners', label: 'Banners & Hero', icon: ImageIcon },
  { href: '/admin/blog', label: 'Blog Posts', icon: FileText },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { href: '/admin/settings', label: 'Site Settings', icon: Settings },
]

// Sidebar content extracted as a top-level component (avoids lint error
// about creating components during render)
function SidebarContent({
  pathname,
  admin,
  onNavigate,
  onLogout,
}: {
  pathname: string
  admin: AdminInfo
  onNavigate?: () => void
  onLogout: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-cream/10 bg-navy-deep p-4">
        <Link href="/admin/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
          <MandalaLogo size={42} />
          <div>
            <p className="font-display text-base font-bold text-cream">Murlidhar Offset</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? 'bg-gold text-navy shadow-sm'
                  : 'text-cream/70 hover:bg-cream/10 hover:text-cream'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {active && <ChevronRight className="ml-auto h-4 w-4" />}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-2 border-t border-cream/10 p-3">
        <div className="rounded-md bg-white/5 p-3">
          <p className="text-xs font-semibold text-cream">{admin.name || 'Admin'}</p>
          <p className="text-[10px] text-cream/60">{admin.email}</p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-cream/70 hover:bg-cream/10 hover:text-cream"
        >
          <ExternalLink className="h-3.5 w-3.5" /> View Live Site
        </Link>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-cream/70 hover:bg-destructive/20 hover:text-destructive"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </button>
      </div>
    </div>
  )
}

export function AdminShell({ children, admin }: { children: React.ReactNode; admin: AdminInfo | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const logout = async () => {
    await fetch('/api/auth/admin/logout', { method: 'POST' })
    router.push('/admin')
    router.refresh()
  }

  if (!admin) {
    return <div className="min-h-screen bg-cream">{children}</div>
  }

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-navy lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent pathname={pathname} admin={admin} onLogout={logout} />
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button className="fixed left-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-md bg-navy text-cream lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-navy p-0">
          <SidebarContent pathname={pathname} admin={admin} onNavigate={() => setMobileOpen(false)} onLogout={logout} />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white/95 px-4 py-3 backdrop-blur lg:px-6">
          <div className="ml-12 lg:ml-0">
            <h1 className="font-display text-lg font-bold text-navy">
              {NAV.find((n) => pathname.startsWith(n.href))?.label || 'Admin'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank" className="hidden items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-navy hover:bg-secondary sm:inline-flex">
              <ExternalLink className="h-3.5 w-3.5" /> View Site
            </Link>
            <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-navy hover:bg-secondary" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gold" />
            </button>
            <div className="flex items-center gap-2 rounded-full bg-navy px-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy">
                {(admin.name || admin.email).charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-xs font-medium text-cream sm:inline">{admin.name || 'Admin'}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}

// Hook to fetch admin info client-side
export function useAdmin() {
  const [admin, setAdmin] = React.useState<AdminInfo | null>(null)
  const [loading, setLoading] = React.useState(true)
  React.useEffect(() => {
    fetch('/api/auth/admin/me')
      .then((r) => r.json())
      .then((d) => setAdmin(d.admin || null))
      .finally(() => setLoading(false))
  }, [])
  return { admin, loading, setAdmin }
}
