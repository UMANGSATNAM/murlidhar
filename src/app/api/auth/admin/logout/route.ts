import { clearSessionCookie, serializeCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  const res = Response.json({ ok: true })
  res.headers.set('Set-Cookie', serializeCookie(clearSessionCookie()))
  return res
}
