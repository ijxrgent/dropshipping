import Header from '@/components/header/Header'
import MobileFooterNav from '@/components/MobileFooterNav'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <div className="pb-16 sm:pb-0">{children}</div>
      <MobileFooterNav />
    </>
  )
}
