import SessionProvider from '@/components/SessionProvider'
import { CartCountProvider } from '@/components/header/CartCountProvider'
import './globals.css'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <CartCountProvider>{children}</CartCountProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
