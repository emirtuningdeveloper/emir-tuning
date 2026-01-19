'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from 'firebase/auth'
import { onAuthChange, isAdmin } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

interface AdminRouteProps {
  children: React.ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthChange((user: User | null) => {
      if (user && isAdmin(user)) {
        setAuthorized(true)
      } else {
        router.push('/admin/login')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return <>{children}</>
}
