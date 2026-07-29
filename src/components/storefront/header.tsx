'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  Menu,
  X,
  ShoppingBag,
  Phone,
  Search,
  ChevronDown,
  Heart,
  GitCompare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useCart } from '@/lib/cart-store'
import { useWishlist } from '@/lib/wishlist-store'
import { useCompare } from '@/lib/compare-store'
import { CartDrawer } from './cart-drawer'
import { WishlistDrawer } from './wishlist-drawer'
import { CompareDrawer } from './compare-drawer'
import { SearchAutocomplete } from './search-autocomplete'
import { AnnouncementBar } from './announcement-bar'

const NAV = [
  { href: '/about', label: 'About Us' },
  { href: '/shop', label: 'Shop' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/services', label: 'Services' },
  { href: '/blog', label: 'Blog' },
]

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const cartCount = useCart((s) => s.items.reduce((a, i) => a + i.qty, 0))
  const wishlistCount = useWishlist((s) => s.items.length)
  const compareCount = useCompare((s) => s.items.length)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Announcement bar (top) */}
      <AnnouncementBar />

      {/* Top utility bar */}
      <div className="bg-gradient-to-r from-navy-deep to-navy text-white/80 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5">
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-amber-400" />
            <a href="tel:9510737852" className="hover:text-amber-300 transition-colors">9510737852</a>
            <span className="hidden sm:inline text-white/40">·</span>
            <span className="hidden sm:inline">Open 24 hours · Unjha, Gujarat</span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[11px] tracking-wide">
            <Link href="/track" className="hover:text-amber-300 transition-colors">Track Order</Link>
            <span className="text-white/40">·</span>
            <span className="text-amber-400 font-medium">Quality Printing · Lasting Impression</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div
        className={`border-b transition-all ${
          scrolled
            ? 'bg-background/95 backdrop-blur shadow-sm'
            : 'bg-background border-border'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="shrink-0 group flex items-center gap-3" aria-label="Murlidhar Offset — Home">
            <div className="relative h-10 w-10 overflow-hidden rounded-md transition-transform group-hover:scale-105">
              <Image src="/images/brand-logo.jpg" alt="Murlidhar Offset Logo" fill className="object-cover" />
            </div>
            <span className="font-display text-xl font-extrabold text-foreground tracking-tight hidden sm:inline-block">Murlidhar Offset</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-semibold transition-colors rounded-md group ${
                    active ? 'text-foreground' : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  {item.label}
                  <span className={`absolute inset-x-3 -bottom-0.5 h-0.5 bg-amber-500 transition-transform duration-300 ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                </Link>
              )
            })}
          </nav>

          {/* Desktop search */}
          <div className="hidden xl:block w-64">
            <SearchAutocomplete />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Mobile search trigger */}
            <button
              onClick={() => setSearchOpen((s) => !s)}
              className="xl:hidden inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 hover:bg-secondary hover:text-navy transition-colors"
              aria-label="Search products"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Wishlist */}
            <WishlistDrawer>
              <button
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-secondary transition-colors"
                aria-label={`Wishlist with ${wishlistCount} items`}
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </button>
            </WishlistDrawer>

            {/* Compare */}
            <CompareDrawer>
              <button
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-secondary transition-colors"
                aria-label={`Compare ${compareCount} products`}
              >
                <GitCompare className="h-5 w-5" />
                {compareCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
                    {compareCount}
                  </span>
                )}
              </button>
            </CompareDrawer>

            <CartDrawer>
              <button
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-secondary transition-colors"
                aria-label={`Cart with ${cartCount} items`}
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </CartDrawer>

            <Button asChild size="sm" className="hidden md:inline-flex bg-amber-500 text-white hover:bg-amber-600 rounded-lg shadow-sm">
              <Link href="/shop">Order Now</Link>
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-secondary"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-background p-0">
                <SheetHeader className="border-b border-border bg-muted/50 px-5 py-4">
                  <SheetTitle className="flex items-center gap-3 text-foreground">
                    <div className="relative h-8 w-8 overflow-hidden rounded-sm">
                      <Image src="/images/brand-logo.jpg" alt="Murlidhar Offset Logo" fill className="object-cover" />
                    </div>
                    <span className="font-display text-lg font-bold text-foreground">Murlidhar Offset</span>
                  </SheetTitle>
                </SheetHeader>
                {/* Mobile search */}
                <div className="border-b border-border p-3">
                  <SearchAutocomplete />
                </div>
                <nav className="flex flex-col p-2">
                  {NAV.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                          active ? 'bg-secondary text-navy' : 'text-foreground/80 hover:bg-secondary/60'
                        }`}
                      >
                        {item.label}
                        <ChevronDown className="h-4 w-4 -rotate-90 opacity-50" />
                      </Link>
                    )
                  })}
                  <Link
                    href="/track"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-md px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-secondary/60"
                  >
                    Track Order
                    <ChevronDown className="h-4 w-4 -rotate-90 opacity-50" />
                  </Link>
                  <div className="mt-3 border-t border-border pt-3">
                    <Button asChild className="w-full bg-amber-500 text-white hover:bg-amber-600 rounded-lg">
                      <Link href="/shop" onClick={() => setMobileOpen(false)}>
                        <ShoppingBag className="mr-2 h-4 w-4" /> Start Order
                      </Link>
                    </Button>
                  </div>
                  <a
                    href="tel:9510737852"
                    className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700"
                  >
                    <Phone className="h-4 w-4 text-accent" /> Call 9510737852
                  </a>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile search dropdown */}
        {searchOpen && (
          <div className="xl:hidden border-t border-border bg-background px-4 py-3 animate-in slide-in-from-top-2 duration-200">
            <SearchAutocomplete />
          </div>
        )}
      </div>
    </header>
  )
}
