import { getAdminFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return Response.json({ admin: null }, { status: 200 })
  return Response.json({ admin })
}
