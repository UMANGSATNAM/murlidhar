import { cookies } from 'next/headers'
import { clearSessionCookie, serializeCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('mo_admin_session')
  const res = Response.json({ ok: true })
  res.headers.set('Set-Cookie', serializeCookie(clearSessionCookie()))
  return res
}
