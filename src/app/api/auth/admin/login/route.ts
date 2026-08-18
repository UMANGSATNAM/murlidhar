import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword, createSessionCookie, serializeCookie } from '@/lib/auth'
import { seedDatabase } from '@/lib/seed'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { email, password } = body
    if (!email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 })
    }
    const cleanEmail = email.toLowerCase().trim()
    let admin = await db.adminUser.findUnique({ where: { email: cleanEmail } })

    // Auto-create superadmin or seed if empty database
    if (!admin) {
      const adminCount = await db.adminUser.count().catch(() => 0)
      if (adminCount === 0 || cleanEmail === 'admin@murlidharoffset.com') {
        try {
          await seedDatabase()
          admin = await db.adminUser.findUnique({ where: { email: cleanEmail } })
        } catch (seedErr) {
          console.error('Auto-seed error:', seedErr)
        }

        // If seed didn't create this specific admin, create it directly
        if (!admin) {
          const isDefault = cleanEmail === 'admin@murlidharoffset.com' && password === '1234'
          admin = await db.adminUser.create({
            data: {
              email: cleanEmail,
              passwordHash: hashPassword(isDefault ? '1234' : password),
              name: 'Prince Patel',
              role: 'superadmin',
            },
          })
        }
      }
    }

    if (!admin || !verifyPassword(password, admin.passwordHash)) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const cookie = createSessionCookie({ id: admin.id, email: admin.email, role: admin.role })
    const res = Response.json({ ok: true, admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } })
    res.headers.set('Set-Cookie', serializeCookie(cookie))
    return res
  } catch (err: any) {
    console.error('Login route error:', err)
    return Response.json({ error: err.message || 'Server error during login' }, { status: 500 })
  }
}
