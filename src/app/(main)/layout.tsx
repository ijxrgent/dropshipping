import Header from '@/components/header/Header'
import SessionProvider from '@/components/SessionProvider'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <Header />
      {children}
    </SessionProvider>
  )
}
