import Header from '@/components/header/Header'
import HeaderNavWrapper from '@/components/header/HeaderNavWrapper'
import MobileFooterNav from '@/components/MobileFooterNav'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <HeaderNavWrapper />
      <div className="pb-16 sm:pb-0">{children}</div>
      <MobileFooterNav />
    </>
  )
}
