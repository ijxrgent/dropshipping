'use client'

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from 'react'
import { useSession } from 'next-auth/react'

interface CartCountContextValue {
  count: number
  refreshCount: () => void
}

const CartCountContext = createContext<CartCountContextValue>({
  count: 0,
  refreshCount: () => {},
})

export function CartCountProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const [count, setCount] = useState(0)

  const refreshCount = useCallback(async () => {
    if (status !== 'authenticated') {
      setCount(0)
      return
    }
    try {
      const res = await fetch('/api/cart/count')
      const data = await res.json()
      setCount(data.count ?? 0)
    } catch {
      setCount(0)
    }
  }, [status])

  useEffect(() => {
    if (status === 'loading') return

    async function loadCount() {
      if (status !== 'authenticated') {
        setCount(0)
        return
      }

      try {
        const res = await fetch('/api/cart/count')
        const data = await res.json()
        setCount(data.count ?? 0)
      } catch {
        setCount(0)
      }
    }

    loadCount()
  }, [status])

  return (
    <CartCountContext.Provider value={{ count, refreshCount }}>
      {children}
    </CartCountContext.Provider>
  )
}

export function useCartCount() {
  return useContext(CartCountContext)
}
