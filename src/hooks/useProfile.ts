//src/hooks/useProfile.ts
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  name: string
  email: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  phone: string | null
  avatarUrl: string | null
  createdAt: string
}

interface RecentOrder {
  id: string
  total: number
  status: string
  createdAt: string
  orderItems: { product: { name: string } }[]
}

export function useProfile() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)

        const profileRes = await fetch('/api/profile')
        const profileText = await profileRes.text()
        let profileData
        try {
          profileData = JSON.parse(profileText)
        } catch (parseError) {
          console.error('Error parsing profile:', parseError)
        }

        const ordersRes = await fetch('/api/orders/recent')
        const ordersText = await ordersRes.text()
        let ordersData
        try {
          ordersData = JSON.parse(ordersText)
        } catch (parseError) {
          console.error('Error parsing orders:', parseError)
        }

        if (profileRes.ok && ordersRes.ok && profileData && ordersData) {
          setUser(profileData)
          setOrders(ordersData)
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const updateUser = (data: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev))
  }

  return { user, orders, loading, updateUser, router }
}
