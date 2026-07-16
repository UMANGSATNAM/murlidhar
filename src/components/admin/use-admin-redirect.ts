'use client'

// Redirect to login when admin is null. Use inside admin page components.
import * as React from 'react'
import { useRouter } from 'next/navigation'

export function useAdminRedirect(admin: any, loading: boolean) {
  const router = useRouter()
  React.useEffect(() => {
    if (!loading && !admin) {
      router.replace('/admin')
    }
  }, [admin, loading, router])
}
